import { Link } from "react-router";
import MatchCard from "../../components/MatchCard";
import StatRanking from "../../components/StatRanking";
import { sortMatches, useMatches } from "../../data/matches";
import { useCurrentSeason } from "../../data/seasons";
import { usePlayerStats } from "../../data/stats";
import { useTeamMap } from "../../data/teams";

export default function Inicio() {
  const season = useCurrentSeason();
  const matches = sortMatches(useMatches(season.data?.id).data);
  const stats = usePlayerStats(season.data?.id).data;
  const teams = useTeamMap();

  const aoVivo = matches.filter((m) => m.status === "ao-vivo");
  const proximos = matches.filter((m) => m.status === "agendado");
  const proximaData = proximos[0]?.data;
  const encerrados = matches.filter((m) => m.status === "encerrado");
  const ultimaData = encerrados[encerrados.length - 1]?.data;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-borda bg-gradient-to-br from-superficie to-fundo p-6">
        <p className="text-xs tracking-[0.3em] text-suave">LIGA AMADORA DE FUTEBOL 7</p>
        <h1 className="mt-1 text-4xl text-bronze">Liga Replay</h1>
        <p className="mt-2 text-sm text-suave">{season.data ? season.data.nome : "Temporada em preparação"} · Sábados, 9h às 11h</p>
        <a href="https://instagram.com/ligareplay" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm text-bronze underline">
          @ligareplay no Instagram
        </a>
      </section>

      {aoVivo.length > 0 && (
        <Bloco titulo="Ao vivo">
          {aoVivo.map((m) => <MatchCard key={m.id} match={m} teams={teams} />)}
        </Bloco>
      )}

      {proximaData && (
        <Bloco titulo="Próxima rodada" link={{ to: "/jogos", texto: "Todos os jogos" }}>
          {proximos.filter((m) => m.data === proximaData).map((m) => <MatchCard key={m.id} match={m} teams={teams} />)}
        </Bloco>
      )}

      {ultimaData && (
        <Bloco titulo="Últimos resultados">
          {encerrados.filter((m) => m.data === ultimaData).map((m) => <MatchCard key={m.id} match={m} teams={teams} />)}
        </Bloco>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl">Artilharia</h2>
          <Link to="/estatisticas" className="text-sm text-bronze">Ver tudo</Link>
        </div>
        <StatRanking rows={stats} statKey="g" teams={teams} limit={3} />
      </section>
    </div>
  );
}

function Bloco({ titulo, link, children }: { titulo: string; link?: { to: string; texto: string }; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl">{titulo}</h2>
        {link && <Link to={link.to} className="text-sm text-bronze">{link.texto}</Link>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}
