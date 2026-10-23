import { describe, expect, test } from "vitest";
import { computeGroupStandings } from "./standings";
import type { MatchResult, PointsConfig } from "./types";

const PTS: PointsConfig = { vitoria: 3, empate: 1, derrota: 0 };
let n = 0;
const m = (a: string, ga: number, gb: number, b: string, status: MatchResult["status"] = "encerrado"): MatchResult => ({
  id: `m${++n}`, fase: "grupos", grupo: "A", rodada: 1,
  mandanteId: a, visitanteId: b, golsMandante: ga, golsVisitante: gb, status,
});
const ordem = (rows: { teamId: string }[]) => rows.map((r) => r.teamId);

describe("computeGroupStandings", () => {
  test("vitória 3, empate 1", () => {
    const rows = computeGroupStandings("A", ["A", "B", "C", "D"], [m("A", 2, 1, "B"), m("C", 0, 0, "D")], PTS);
    const pts = Object.fromEntries(rows.map((r) => [r.teamId, r.pts]));
    expect(pts).toEqual({ A: 3, B: 0, C: 1, D: 1 });
    const a = rows.find((r) => r.teamId === "A")!;
    expect(a).toMatchObject({ j: 1, v: 1, e: 0, d: 0, gp: 2, gc: 1, sg: 1, posicao: 1 });
  });

  test("ignora não encerrados e mostra times sem jogos com zeros", () => {
    const rows = computeGroupStandings("A", ["A", "B", "C", "D"], [m("A", 5, 0, "B", "agendado"), m("C", 1, 1, "D", "ao-vivo")], PTS);
    for (const r of rows) expect(r).toMatchObject({ j: 0, pts: 0, gp: 0, gc: 0 });
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => r.posicao)).toEqual([1, 2, 3, 4]);
  });

  test("confronto direto antes do saldo", () => {
    // A e B com 6 pts; B tem saldo maior, mas A venceu B
    const games = [m("A", 1, 0, "B"), m("A", 1, 0, "C"), m("B", 9, 0, "C"), m("B", 9, 0, "D"), m("D", 1, 0, "A"), m("C", 0, 0, "D")];
    const rows = computeGroupStandings("A", ["A", "B", "C", "D"], games, PTS);
    expect(rows.find((r) => r.teamId === "A")!.pts).toBe(6);
    expect(rows.find((r) => r.teamId === "B")!.pts).toBe(6);
    expect(ordem(rows).slice(0, 2)).toEqual(["A", "B"]);
  });

  test("três empatados com confronto direto empatado caem no saldo", () => {
    const games = [m("A", 1, 1, "B"), m("B", 1, 1, "C"), m("C", 1, 1, "A"), m("A", 3, 0, "D"), m("B", 2, 0, "D"), m("C", 1, 0, "D")];
    const rows = computeGroupStandings("A", ["A", "B", "C", "D"], games, PTS);
    expect(ordem(rows)).toEqual(["A", "B", "C", "D"]);
  });

  test("gols pró decide quando pontos, confronto e saldo empatam", () => {
    // A: gp 3 gc 2 sg 1 ; B: gp 4 gc 3 sg 1 ; empataram entre si -> B à frente por gols pró
    const games = [m("A", 1, 1, "B"), m("A", 2, 0, "C"), m("B", 3, 1, "C"), m("A", 0, 1, "D"), m("B", 0, 1, "D")];
    const rows = computeGroupStandings("A", ["A", "B", "C", "D"], games, PTS);
    expect(ordem(rows).slice(0, 3)).toEqual(["D", "B", "A"]);
  });

  test("sorteio quando tudo empata (rng determinístico)", () => {
    const rows0 = computeGroupStandings("A", ["A", "B", "C", "D"], [], PTS, () => 0);
    const rows1 = computeGroupStandings("A", ["A", "B", "C", "D"], [], PTS, () => 0);
    expect(ordem(rows0)).toEqual(ordem(rows1));
    expect(new Set(ordem(rows0)).size).toBe(4);
  });
});
