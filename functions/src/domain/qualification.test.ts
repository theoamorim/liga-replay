import { expect, test } from "vitest";
import { qualifyPadrao12 } from "./qualification";
import type { StandingRow } from "./types";

const row = (teamId: string, grupo: string, posicao: number, pts: number, sg = 0, gp = 0, gc = 0): StandingRow => ({
  teamId, grupo, posicao, j: 3, v: 0, e: 0, d: 0, gp, gc, sg, pts,
});

const groups: StandingRow[][] = [
  [row("A1", "A", 1, 9), row("A2", "A", 2, 6), row("A3", "A", 3, 3, 0, 4), row("A4", "A", 4, 0, -5)],
  [row("B1", "B", 1, 7), row("B2", "B", 2, 6), row("B3", "B", 3, 4, 1), row("B4", "B", 4, 1, -2)],
  [row("C1", "C", 1, 9), row("C2", "C", 2, 4), row("C3", "C", 3, 3, 0, 2), row("C4", "C", 4, 1, -1)],
];

test("padrão 12 times: diretos, repescagem e eliminado", () => {
  const q = qualifyPadrao12(groups);
  for (const t of ["A1", "A2", "B1", "B2", "C1", "C2", "B3"]) expect(q.situacao[t]).toBe("quartas");
  for (const t of ["A3", "C3", "C4", "B4"]) expect(q.situacao[t]).toBe("repescagem");
  expect(q.situacao["A4"]).toBe("eliminado");
});

test("ranking de 3º e 4º: pts → saldo → gols pró", () => {
  const q = qualifyPadrao12(groups);
  expect(q.rankingTerceiros.map((r) => r.teamId)).toEqual(["B3", "A3", "C3"]);
  expect(q.rankingQuartos.map((r) => r.teamId)).toEqual(["C4", "B4", "A4"]);
});

test("erro se não houver 3 grupos de 4", () => {
  expect(() => qualifyPadrao12(groups.slice(0, 2))).toThrow(/3 grupos de 4/);
  expect(() => qualifyPadrao12([groups[0], groups[1], groups[2].slice(0, 3)])).toThrow(/3 grupos de 4/);
});
