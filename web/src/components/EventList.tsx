import { nomeCurto } from "../lib/names";
import type { MatchEvent, Player, Team } from "../data/types";

const ROTULO: Record<MatchEvent["tipo"], string> = { gol: "⚽ Gol", "gol-contra": "⚽ Gol contra", amarelo: "🟨 Amarelo", vermelho: "🟥 Vermelho" };

export default function EventList({ events, players, teams }: { events: MatchEvent[]; players: Record<string, Player>; teams: Record<string, Team> }) {
  if (!events.length) return <p className="text-sm text-suave">Nenhum lance ainda.</p>;
  return (
    <ol className="divide-y divide-borda rounded-xl border border-borda bg-superficie text-sm">
      {[...events].reverse().map((e) => (
        <li key={e.id} className="flex justify-between gap-2 px-3 py-2">
          <span>{ROTULO[e.tipo]} · {nomeCurto(players[e.playerId])}{e.assistPlayerId && <span className="text-suave"> (assist. {nomeCurto(players[e.assistPlayerId])})</span>}</span>
          <span className="shrink-0 text-suave">{teams[e.teamId]?.nome}</span>
        </li>
      ))}
    </ol>
  );
}
