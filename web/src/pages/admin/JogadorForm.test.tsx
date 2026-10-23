import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import JogadorForm from "./JogadorForm";

vi.mock("../../components/ImageUpload", () => ({ default: () => null }));

const preencherBasico = async (nascimento: string) => {
  await userEvent.type(screen.getByLabelText("Nome completo"), "João da Silva");
  await userEvent.type(screen.getByLabelText("Apelido"), "Joãozinho");
  await userEvent.selectOptions(screen.getByLabelText("Posição"), "Fixo");
  await userEvent.type(screen.getByLabelText("Telefone"), "21999990000");
  await userEvent.type(screen.getByLabelText("Documento (CPF ou RG)"), "12345678901");
  await userEvent.type(screen.getByLabelText("Data de nascimento"), nascimento);
};

test("exige nome, apelido, posição e consentimento", async () => {
  const onSave = vi.fn();
  render(<JogadorForm onSave={onSave} hoje={new Date(2026, 9, 23)} />);
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByText(/preencha nome, apelido e posição/i)).toBeInTheDocument();
  await preencherBasico("1995-05-10");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByText(/consentimento/i)).toBeInTheDocument();
});

test("adulto: separa dados públicos e privados", async () => {
  const onSave = vi.fn(async () => {});
  render(<JogadorForm onSave={onSave} hoje={new Date(2026, 9, 23)} />);
  await preencherBasico("1995-05-10");
  await userEvent.click(screen.getByLabelText(/autorizou o uso dos dados/i));
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(onSave).toHaveBeenCalledTimes(1);
  const [publico, privado] = onSave.mock.calls[0] as unknown as [Record<string, unknown>, Record<string, unknown>];
  expect(publico).toMatchObject({ nome: "João da Silva", apelido: "Joãozinho", posicao: "Fixo", menor: false });
  for (const k of ["telefone", "documento", "dataNascimento"]) expect(publico).not.toHaveProperty(k);
  expect(privado).toMatchObject({ telefone: "21999990000", documento: "12345678901", dataNascimento: "1995-05-10" });
  expect(privado.responsavel).toBeUndefined();
});

test("menor de 18 exige responsável e marca menor", async () => {
  const onSave = vi.fn(async () => {});
  render(<JogadorForm onSave={onSave} hoje={new Date(2026, 9, 23)} />);
  await preencherBasico("2010-01-01");
  await userEvent.click(screen.getByLabelText(/autorizou o uso dos dados/i));
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent(/responsável/i);
  await userEvent.type(screen.getByLabelText("Nome do responsável"), "Maria da Silva");
  await userEvent.type(screen.getByLabelText("Telefone do responsável"), "21988887777");
  await userEvent.type(screen.getByLabelText("Documento do responsável"), "98765432100");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
  const [publico, privado] = onSave.mock.calls[0] as unknown as [Record<string, unknown>, Record<string, { nome: string }>];
  expect(publico.menor).toBe(true);
  expect(privado.responsavel.nome).toBe("Maria da Silva");
});
