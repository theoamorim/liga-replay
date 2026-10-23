import { useEffect, useMemo, useState } from "react";
import MatchCard from "../../components/MatchCard";
import { sortMatches, useMatches } from "../../data/matches";
import { useCurrentSeason } from "../../data/seasons";
import { useTeamMap } from "../../data/teams";
import { FASE_LABEL, type Match } from "../../data/types";

/** Rodadas da fase de grupos ("R1", "R2"...) seguidas das fases do mata-mata. */
function chaveDe(m: Match) { return m.fase === "grupos" ? `R${m.rodada}` : m.fase; }
function rotulo(chave: string) { return chave.startsWith("R") ? `Rodada ${chave.slice(1)}` : FASE_LABEL[chave as Match["fase"]]; }

export default function Jogos() {
  const season = useCurrentSeason();
  const { data, loading } = useMatches(season.data?.id);
  const teams = useTeamMap();
  const matches = useMemo(() => sortMatches(data), [data]);
  const chaves = useMemo(() => [...new Set(matches.map(chaveDe))], [matches]);
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    if (sel || !chaves.length) return;
    // abre na rodada em andamento ou na próxima
    const atual = matches.find((m) => m.status !== "encerrado");
    setSel(atual ? chaveDe(atual) : chaves[chaves.length - 1]);
  }, [chaves, matches, sel]);

  const lista = matches.filter((m) => chaveDe(m) === sel);
  return (
    <section className="space-y-4">
      <h1 className="text-3xl text-bronze">Jogos</h1>
      {loading && <p className="text-suave">Carregando…</p>}
      {!loading && !matches.length && <p className="text-suave">A tabela ainda não foi divulgada.</p>}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chaves.map((c) => (
          <button key={c} onClick={() => setSel(c)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm ${sel === c ? "border-cobre bg-cobre text-fundo" : "border-borda text-suave"}`}>
            {rotulo(c)}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lista.map((m) => <MatchCard key={m.id} match={m} teams={teams} />)}
      </div>
    </section>
  );
}
