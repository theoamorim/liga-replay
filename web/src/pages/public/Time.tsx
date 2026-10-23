import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import TeamBadge from "../../components/TeamBadge";
import { useRoster } from "../../data/players";
import { useCurrentSeason } from "../../data/seasons";
import { usePlayerStats } from "../../data/stats";
import { useTeam } from "../../data/teams";
import type { Player } from "../../data/types";
import { db } from "../../firebase";

export default function Time() {
  const { teamId } = useParams();
  const season = useCurrentSeason();
  const team = useTeam(teamId).data;
  const roster = useRoster(season.data?.id, teamId).data;
  const stats = Object.fromEntries(usePlayerStats(season.data?.id).data.map((s) => [s.playerId, s]));
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const chave = roster.map((r) => r.playerId).sort().join(",");

  useEffect(() => {
    if (!chave) return;
    Promise.all(chave.split(",").map((id) => getDoc(doc(db, "players", id)))).then((snaps) =>
      setPlayers(Object.fromEntries(snaps.filter((s) => s.exists()).map((s) => [s.id, { id: s.id, ...s.data() } as Player]))),
    );
  }, [chave]);

  const elenco = [...roster].sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999));
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <TeamBadge team={team ?? undefined} size="lg" />
        <h1 className="text-3xl text-bronze">{team?.nome ?? "Time"}</h1>
      </div>
      <div className="overflow-x-auto rounded-xl border border-borda bg-superficie">
        <table className="w-full text-sm tabular-nums">
          <thead className="text-xs text-suave">
            <tr>
              <th className="py-2 pl-3 text-left">Nº</th><th className="py-2 text-left">Jogador</th><th className="hidden py-2 text-left sm:table-cell">Posição</th>
              <th className="px-1.5">J</th><th className="px-1.5">G</th><th className="px-1.5">A</th><th className="px-1.5">AM</th><th className="px-1.5 pr-3">VM</th>
            </tr>
          </thead>
          <tbody>
            {elenco.map((r) => {
              const p = players[r.playerId];
              const s = stats[r.playerId];
              return (
                <tr key={r.playerId} className="border-t border-borda">
                  <td className="py-2 pl-3 text-suave">{r.numero ?? "–"}</td>
                  <td className="py-2">
                    <Link to={`/jogadores/${r.playerId}`} className="block">
                      <span className="font-medium">{p?.apelido || p?.nome || "…"}</span>
                      {r.tipo === "convidado" && <span className="ml-1 rounded bg-borda px-1 text-[10px] text-suave">convidado</span>}
                      {p?.instagram && <span className="block text-xs text-suave">@{p.instagram}</span>}
                    </Link>
                  </td>
                  <td className="hidden py-2 text-suave sm:table-cell">{p?.posicao}</td>
                  {[s?.j, s?.g, s?.a, s?.am, s?.vm].map((v, i) => <td key={i} className="px-1.5 text-center last:pr-3">{v ?? 0}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!elenco.length && <p className="p-4 text-sm text-suave">Elenco ainda não cadastrado.</p>}
      </div>
    </section>
  );
}
