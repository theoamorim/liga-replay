import type { Player } from "../data/types";
import { nomeCurto } from "../lib/names";

export default function PlayerPicker({ titulo, ids, players, numeros, onPick, extra }: {
  titulo: string; ids: string[]; players: Record<string, Player>; numeros?: Record<string, number | null>;
  onPick(id: string): void; extra?: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={titulo} className="space-y-2">
      <h3 className="text-sm text-suave">{titulo}</h3>
      <div className="grid grid-cols-2 gap-2">
        {ids.map((id) => (
          <button key={id} onClick={() => onPick(id)} className="min-h-14 rounded-lg border border-borda bg-fundo px-3 text-left">
            {numeros?.[id] != null && <span className="mr-2 text-suave">{numeros[id]}</span>}{nomeCurto(players[id])}
          </button>
        ))}
        {extra}
      </div>
    </div>
  );
}
