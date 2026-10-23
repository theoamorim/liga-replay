import { Link } from "react-router";
import type { Match, Team } from "../data/types";
import TeamBadge from "./TeamBadge";

export function formatData(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function MatchCard({ match: m, teams }: { match: Match; teams: Record<string, Team> }) {
  const mostrarPlacar = m.status !== "agendado";
  const lado = (id: string, alinhamento: "left" | "right") => (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${alinhamento === "right" ? "flex-row-reverse text-right" : ""}`}>
      <TeamBadge team={teams[id]} />
      <span className="truncate text-sm font-medium">{teams[id]?.nome ?? "A definir"}</span>
    </div>
  );
  return (
    <Link to={`/jogos/${m.id}`} className="block rounded-xl border border-borda bg-superficie p-3 transition-colors hover:border-cobre">
      <div className="mb-2 flex items-center justify-between text-xs text-suave">
        <span>{formatData(m.data)} · {m.horario} · {m.campo}</span>
        {m.status === "ao-vivo" && <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">AO VIVO</span>}
      </div>
      <div className="flex items-center gap-3">
        {lado(m.mandanteId, "left")}
        {mostrarPlacar ? (
          <div className="text-center">
            <span data-testid="placar" className="font-serif text-xl font-bold text-bronze tabular-nums">
              {m.placar.mandante} × {m.placar.visitante}
            </span>
            {m.penaltis && <div className="text-[10px] text-suave">pên. {m.penaltis.mandante} × {m.penaltis.visitante}</div>}
          </div>
        ) : (
          <span className="text-xs text-suave">vs</span>
        )}
        {lado(m.visitanteId, "right")}
      </div>
    </Link>
  );
}
