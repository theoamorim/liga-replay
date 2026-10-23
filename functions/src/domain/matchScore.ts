import type { MatchEvent } from "./types";

export function computeScore(events: MatchEvent[], mandanteId: string, visitanteId: string): { mandante: number; visitante: number } {
  let mandante = 0;
  let visitante = 0;
  for (const e of events) {
    if (e.tipo !== "gol" && e.tipo !== "gol-contra") continue;
    const beneficiado = e.tipo === "gol" ? e.teamId : e.teamId === mandanteId ? visitanteId : mandanteId;
    if (beneficiado === mandanteId) mandante++;
    else if (beneficiado === visitanteId) visitante++;
  }
  return { mandante, visitante };
}
