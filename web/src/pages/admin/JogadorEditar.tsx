import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Field, Select } from "../../components/Field";
import { removeRoster, savePlayer, saveRoster } from "../../data/admin";
import { usePlayerRosterEntry } from "../../data/players";
import { useCurrentSeason, useEntries } from "../../data/seasons";
import { useTeamMap } from "../../data/teams";
import { db } from "../../firebase";
import { maskDocumento } from "../../lib/mask";
import { Voltar } from "./AdminHome";
import JogadorForm, { type PlayerPrivado, type PlayerPublico } from "./JogadorForm";

export default function JogadorEditar() {
  const { playerId } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState<{ publico: Partial<PlayerPublico>; privado: Partial<PlayerPrivado> } | null>(playerId ? null : { publico: {}, privado: {} });

  useEffect(() => {
    if (!playerId) return;
    Promise.all([getDoc(doc(db, "players", playerId)), getDoc(doc(db, "players", playerId, "private", "dados"))]).then(([p, v]) =>
      setInitial({ publico: (p.data() ?? {}) as Partial<PlayerPublico>, privado: (v.data() ?? {}) as Partial<PlayerPrivado> }),
    );
  }, [playerId]);

  if (!initial) return <p className="text-suave">Carregando…</p>;
  return (
    <section className="space-y-4">
      <Voltar to="/admin/jogadores" texto="Jogadores" />
      <h1 className="text-3xl text-bronze">{playerId ? initial.publico.nome : "Novo jogador"}</h1>
      {initial.privado.documento && <p className="text-xs text-suave">Documento atual: {maskDocumento(initial.privado.documento)}</p>}
      <JogadorForm
        key={playerId ?? "novo"}
        playerId={playerId}
        initial={initial}
        onSave={async (publico, privado) => {
          const id = await savePlayer(playerId ?? null, publico, privado);
          if (!playerId) nav(`/admin/jogadores/${id}`, { replace: true });
        }}
      />
      {playerId && <Vinculo playerId={playerId} />}
    </section>
  );
}

function Vinculo({ playerId }: { playerId: string }) {
  const season = useCurrentSeason().data;
  const entries = useEntries(season?.id).data;
  const teams = useTeamMap();
  const atual = usePlayerRosterEntry(season?.id, playerId).data;
  const [f, setF] = useState({ teamId: "", numero: "", tipo: "inscrito" as "inscrito" | "convidado" });
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (atual) setF({ teamId: atual.teamId, numero: atual.numero?.toString() ?? "", tipo: atual.tipo }); }, [atual]);
  if (!season) return <Card><p className="text-sm text-suave">Defina a temporada atual para vincular o jogador a um time.</p></Card>;
  return (
    <Card>
      <h2 className="text-lg">Time em {season.nome}</h2>
      <Select label="Time" value={f.teamId} onChange={(e) => setF({ ...f, teamId: e.target.value })}>
        <option value="">Sem time</option>
        {entries.map((e) => <option key={e.id} value={e.id}>{teams[e.id]?.nome ?? e.id}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Nº da camisa" type="number" min={0} value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} />
        <Select label="Tipo" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as typeof f.tipo })}>
          <option value="inscrito">Inscrito</option><option value="convidado">Convidado</option>
        </Select>
      </div>
      <Button
        onClick={async () => {
          if (f.teamId) await saveRoster(season.id, playerId, { teamId: f.teamId, numero: f.numero ? Number(f.numero) : null, tipo: f.tipo });
          else await removeRoster(season.id, playerId);
          setMsg("Vínculo salvo.");
        }}
      >
        Salvar vínculo
      </Button>
      {msg && <p className="text-sm text-bronze">{msg}</p>}
    </Card>
  );
}
