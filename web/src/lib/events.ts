import type { MatchEvent, Player } from "../data/types";
import { nomeCurto } from "./names";

export function sortEvents(evs: MatchEvent[]): MatchEvent[] {
  const t = (e: MatchEvent) => (e.criadoEm as { toMillis?: () => number } | undefined)?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
  return [...evs].sort((a, b) => (a.minuto ?? 0) - (b.minuto ?? 0) || t(a) - t(b));
}

export const ROTULO_EVENTO: Record<MatchEvent["tipo"], string> = { gol: "Gol", "gol-contra": "Gol contra", amarelo: "Amarelo", vermelho: "Vermelho" };

export const descreverEvento = (e: MatchEvent, players: Record<string, Player>) => `${ROTULO_EVENTO[e.tipo]} · ${nomeCurto(players[e.playerId])}`;
