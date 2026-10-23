import { useMemo, useState } from "react";
import { useParams } from "react-router";
import EventList from "../../components/EventList";
import PlayerPicker from "../../components/PlayerPicker";
import { useMatch } from "../../data/matches";
import { descreverEvento, sortEvents } from "../../lib/events";
import { usePlayersByIds, useRoster } from "../../data/players";
import { nomeCurto } from "../../lib/names";
import { scoreFromEvents } from "../../lib/score";
import { addEvent, closeMatch, deleteEvent, saveLineups, startMatch } from "../../data/sumula";
import { useTeamMap } from "../../data/teams";
import type { EventTipo, Lineup } from "../../data/types";

type Passo =
  | { etapa: "nada" }
  | { etapa: "time"; tipo: EventTipo }
  | { etapa: "jogador"; tipo: EventTipo; teamId: string }
  | { etapa: "assist"; teamId: string; playerId: string }
  | { etapa: "encerrar" }
  | { etapa: "escalacao" };

const BOTOES: { tipo: EventTipo; label: string; cls: string }[] = [
  { tipo: "gol", label: "Gol", cls: "bg-cobre text-fundo" },
  { tipo: "gol-contra", label: "Gol contra", cls: "border border-borda" },
  { tipo: "amarelo", label: "Amarelo", cls: "bg-yellow-400 text-black" },
  { tipo: "vermelho", label: "Vermelho", cls: "bg-red-600 text-white" },
];

export default function SumulaAoVivo() {
  const { matchId } = useParams();
  const { match: m, events, lineups, loading } = useMatch(matchId);
  const teams = useTeamMap();
  const rosterA = useRoster(m?.seasonId, m?.mandanteId).data;
  const rosterB = useRoster(m?.seasonId, m?.visitanteId).data;
  const numeros = useMemo(() => Object.fromEntries([...rosterA, ...rosterB].map((r) => [r.playerId, r.numero])), [rosterA, rosterB]);
  const players = usePlayersByIds([...rosterA, ...rosterB].map((r) => r.playerId).concat(lineups.flatMap((l) => l.playerIds)));
  const [passo, setPasso] = useState<Passo>({ etapa: "nada" });

  if (loading) return <p className="text-suave">Carregando…</p>;
  if (!m) return <p className="text-suave">Jogo não encontrado.</p>;

  const placar = scoreFromEvents(events, m.mandanteId, m.visitanteId);
  const nomeTime = (id: string) => teams[id]?.nome ?? id;
  const lineupDe = (teamId: string) => lineups.find((l) => l.teamId === teamId)?.playerIds ?? [];

  const Placar = (
    <div className="sticky top-14 z-10 -mx-4 border-b border-borda bg-fundo/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-2 text-center">
        <span className="flex-1 truncate text-sm">{nomeTime(m.mandanteId)}</span>
        <span className="font-serif text-3xl font-bold text-bronze tabular-nums">{placar.mandante} × {placar.visitante}</span>
        <span className="flex-1 truncate text-sm">{nomeTime(m.visitanteId)}</span>
      </div>
    </div>
  );

  const rosters = { [m.mandanteId]: rosterA.map((r) => r.playerId), [m.visitanteId]: rosterB.map((r) => r.playerId) };
  if (m.status === "agendado") {
    return <Escalacao times={[m.mandanteId, m.visitanteId]} rosters={rosters} players={players} numeros={numeros} nomeTime={nomeTime}
      textoBotao="Iniciar jogo" onConfirm={(ls) => startMatch(m.id, ls)} />;
  }

  if (m.status === "encerrado") {
    return (
      <section className="space-y-4">
        {Placar}
        <p className="rounded-xl border border-borda bg-superficie p-4 text-center">Jogo encerrado. MVP: {nomeCurto(players[m.mvpPlayerId ?? ""])}</p>
        <EventList events={sortEvents(events)} players={players} teams={teams} />
      </section>
    );
  }

  const registrar = async (tipo: EventTipo, teamId: string, playerId: string, assistPlayerId: string | null) => {
    setPasso({ etapa: "nada" });
    await addEvent(m.id, { tipo, teamId, playerId, assistPlayerId });
  };
  const ordenados = sortEvents(events);
  const ultimo = ordenados[ordenados.length - 1];
  const apagar = (e: (typeof events)[number], pergunta: string) => {
    if (confirm(`${pergunta}\n${descreverEvento(e, players)}`)) deleteEvent(m.id, e.id);
  };

  if (passo.etapa === "escalacao") {
    return (
      <section className="space-y-4">
        {Placar}
        <Escalacao times={[m.mandanteId, m.visitanteId]} rosters={rosters} players={players} numeros={numeros} nomeTime={nomeTime}
          inicial={lineups} textoBotao="Salvar escalação"
          onConfirm={async (ls) => { await saveLineups(m.id, ls); setPasso({ etapa: "nada" }); }} />
        <button onClick={() => setPasso({ etapa: "nada" })} className="min-h-11 w-full rounded-lg border border-borda">Cancelar</button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {Placar}

      {passo.etapa === "nada" && (
        <div className="grid grid-cols-2 gap-3">
          {BOTOES.map((b) => (
            <button key={b.tipo} onClick={() => setPasso({ etapa: "time", tipo: b.tipo })} className={`min-h-16 rounded-xl text-lg font-semibold ${b.cls}`}>{b.label}</button>
          ))}
        </div>
      )}

      {passo.etapa === "time" && (
        <div className="space-y-2">
          <h3 className="text-sm text-suave">De qual time é o jogador?</h3>
          <div className="grid grid-cols-2 gap-3">
            {[m.mandanteId, m.visitanteId].map((t) => (
              <button key={t} onClick={() => setPasso({ etapa: "jogador", tipo: passo.tipo, teamId: t })} className="min-h-16 rounded-xl border border-cobre font-semibold">{nomeTime(t)}</button>
            ))}
          </div>
        </div>
      )}

      {passo.etapa === "jogador" && (
        <PlayerPicker
          titulo={passo.tipo === "gol" ? "Autor do gol" : "Jogador"}
          ids={lineupDe(passo.teamId)}
          players={players}
          numeros={numeros}
          onPick={(id) => passo.tipo === "gol" ? setPasso({ etapa: "assist", teamId: passo.teamId, playerId: id }) : registrar(passo.tipo, passo.teamId, id, null)}
        />
      )}

      {passo.etapa === "assist" && (
        <PlayerPicker
          titulo="Assistência"
          ids={lineupDe(passo.teamId).filter((id) => id !== passo.playerId)}
          players={players}
          numeros={numeros}
          onPick={(id) => registrar("gol", passo.teamId, passo.playerId, id)}
          extra={<button onClick={() => registrar("gol", passo.teamId, passo.playerId, null)} className="min-h-14 rounded-lg border border-borda px-3 text-suave">Sem assistência</button>}
        />
      )}

      {passo.etapa === "encerrar" && (
        <Encerrar
          ids={lineups.flatMap((l) => l.playerIds)}
          players={players}
          mataMata={m.fase !== "grupos"}
          empatado={placar.mandante === placar.visitante}
          nomes={[nomeTime(m.mandanteId), nomeTime(m.visitanteId)]}
          onConfirm={(mvp, pen) => closeMatch(m.id, mvp, pen)}
        />
      )}

      {passo.etapa !== "nada" && <button onClick={() => setPasso({ etapa: "nada" })} className="min-h-11 w-full rounded-lg border border-borda">Cancelar</button>}

      {passo.etapa === "nada" && (
        <>
          <EventList events={ordenados} players={players} teams={teams} onDelete={(e) => apagar(e, "Apagar este lance?")} />
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={!ultimo}
              onClick={() => ultimo && apagar(ultimo, "Apagar o último lance?")}
              className="min-h-14 rounded-xl border border-borda disabled:opacity-40"
            >
              Desfazer último lance
            </button>
            <button onClick={() => setPasso({ etapa: "encerrar" })} className="min-h-14 rounded-xl border border-cobre text-bronze">Encerrar jogo</button>
          </div>
          <button onClick={() => setPasso({ etapa: "escalacao" })} className="min-h-11 w-full rounded-lg border border-borda text-sm">Editar escalação</button>
        </>
      )}
    </section>
  );
}

function Escalacao({ times, rosters, players, numeros, nomeTime, onConfirm, textoBotao, inicial }: {
  times: string[]; rosters: Record<string, string[]>; players: Record<string, import("../../data/types").Player>;
  numeros: Record<string, number | null>; nomeTime(id: string): string; onConfirm(ls: Lineup[]): void;
  textoBotao: string; inicial?: Lineup[];
}) {
  const [fora, setFora] = useState<Set<string>>(() => {
    if (!inicial?.length) return new Set();
    const dentro = new Set(inicial.flatMap((l) => l.playerIds));
    return new Set(times.flatMap((t) => rosters[t]).filter((p) => !dentro.has(p)));
  });
  const [goleiro, setGoleiro] = useState<Record<string, string>>(() =>
    Object.fromEntries((inicial ?? []).filter((l) => l.goleiroId).map((l) => [l.teamId, l.goleiroId!])),
  );
  const lineups: Lineup[] = times.map((t) => ({ teamId: t, playerIds: rosters[t].filter((p) => !fora.has(p)), goleiroId: goleiro[t] ?? null }));
  const ok = lineups.every((l) => l.playerIds.length > 0 && l.goleiroId && l.playerIds.includes(l.goleiroId));
  return (
    <section className="space-y-4">
      <h1 className="text-2xl text-bronze">Escalação</h1>
      <p className="text-sm text-suave">Desmarque quem não veio e escolha o goleiro de cada time.</p>
      {times.map((t) => (
        <div key={t} className="space-y-2 rounded-xl border border-borda bg-superficie p-3">
          <h2 className="text-lg">{nomeTime(t)}</h2>
          {rosters[t].map((p) => (
            <div key={p} className="flex min-h-11 items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-5 accent-cobre" checked={!fora.has(p)}
                  onChange={(e) => { const s = new Set(fora); if (e.target.checked) s.delete(p); else s.add(p); setFora(s); }} />
                {numeros[p] != null && <span className="text-suave">{numeros[p]}</span>} {nomeCurto(players[p])}
              </label>
              <label className="flex items-center gap-1 text-xs text-suave">
                <input type="radio" name={`gol-${t}`} aria-label={`Goleiro ${nomeTime(t)}: ${nomeCurto(players[p])}`} className="size-5 accent-cobre"
                  checked={goleiro[t] === p} onChange={() => setGoleiro({ ...goleiro, [t]: p })} />
                GOL
              </label>
            </div>
          ))}
          {!rosters[t].length && <p className="text-sm text-suave">Elenco vazio. Peça ao admin para cadastrar os jogadores.</p>}
        </div>
      ))}
      <button disabled={!ok} onClick={() => onConfirm(lineups)} className="min-h-14 w-full rounded-xl bg-cobre text-lg font-semibold text-fundo disabled:opacity-40">{textoBotao}</button>
    </section>
  );
}

function Encerrar({ ids, players, mataMata, empatado, nomes, onConfirm }: {
  ids: string[]; players: Record<string, import("../../data/types").Player>; mataMata: boolean; empatado: boolean;
  nomes: [string, string]; onConfirm(mvp: string, pen: { mandante: number; visitante: number } | null): void;
}) {
  const [mvp, setMvp] = useState("");
  const [pen, setPen] = useState({ mandante: "", visitante: "" });
  const precisaPenaltis = mataMata && empatado;
  const penOk = !precisaPenaltis || (pen.mandante !== "" && pen.visitante !== "" && Number(pen.mandante) !== Number(pen.visitante));
  const cls = "mt-1 min-h-11 w-full rounded-lg border border-borda bg-fundo px-3";
  return (
    <div className="space-y-3 rounded-xl border border-cobre p-4">
      <h3 className="text-lg">Encerrar jogo</h3>
      <label className="block text-sm">MVP do jogo
        <select className={cls} value={mvp} onChange={(e) => setMvp(e.target.value)}>
          <option value="">Selecione</option>
          {ids.map((id) => <option key={id} value={id}>{nomeCurto(players[id])}</option>)}
        </select>
      </label>
      {precisaPenaltis && (
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">Pênaltis {nomes[0]}<input className={cls} type="number" min={0} inputMode="numeric" value={pen.mandante} onChange={(e) => setPen({ ...pen, mandante: e.target.value })} /></label>
          <label className="block text-sm">Pênaltis {nomes[1]}<input className={cls} type="number" min={0} inputMode="numeric" value={pen.visitante} onChange={(e) => setPen({ ...pen, visitante: e.target.value })} /></label>
        </div>
      )}
      <button
        disabled={!mvp || !penOk}
        onClick={() => onConfirm(mvp, precisaPenaltis ? { mandante: Number(pen.mandante), visitante: Number(pen.visitante) } : null)}
        className="min-h-14 w-full rounded-xl bg-cobre font-semibold text-fundo disabled:opacity-40"
      >
        Confirmar encerramento
      </button>
    </div>
  );
}
