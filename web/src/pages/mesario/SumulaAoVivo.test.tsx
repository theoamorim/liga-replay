import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, vi } from "vitest";
import type { Lineup, Match, MatchEvent } from "../../data/types";
import SumulaAoVivo from "./SumulaAoVivo";
import MeusJogos from "./MeusJogos";

const estado: { match: Match; events: MatchEvent[]; lineups: Lineup[] } = { match: null as unknown as Match, events: [], lineups: [] };
const acoes = { startMatch: vi.fn(), addEvent: vi.fn(), deleteEvent: vi.fn(), closeMatch: vi.fn(), saveLineups: vi.fn() };

vi.mock("../../data/matches", () => ({
  useMatch: () => ({ ...estado, loading: false }),
  sortEvents: (e: MatchEvent[]) => e,
  sortMatches: (m: Match[]) => m,
  useMesarioMatches: (uid: string) => ({ data: [
    { ...baseMatch("m1"), mesarioUid: uid }, { ...baseMatch("m2"), mesarioUid: "outro" },
  ].filter((m) => m.mesarioUid === uid), loading: false }),
}));
vi.mock("../../data/players", () => ({
  useRoster: (_s: string, teamId: string) => ({ data: teamId === "A" ? [{ playerId: "a1", teamId: "A", numero: 1, tipo: "inscrito" }, { playerId: "a2", teamId: "A", numero: 2, tipo: "inscrito" }] : [{ playerId: "b1", teamId: "B", numero: 1, tipo: "inscrito" }, { playerId: "b2", teamId: "B", numero: 9, tipo: "convidado" }], loading: false }),
  usePlayersByIds: () => ({ a1: { id: "a1", apelido: "Alfa1" }, a2: { id: "a2", apelido: "Alfa2" }, b1: { id: "b1", apelido: "Beta1" }, b2: { id: "b2", apelido: "Beta2" } }),
}));
vi.mock("../../data/teams", () => ({ useTeamMap: () => ({ A: { id: "A", nome: "Time A" }, B: { id: "B", nome: "Time B" } }) }));
vi.mock("../../data/sumula", () => ({
  startMatch: (...a: unknown[]) => acoes.startMatch(...a),
  addEvent: (...a: unknown[]) => acoes.addEvent(...a),
  deleteEvent: (...a: unknown[]) => acoes.deleteEvent(...a),
  closeMatch: (...a: unknown[]) => acoes.closeMatch(...a),
  saveLineups: (...a: unknown[]) => acoes.saveLineups(...a),
}));
vi.mock("../../auth/AuthContext", () => ({ useAuth: () => ({ user: { uid: "mes1" }, claims: { admin: false, mesario: true, capitaoDe: [] } }) }));

function baseMatch(id = "m1"): Match {
  return { id, seasonId: "s1", fase: "grupos", grupo: "A", rodada: 1, data: "2026-11-07", horario: "09:00", campo: "Campo 1",
    mandanteId: "A", visitanteId: "B", placar: { mandante: 0, visitante: 0 }, status: "ao-vivo", mesarioUid: "mes1" };
}

const renderSumula = () => render(
  <MemoryRouter initialEntries={["/mesario/m1"]}>
    <Routes><Route path="/mesario/:matchId" element={<SumulaAoVivo />} /></Routes>
  </MemoryRouter>,
);

beforeEach(() => {
  Object.values(acoes).forEach((f) => f.mockReset());
  estado.match = baseMatch();
  estado.events = [];
  estado.lineups = [{ teamId: "A", playerIds: ["a1", "a2"], goleiroId: "a2" }, { teamId: "B", playerIds: ["b1", "b2"], goleiroId: "b1" }];
});

test("lista só os jogos do mesário", () => {
  render(<MemoryRouter><MeusJogos /></MemoryRouter>);
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(1);
  expect(links[0]).toHaveAttribute("href", "/mesario/m1");
});

test("iniciar exige escalação com goleiro nos dois times", async () => {
  estado.match = { ...baseMatch(), status: "agendado" };
  estado.lineups = [];
  renderSumula();
  const iniciar = screen.getByRole("button", { name: "Iniciar jogo" });
  expect(iniciar).toBeDisabled();
  await userEvent.click(screen.getByRole("radio", { name: "Goleiro Time A: Alfa2" }));
  expect(iniciar).toBeDisabled();
  await userEvent.click(screen.getByRole("radio", { name: "Goleiro Time B: Beta1" }));
  expect(iniciar).toBeEnabled();
  await userEvent.click(iniciar);
  expect(acoes.startMatch).toHaveBeenCalledWith("m1", [
    { teamId: "A", playerIds: ["a1", "a2"], goleiroId: "a2" },
    { teamId: "B", playerIds: ["b1", "b2"], goleiroId: "b1" },
  ]);
});

test("gol: time → autor → assistente", async () => {
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: "Gol" }));
  await userEvent.click(screen.getByRole("button", { name: "Time A" }));
  await userEvent.click(screen.getByRole("button", { name: /Alfa1/ }));
  const assist = screen.getByRole("group", { name: "Assistência" });
  expect(within(assist).queryByRole("button", { name: /Alfa1/ })).not.toBeInTheDocument();
  await userEvent.click(within(assist).getByRole("button", { name: /Alfa2/ }));
  expect(acoes.addEvent).toHaveBeenCalledWith("m1", { tipo: "gol", teamId: "A", playerId: "a1", assistPlayerId: "a2" });
});

test("gol sem assistência", async () => {
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: "Gol" }));
  await userEvent.click(screen.getByRole("button", { name: "Time B" }));
  await userEvent.click(screen.getByRole("button", { name: /Beta2/ }));
  await userEvent.click(screen.getByRole("button", { name: "Sem assistência" }));
  expect(acoes.addEvent).toHaveBeenCalledWith("m1", { tipo: "gol", teamId: "B", playerId: "b2", assistPlayerId: null });
});

test("cartão amarelo", async () => {
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: "Amarelo" }));
  await userEvent.click(screen.getByRole("button", { name: "Time B" }));
  await userEvent.click(screen.getByRole("button", { name: /Beta1/ }));
  expect(acoes.addEvent).toHaveBeenCalledWith("m1", { tipo: "amarelo", teamId: "B", playerId: "b1", assistPlayerId: null });
});

const em = (ms: number) => ({ toMillis: () => ms });

test("desfazer apaga o lance mais recente, não o último da lista bruta", async () => {
  estado.events = [
    { id: "e3", tipo: "amarelo", teamId: "B", playerId: "b1", criadoEm: em(3000) },
    { id: "e1", tipo: "gol", teamId: "A", playerId: "a1", criadoEm: em(1000) },
    { id: "e2", tipo: "gol", teamId: "B", playerId: "b2", criadoEm: em(2000) },
  ];
  const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: "Desfazer último lance" }));
  expect(confirmar.mock.calls[0][0]).toMatch(/Amarelo.*Beta1/);
  expect(acoes.deleteEvent).toHaveBeenCalledWith("m1", "e3");
});

test("apagar um lance específico da lista", async () => {
  estado.events = [
    { id: "e1", tipo: "gol", teamId: "A", playerId: "a1", criadoEm: em(1000) },
    { id: "e2", tipo: "amarelo", teamId: "B", playerId: "b1", criadoEm: em(2000) },
  ];
  vi.spyOn(window, "confirm").mockReturnValue(true);
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: /Apagar lance: Gol · Alfa1/ }));
  expect(acoes.deleteEvent).toHaveBeenCalledWith("m1", "e1");
});

test("editar escalação com o jogo em andamento (jogador atrasado)", async () => {
  estado.lineups = [{ teamId: "A", playerIds: ["a1"], goleiroId: "a1" }, { teamId: "B", playerIds: ["b1", "b2"], goleiroId: "b1" }];
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: "Editar escalação" }));
  const alfa2 = screen.getByRole("checkbox", { name: /Alfa2/ });
  expect(alfa2).not.toBeChecked();
  await userEvent.click(alfa2);
  await userEvent.click(screen.getByRole("button", { name: "Salvar escalação" }));
  expect(acoes.saveLineups).toHaveBeenCalledWith("m1", [
    { teamId: "A", playerIds: ["a1", "a2"], goleiroId: "a1" },
    { teamId: "B", playerIds: ["b1", "b2"], goleiroId: "b1" },
  ]);
});

test("encerrar exige MVP", async () => {
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: "Encerrar jogo" }));
  const confirmar = screen.getByRole("button", { name: "Confirmar encerramento" });
  expect(confirmar).toBeDisabled();
  await userEvent.selectOptions(screen.getByLabelText("MVP do jogo"), "b2");
  await userEvent.click(confirmar);
  expect(acoes.closeMatch).toHaveBeenCalledWith("m1", "b2", null);
});

test("mata-mata empatado exige pênaltis", async () => {
  estado.match = { ...baseMatch(), fase: "quartas", placar: { mandante: 1, visitante: 1 } };
  renderSumula();
  await userEvent.click(screen.getByRole("button", { name: "Encerrar jogo" }));
  await userEvent.selectOptions(screen.getByLabelText("MVP do jogo"), "a1");
  const confirmar = screen.getByRole("button", { name: "Confirmar encerramento" });
  expect(confirmar).toBeDisabled();
  await userEvent.type(screen.getByLabelText("Pênaltis Time A"), "4");
  await userEvent.type(screen.getByLabelText("Pênaltis Time B"), "4");
  expect(confirmar).toBeDisabled();
  await userEvent.clear(screen.getByLabelText("Pênaltis Time B"));
  await userEvent.type(screen.getByLabelText("Pênaltis Time B"), "3");
  await userEvent.click(confirmar);
  expect(acoes.closeMatch).toHaveBeenCalledWith("m1", "a1", { mandante: 4, visitante: 3 });
});

test("jogo encerrado não mostra botões de lançamento", () => {
  estado.match = { ...baseMatch(), status: "encerrado" };
  renderSumula();
  expect(screen.queryByRole("button", { name: "Gol" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Encerrar jogo" })).not.toBeInTheDocument();
  expect(screen.getByText(/jogo encerrado/i)).toBeInTheDocument();
});
