import type { MatchEvent } from "../data/types";

/** Placar calculado localmente a partir dos lances (resposta imediata, mesmo offline). */
export function scoreFromEvents(events: MatchEvent[], mandanteId: string, visitanteId: string) {
  let mandante = 0;
  let visitante = 0;
  for (const e of events) {
    if (e.tipo !== "gol" && e.tipo !== "gol-contra") continue;
    const lado = e.tipo === "gol" ? e.teamId : e.teamId === mandanteId ? visitanteId : mandanteId;
    if (lado === mandanteId) mandante++;
    else if (lado === visitanteId) visitante++;
  }
  return { mandante, visitante };
}
