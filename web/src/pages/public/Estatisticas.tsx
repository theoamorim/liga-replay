import { useState } from "react";
import StatRanking, { type StatKey } from "../../components/StatRanking";
import { useCurrentSeason } from "../../data/seasons";
import { usePlayerStats } from "../../data/stats";
import { useTeams } from "../../data/teams";

const ABAS: { key: StatKey; label: string }[] = [
  { key: "g", label: "Artilharia" },
  { key: "a", label: "Assistências" },
  { key: "ga", label: "G+A" },
  { key: "am", label: "Amarelos" },
  { key: "vm", label: "Vermelhos" },
  { key: "mvp", label: "MVPs" },
];

export default function Estatisticas() {
  const season = useCurrentSeason();
  const stats = usePlayerStats(season.data?.id);
  const teams = Object.fromEntries(useTeams().data.map((t) => [t.id, t]));
  const [aba, setAba] = useState<StatKey>("g");
  return (
    <section className="space-y-4">
      <h1 className="text-3xl text-bronze">Estatísticas</h1>
      {season.data && <p className="text-sm text-suave">{season.data.nome}</p>}
      <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {ABAS.map((a) => (
          <button
            key={a.key}
            role="tab"
            aria-selected={aba === a.key}
            onClick={() => setAba(a.key)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm ${aba === a.key ? "border-cobre bg-cobre text-fundo" : "border-borda text-suave"}`}
          >
            {a.label}
          </button>
        ))}
      </div>
      <StatRanking rows={stats.data} statKey={aba} teams={teams} />
    </section>
  );
}
