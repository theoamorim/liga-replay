import { Link } from "react-router";
import type { Situacao, Standing, Team } from "../data/types";
import TeamBadge from "./TeamBadge";

export const SITUACAO_COR: Record<Situacao, string> = {
  quartas: "border-l-cobre",
  repescagem: "border-l-bronze/60",
  eliminado: "border-l-transparent opacity-60",
};

export default function StandingsTable({ rows, teams, numerar = true }: { rows: Standing[]; teams: Record<string, Team>; numerar?: boolean }) {
  const cols = ["J", "V", "E", "D", "GP", "GC", "SG"] as const;
  const val = (r: Standing, c: (typeof cols)[number]) => ({ J: r.j, V: r.v, E: r.e, D: r.d, GP: r.gp, GC: r.gc, SG: r.sg })[c];
  return (
    <div className="overflow-x-auto rounded-xl border border-borda bg-superficie">
      <table className="w-full text-sm tabular-nums">
        <thead className="text-xs text-suave">
          <tr>
            <th className="w-8 py-2 pl-3 text-left">#</th>
            <th className="py-2 text-left">Time</th>
            {cols.map((c) => <th key={c} className={`px-1.5 py-2 ${["GP", "GC", "V", "E", "D"].includes(c) ? "hidden sm:table-cell" : ""}`}>{c}</th>)}
            <th className="px-3 py-2 text-bronze">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.teamId} data-situacao={r.situacao ?? ""} className={`border-t border-borda border-l-4 ${r.situacao ? SITUACAO_COR[r.situacao] : "border-l-transparent"}`}>
              <td className="py-2 pl-3 text-suave">{numerar ? r.posicao : i + 1}</td>
              <td className="py-2">
                <Link to={`/times/${r.teamId}`} className="flex items-center gap-2">
                  <TeamBadge team={teams[r.teamId]} size="sm" />
                  <span className="truncate">{teams[r.teamId]?.nome ?? r.teamId}</span>
                </Link>
              </td>
              {cols.map((c) => <td key={c} className={`px-1.5 py-2 text-center ${["GP", "GC", "V", "E", "D"].includes(c) ? "hidden sm:table-cell" : ""}`}>{val(r, c)}</td>)}
              <td className="px-3 py-2 text-center font-semibold text-bronze">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
