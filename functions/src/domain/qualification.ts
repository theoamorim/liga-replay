import { compareOverall, drawOrder } from "./standings";
import type { StandingRow } from "./types";

export type Situacao = "quartas" | "repescagem" | "eliminado";

export interface Qualification {
  situacao: Record<string, Situacao>;
  rankingTerceiros: StandingRow[];
  rankingQuartos: StandingRow[];
}

/** Ordena times de grupos diferentes (sem confronto direto); empates totais vão a sorteio. */
export function rankAcrossGroups(rows: StandingRow[], rng: () => number = Math.random): StandingRow[] {
  const shuffled = drawOrder(rows, rng);
  return shuffled.sort(compareOverall);
}

export function qualifyPadrao12(groups: StandingRow[][], rng: () => number = Math.random): Qualification {
  if (groups.length !== 3 || groups.some((g) => g.length !== 4)) {
    throw new Error("O formato padrão exige 3 grupos de 4 times.");
  }
  const byPos = (p: number) => groups.map((g) => g.find((r) => r.posicao === p)!);
  const situacao: Record<string, Situacao> = {};
  for (const r of [...byPos(1), ...byPos(2)]) situacao[r.teamId] = "quartas";

  const rankingTerceiros = rankAcrossGroups(byPos(3), rng);
  const rankingQuartos = rankAcrossGroups(byPos(4), rng);
  situacao[rankingTerceiros[0].teamId] = "quartas";
  for (const r of rankingTerceiros.slice(1)) situacao[r.teamId] = "repescagem";
  for (const r of rankingQuartos.slice(0, 2)) situacao[r.teamId] = "repescagem";
  situacao[rankingQuartos[2].teamId] = "eliminado";

  return { situacao, rankingTerceiros, rankingQuartos };
}
