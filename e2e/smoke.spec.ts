import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

function coletarErros(page: Page): string[] {
  const erros: string[] = [];
  page.on("console", (msg) => { if (msg.type() === "error") erros.push(msg.text()); });
  page.on("pageerror", (e) => erros.push(e.message));
  return erros;
}

async function semRolagemHorizontal(page: Page) {
  const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(scroll).toBeLessThanOrEqual(client);
}

const PAGINAS: [string, string][] = [
  ["/", "Liga Replay"],
  ["/jogos", "Jogos"],
  ["/classificacao", "Classificação"],
  ["/estatisticas", "Estatísticas"],
  ["/times", "Times"],
  ["/mata-mata", "Mata-mata"],
];

for (const [rota, titulo] of PAGINAS) {
  test(`página ${rota} abre no celular sem erros`, async ({ page }) => {
    const erros = coletarErros(page);
    await page.goto(rota);
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    await page.waitForTimeout(1500);
    await semRolagemHorizontal(page);
    expect(erros).toEqual([]);
  });
}

test("classificação e artilharia vêm da rodada 1", async ({ page }) => {
  await page.goto("/classificacao");
  await expect(page.getByRole("heading", { name: "Grupo A" })).toBeVisible();
  await expect(page.locator("tbody tr").first()).toBeVisible();
  await page.goto("/estatisticas");
  await expect(page.locator("li[data-player]").first()).toBeVisible();
});

test("mesário lança gol, encerra e a classificação atualiza", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("mesario@teste.com");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar (emulador)" }).click();
  await expect(page.getByRole("heading", { name: "Minha conta" })).toBeVisible();

  await page.goto("/mesario");
  const jogo = page.getByRole("link").filter({ hasText: "agendado" }).first();
  await jogo.click();

  await expect(page.getByRole("heading", { name: "Escalação" })).toBeVisible();
  const primeiroTime = page.getByRole("heading", { level: 2 }).first();
  await expect(primeiroTime).not.toHaveText(/^time-/);
  const mandante = (await primeiroTime.innerText()).trim();
  const url = page.url();

  // pontos do mandante antes do jogo
  await page.goto("/classificacao");
  const linha = page.locator("tbody tr", { hasText: mandante }).first();
  const ptsAntes = Number(await linha.locator("td").last().innerText());

  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Escalação" })).toBeVisible();
  const radios = page.locator('input[type="radio"]');
  const grupos = () => radios.evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLInputElement).name))]);
  await expect.poll(async () => (await grupos()).length).toBe(2); // espera os elencos dos dois times
  const nomesGrupos = await grupos();
  for (const nome of nomesGrupos) await page.locator(`input[type="radio"][name="${nome}"]`).first().check();
  await page.getByRole("button", { name: "Iniciar jogo" }).click();

  await page.getByRole("button", { name: "Gol", exact: true }).click();
  await page.getByRole("button", { name: mandante }).click();
  await page.getByRole("group", { name: "Autor do gol" }).getByRole("button").first().click();
  await page.getByRole("button", { name: "Sem assistência" }).click();
  await expect(page.getByText("1 × 0")).toBeVisible();

  await page.getByRole("button", { name: "Encerrar jogo" }).click();
  await page.getByLabel("MVP do jogo").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Confirmar encerramento" }).click();
  await expect(page.getByText(/jogo encerrado/i)).toBeVisible();

  await page.goto("/classificacao");
  await expect(page.locator("tbody tr", { hasText: mandante }).first().locator("td").last()).toHaveText(String(ptsAntes + 3), { timeout: 20000 });
});
