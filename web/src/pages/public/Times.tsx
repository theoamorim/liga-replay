import { Link } from "react-router";
import TeamBadge from "../../components/TeamBadge";
import { useCurrentSeason, useEntries } from "../../data/seasons";
import { useTeamMap } from "../../data/teams";

export default function Times() {
  const season = useCurrentSeason();
  const entries = useEntries(season.data?.id).data;
  const teams = useTeamMap();
  const grupos = [...new Set(entries.map((e) => e.grupo))].sort();
  return (
    <section className="space-y-6">
      <h1 className="text-3xl text-bronze">Times</h1>
      {!entries.length && <p className="text-suave">Os times da temporada ainda não foram definidos.</p>}
      {grupos.map((g) => (
        <div key={g} className="space-y-2">
          <h2 className="text-xl">Grupo {g}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {entries.filter((e) => e.grupo === g).map((e) => (
              <Link key={e.id} to={`/times/${e.id}`} className="flex flex-col items-center gap-2 rounded-xl border border-borda bg-superficie p-4 text-center hover:border-cobre">
                <TeamBadge team={teams[e.id]} size="lg" />
                <span className="text-sm font-medium">{teams[e.id]?.nome ?? e.id}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
