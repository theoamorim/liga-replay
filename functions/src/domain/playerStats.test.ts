import { expect, test } from "vitest";
import { computePlayerStats } from "./playerStats";
import type { MatchBundle } from "./types";

const bundle = (id: string, status: "encerrado" | "agendado", mvp?: string): MatchBundle => ({
  match: { id, fase: "grupos", rodada: 1, mandanteId: "A", visitanteId: "B", golsMandante: 0, golsVisitante: 0, status, mvpPlayerId: mvp },
  lineups: [
    { teamId: "A", playerIds: ["a1", "a2", "a3"], goleiroId: "a3" },
    { teamId: "B", playerIds: ["b1", "b2"] },
  ],
  events: [
    { id: "e1", tipo: "gol", playerId: "a1", teamId: "A", assistPlayerId: "a2" },
    { id: "e2", tipo: "gol", playerId: "a1", teamId: "A" },
    { id: "e3", tipo: "gol-contra", playerId: "b1", teamId: "B" },
    { id: "e4", tipo: "amarelo", playerId: "b2", teamId: "B" },
    { id: "e5", tipo: "vermelho", playerId: "b2", teamId: "B" },
  ],
});

test("soma gols, assistências, cartões, jogos e MVP", () => {
  const rows = computePlayerStats([bundle("m1", "encerrado", "a1"), bundle("m2", "encerrado")]);
  const by = Object.fromEntries(rows.map((r) => [r.playerId, r]));
  expect(by.a1).toMatchObject({ teamId: "A", j: 2, g: 4, a: 0, ga: 4, mvp: 1 });
  expect(by.a2).toMatchObject({ j: 2, g: 0, a: 2, ga: 2 });
  expect(by.b1).toMatchObject({ j: 2, g: 0 });
  expect(by.b2).toMatchObject({ am: 2, vm: 2 });
  expect(by.a3).toMatchObject({ j: 2, g: 0 });
});

test("ignora jogos não encerrados", () => {
  expect(computePlayerStats([bundle("m1", "agendado", "a1")])).toEqual([]);
});

test("recalcular sem um evento reduz as estatísticas", () => {
  const b = bundle("m1", "encerrado");
  const antes = computePlayerStats([b]).find((r) => r.playerId === "a1")!.g;
  b.events = b.events.filter((e) => e.id !== "e2");
  expect(computePlayerStats([b]).find((r) => r.playerId === "a1")!.g).toBe(antes - 1);
});
