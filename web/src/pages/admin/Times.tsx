import { Link } from "react-router";
import TeamBadge from "../../components/TeamBadge";
import { useTeams } from "../../data/teams";
import { Voltar } from "./AdminHome";

export default function Times() {
  const { data } = useTeams();
  return (
    <section className="space-y-4">
      <Voltar to="/admin" texto="Administração" />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-bronze">Times</h1>
        <Link to="novo" className="rounded-lg bg-cobre px-4 py-2 font-semibold text-fundo">Novo time</Link>
      </div>
      <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {[...data].sort((a, b) => a.nome.localeCompare(b.nome)).map((t) => (
          <li key={t.id}><Link to={t.id} className="flex min-h-12 items-center gap-3 px-4"><TeamBadge team={t} size="sm" />{t.nome}</Link></li>
        ))}
      </ul>
    </section>
  );
}
