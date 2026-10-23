import { Link } from "react-router";
import type { PlayerStat, Team } from "../data/types";
import TeamBadge from "./TeamBadge";

export type StatKey = "g" | "a" | "ga" | "am" | "vm" | "mvp";

export function rankBy(rows: PlayerStat[], key: StatKey): PlayerStat[] {
  return rows.filter((r) => r[key] > 0).sort((a, b) => b[key] - a[key] || a.j - b.j || a.apelido.localeCompare(b.apelido));
}

export default function StatRanking({ rows, statKey, teams, limit }: { rows: PlayerStat[]; statKey: StatKey; teams: Record<string, Team>; limit?: number }) {
  const ranked = rankBy(rows, statKey).slice(0, limit);
  if (!ranked.length) return <p className="py-6 text-center text-sm text-suave">Nenhum registro ainda.</p>;
  return (
    <ol role="list" className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
      {ranked.map((r, i) => (
        <li key={r.playerId} data-player={r.playerId} className="flex items-center gap-3 px-3 py-2">
          <span className="w-5 text-right text-sm text-suave">{i + 1}</span>
          <TeamBadge team={teams[r.teamId]} size="sm" />
          <Link to={`/jogadores/${r.playerId}`} className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{r.apelido || r.nome}</div>
            <div className="truncate text-xs text-suave">{teams[r.teamId]?.nome ?? ""} · {r.j} J</div>
          </Link>
          <span className="font-serif text-lg font-bold text-bronze tabular-nums">{r[statKey]}</span>
        </li>
      ))}
    </ol>
  );
}
