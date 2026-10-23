import { descreverEvento } from "../lib/events";
import { nomeCurto } from "../lib/names";
import type { MatchEvent, Player, Team } from "../data/types";

const ICONE: Record<MatchEvent["tipo"], string> = { gol: "⚽", "gol-contra": "⚽", amarelo: "🟨", vermelho: "🟥" };

export default function EventList({ events, players, teams, onDelete }: {
  events: MatchEvent[]; players: Record<string, Player>; teams: Record<string, Team>; onDelete?(e: MatchEvent): void;
}) {
  if (!events.length) return <p className="text-sm text-suave">Nenhum lance ainda.</p>;
  return (
    <ol className="divide-y divide-borda rounded-xl border border-borda bg-superficie text-sm">
      {[...events].reverse().map((e) => (
        <li key={e.id} className="flex items-center justify-between gap-2 px-3 py-2">
          <span className="min-w-0">
            {ICONE[e.tipo]} {descreverEvento(e, players)}
            {e.assistPlayerId && <span className="text-suave"> (assist. {nomeCurto(players[e.assistPlayerId])})</span>}
            <span className="block text-xs text-suave">{teams[e.teamId]?.nome}</span>
          </span>
          {onDelete && (
            <button aria-label={`Apagar lance: ${descreverEvento(e, players)}`} onClick={() => onDelete(e)} className="min-h-11 min-w-11 shrink-0 rounded-lg border border-borda text-suave">✕</button>
          )}
        </li>
      ))}
    </ol>
  );
}
