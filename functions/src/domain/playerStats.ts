import type { MatchBundle, PlayerStatRow } from "./types";

export function computePlayerStats(bundles: MatchBundle[]): PlayerStatRow[] {
  const rows = new Map<string, PlayerStatRow>();
  const get = (playerId: string, teamId: string) => {
    let r = rows.get(playerId);
    if (!r) {
      r = { playerId, teamId, j: 0, g: 0, a: 0, ga: 0, am: 0, vm: 0, mvp: 0 };
      rows.set(playerId, r);
    }
    return r;
  };
  const teamOf = (b: MatchBundle, playerId: string) => b.lineups.find((l) => l.playerIds.includes(playerId))?.teamId;

  for (const b of bundles) {
    if (b.match.status !== "encerrado") continue;
    for (const l of b.lineups) for (const p of l.playerIds) get(p, l.teamId).j++;
    for (const e of b.events) {
      const r = get(e.playerId, e.teamId);
      if (e.tipo === "gol") r.g++;
      else if (e.tipo === "amarelo") r.am++;
      else if (e.tipo === "vermelho") r.vm++;
      if (e.tipo === "gol" && e.assistPlayerId) get(e.assistPlayerId, teamOf(b, e.assistPlayerId) ?? e.teamId).a++;
    }
    const mvp = b.match.mvpPlayerId;
    if (mvp) get(mvp, teamOf(b, mvp) ?? "").mvp++;
  }
  for (const r of rows.values()) r.ga = r.g + r.a;
  return [...rows.values()];
}
