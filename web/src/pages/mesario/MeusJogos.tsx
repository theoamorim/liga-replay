import { Link } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { formatData } from "../../components/MatchCard";
import { sortMatches, useMesarioMatches } from "../../data/matches";
import { useTeamMap } from "../../data/teams";

export default function MeusJogos() {
  const { user } = useAuth();
  const { data, loading } = useMesarioMatches(user?.uid);
  const teams = useTeamMap();
  const jogos = sortMatches(data);
  return (
    <section className="space-y-4">
      <h1 className="text-3xl text-bronze">Meus jogos</h1>
      {loading && <p className="text-suave">Carregando…</p>}
      {!loading && !jogos.length && <p className="text-suave">Nenhum jogo atribuído a você.</p>}
      <ul className="space-y-2">
        {jogos.map((m) => (
          <li key={m.id}>
            <Link to={`/mesario/${m.id}`} className="block rounded-xl border border-borda bg-superficie p-4">
              <div className="font-medium">{teams[m.mandanteId]?.nome} vs {teams[m.visitanteId]?.nome}</div>
              <div className="text-xs text-suave">{formatData(m.data)} · {m.horario} · {m.campo} · {m.status}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
