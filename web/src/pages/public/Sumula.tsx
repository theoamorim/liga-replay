import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import TeamBadge from "../../components/TeamBadge";
import { formatData } from "../../components/MatchCard";
import { sortEvents, useMatch } from "../../data/matches";
import { useTeamMap } from "../../data/teams";
import { FASE_LABEL, type MatchEvent } from "../../data/types";
import { db } from "../../firebase";

export function usePlayerNames(ids: string[]): Record<string, string> {
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const chave = [...new Set(ids)].sort().join(",");
  useEffect(() => {
    const faltando = chave.split(",").filter((id) => id && !(id in nomes));
    if (!faltando.length) return;
    Promise.all(faltando.map((id) => getDoc(doc(db, "players", id)))).then((snaps) =>
      setNomes((n) => ({ ...n, ...Object.fromEntries(snaps.map((s) => [s.id, s.get("apelido") || s.get("nome") || "Jogador"])) })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
  return nomes;
}

const ICONE: Record<MatchEvent["tipo"], string> = { gol: "⚽", "gol-contra": "⚽ (contra)", amarelo: "🟨", vermelho: "🟥" };

export default function Sumula() {
  const { matchId } = useParams();
  const { match: m, events, lineups, loading } = useMatch(matchId);
  const teams = useTeamMap();
  const ids = [...lineups.flatMap((l) => l.playerIds), ...events.flatMap((e) => [e.playerId, e.assistPlayerId ?? ""]), m?.mvpPlayerId ?? ""];
  const nomes = usePlayerNames(ids);

  if (loading) return <p className="text-suave">Carregando…</p>;
  if (!m) return <p className="text-suave">Jogo não encontrado.</p>;

  const lado = (teamId: string) => (
    <Link to={`/times/${teamId}`} className="flex flex-1 flex-col items-center gap-2 text-center">
      <TeamBadge team={teams[teamId]} size="lg" />
      <span className="text-sm font-medium">{teams[teamId]?.nome ?? "A definir"}</span>
    </Link>
  );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-borda bg-superficie p-5">
        <p className="text-center text-xs text-suave">
          {m.fase === "grupos" ? `Grupo ${m.grupo} · Rodada ${m.rodada}` : FASE_LABEL[m.fase]} · {formatData(m.data)} · {m.horario} · {m.campo}
        </p>
        <div className="mt-4 flex items-center gap-2">
          {lado(m.mandanteId)}
          <div className="text-center">
            {m.status === "agendado" ? <span className="text-suave">vs</span> : (
              <span className="font-serif text-4xl font-bold text-bronze tabular-nums">{m.placar.mandante} × {m.placar.visitante}</span>
            )}
            {m.penaltis && <div className="text-xs text-suave">pênaltis {m.penaltis.mandante} × {m.penaltis.visitante}</div>}
            {m.status === "ao-vivo" && <div className="mt-1 text-xs font-bold text-red-500">AO VIVO</div>}
          </div>
          {lado(m.visitanteId)}
        </div>
        {m.mvpPlayerId && <p className="mt-4 text-center text-sm">MVP: <Link className="text-bronze" to={`/jogadores/${m.mvpPlayerId}`}>{nomes[m.mvpPlayerId]}</Link></p>}
      </div>

      {events.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl">Lances</h2>
          <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
            {sortEvents(events).map((e) => (
              <li key={e.id} className={`flex items-center gap-2 px-3 py-2 text-sm ${e.teamId === m.visitanteId ? "flex-row-reverse text-right" : ""}`}>
                <span>{ICONE[e.tipo]}</span>
                <span>
                  <Link to={`/jogadores/${e.playerId}`}>{nomes[e.playerId] ?? "…"}</Link>
                  {e.assistPlayerId && <span className="text-suave"> (assist. {nomes[e.assistPlayerId] ?? "…"})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lineups.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {[m.mandanteId, m.visitanteId].map((tid) => {
            const l = lineups.find((x) => x.teamId === tid);
            if (!l) return null;
            return (
              <div key={tid} className="rounded-xl border border-borda bg-superficie p-3">
                <h3 className="mb-2 text-base">{teams[tid]?.nome}</h3>
                <ul className="space-y-1 text-sm">
                  {l.playerIds.map((p) => (
                    <li key={p}><Link to={`/jogadores/${p}`}>{nomes[p] ?? "…"}</Link>{l.goleiroId === p && <span className="text-suave"> (GOL)</span>}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
