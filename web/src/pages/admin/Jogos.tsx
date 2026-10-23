import { Link } from "react-router";
import { formatData } from "../../components/MatchCard";
import { sortMatches, useMatches } from "../../data/matches";
import { useCurrentSeason } from "../../data/seasons";
import { useTeamMap } from "../../data/teams";
import { FASE_LABEL } from "../../data/types";
import { useUsers } from "../../data/users-admin";
import { Voltar } from "./AdminHome";

export default function Jogos() {
  const season = useCurrentSeason().data;
  const matches = sortMatches(useMatches(season?.id).data);
  const teams = useTeamMap();
  const users = Object.fromEntries(useUsers().data.map((u) => [u.id, u]));
  return (
    <section className="space-y-4">
      <Voltar to="/admin" texto="Administração" />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-bronze">Jogos</h1>
        <Link to="novo" className="rounded-lg bg-cobre px-4 py-2 font-semibold text-fundo">Jogo de mata-mata</Link>
      </div>
      {!season && <p className="text-suave">Defina a temporada atual primeiro.</p>}
      <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {matches.map((m) => (
          <li key={m.id}>
            <Link to={m.id} className="block px-4 py-3">
              <div className="text-sm">{teams[m.mandanteId]?.nome ?? "?"} {m.status !== "agendado" ? `${m.placar.mandante} × ${m.placar.visitante}` : "vs"} {teams[m.visitanteId]?.nome ?? "?"}</div>
              <div className="text-xs text-suave">
                {m.fase === "grupos" ? `Grupo ${m.grupo} · R${m.rodada}` : FASE_LABEL[m.fase]} · {formatData(m.data)} {m.horario} · {m.campo} · {m.status}
                {" · mesário: "}{m.mesarioUid ? users[m.mesarioUid]?.nome ?? "?" : <span className="text-bronze">sem mesário</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
