import MatchCard from "../../components/MatchCard";
import { sortMatches, useMatches } from "../../data/matches";
import { useCurrentSeason } from "../../data/seasons";
import { useTeamMap } from "../../data/teams";
import { FASE_LABEL, type Fase } from "../../data/types";

const ORDEM: Fase[] = ["repescagem-semi", "repescagem-final", "quartas", "semi", "final"];

export default function MataMata() {
  const season = useCurrentSeason();
  const matches = sortMatches(useMatches(season.data?.id).data).filter((m) => m.fase !== "grupos");
  const teams = useTeamMap();
  return (
    <section className="space-y-6">
      <h1 className="text-3xl text-bronze">Mata-mata</h1>
      {!matches.length && <p className="text-suave">O mata-mata começa depois da fase de grupos.</p>}
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {ORDEM.map((f) => {
          const jogos = matches.filter((m) => m.fase === f);
          if (!jogos.length) return null;
          return (
            <div key={f} className="w-72 shrink-0 snap-start space-y-3">
              <h2 className="text-lg">{FASE_LABEL[f]}</h2>
              {jogos.map((m) => <MatchCard key={m.id} match={m} teams={teams} />)}
            </div>
          );
        })}
      </div>
    </section>
  );
}
