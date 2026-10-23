import StandingsTable from "../../components/StandingsTable";
import { useCurrentSeason, useQualificacao } from "../../data/seasons";
import { useStandings } from "../../data/stats";
import { useTeamMap } from "../../data/teams";
import type { Standing } from "../../data/types";

export default function Classificacao() {
  const season = useCurrentSeason();
  const { data: rows, loading } = useStandings(season.data?.id);
  const qual = useQualificacao(season.data?.id).data;
  const teams = useTeamMap();
  const grupos = [...new Set(rows.map((r) => r.grupo))].sort();
  const porId = Object.fromEntries(rows.map((r) => [r.teamId, r]));
  const ranking = (ids: string[] | undefined): Standing[] => (ids ?? []).map((id) => porId[id]).filter(Boolean);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl text-bronze">Classificação</h1>
      {loading && <p className="text-suave">Carregando…</p>}
      {!loading && !rows.length && <p className="text-suave">A classificação aparece depois dos primeiros jogos.</p>}
      {grupos.map((g) => (
        <div key={g} className="space-y-2">
          <h2 className="text-xl">Grupo {g}</h2>
          <StandingsTable rows={rows.filter((r) => r.grupo === g).sort((a, b) => a.posicao - b.posicao)} teams={teams} />
        </div>
      ))}
      {qual && qual.rankingTerceiros.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-xl">Ranking dos 3º colocados</h2>
            <StandingsTable rows={ranking(qual.rankingTerceiros)} teams={teams} numerar={false} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl">Ranking dos 4º colocados</h2>
            <StandingsTable rows={ranking(qual.rankingQuartos)} teams={teams} numerar={false} />
          </div>
        </div>
      )}
      {rows.length > 0 && (
        <div className="space-y-1 text-xs text-suave">
          <p><span className="mr-2 inline-block h-3 w-1 bg-cobre align-middle" />Quartas de final · <span className="mx-2 inline-block h-3 w-1 bg-bronze/60 align-middle" />Repescagem · Eliminado (apagado)</p>
          <p>Desempate: pontos, confronto direto, saldo de gols, gols pró, menos gols sofridos e sorteio.{qual && !qual.completo && " Situação provisória até o fim da fase de grupos."}</p>
        </div>
      )}
    </section>
  );
}
