import { Link, useParams } from "react-router";
import TeamBadge from "../../components/TeamBadge";
import { usePlayer, usePlayerRosterEntry } from "../../data/players";
import { useCurrentSeason } from "../../data/seasons";
import { usePlayerStats } from "../../data/stats";
import { useTeamMap } from "../../data/teams";

export default function Jogador() {
  const { playerId } = useParams();
  const { data: p, loading } = usePlayer(playerId);
  const season = useCurrentSeason();
  const roster = usePlayerRosterEntry(season.data?.id, playerId).data;
  const s = usePlayerStats(season.data?.id).data.find((x) => x.playerId === playerId);
  const teams = useTeamMap();

  if (loading) return <p className="text-suave">Carregando…</p>;
  if (!p) return <p className="text-suave">Jogador não encontrado.</p>;
  const team = roster ? teams[roster.teamId] : undefined;
  const numeros: [string, number][] = [["Jogos", s?.j ?? 0], ["Gols", s?.g ?? 0], ["Assist.", s?.a ?? 0], ["G+A", s?.ga ?? 0], ["MVP", s?.mvp ?? 0], ["Amarelos", s?.am ?? 0], ["Vermelhos", s?.vm ?? 0]];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        {p.fotoUrl ? <img src={p.fotoUrl} alt="" className="size-24 rounded-full border border-borda object-cover" /> : <div className="size-24 rounded-full border border-borda bg-superficie" />}
        <div className="min-w-0">
          <h1 className="text-3xl text-bronze">{p.apelido || p.nome}</h1>
          <p className="text-sm text-suave">{p.nome}{p.posicao && ` · ${p.posicao}`}{roster?.numero != null && ` · nº ${roster.numero}`}</p>
          {p.instagram && <a className="text-sm text-bronze" href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer">@{p.instagram}</a>}
          {team && (
            <Link to={`/times/${team.id}`} className="mt-1 flex items-center gap-2 text-sm">
              <TeamBadge team={team} size="sm" /> {team.nome}
              {roster?.tipo === "convidado" && <span className="rounded bg-borda px-1 text-[10px] text-suave">convidado</span>}
            </Link>
          )}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xl">{season.data?.nome ?? "Temporada"}</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {numeros.map(([rotulo, v]) => (
            <div key={rotulo} className="rounded-xl border border-borda bg-superficie p-3 text-center">
              <div className="font-serif text-2xl font-bold text-bronze">{v}</div>
              <div className="text-[11px] text-suave">{rotulo}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
