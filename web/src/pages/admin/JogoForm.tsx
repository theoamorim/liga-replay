import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Field, Select } from "../../components/Field";
import { createMatch, updateMatch } from "../../data/admin";
import { useMatch } from "../../data/matches";
import { useCurrentSeason, useEntries, useQualificacao } from "../../data/seasons";
import { useStandings } from "../../data/stats";
import { useTeamMap } from "../../data/teams";
import { FASE_LABEL, type Fase } from "../../data/types";
import { useUsers } from "../../data/users-admin";
import { Voltar } from "./AdminHome";

const FASES_MM: Fase[] = ["repescagem-semi", "repescagem-final", "quartas", "semi", "final"];

export default function JogoForm() {
  const { matchId } = useParams();
  const nav = useNavigate();
  const season = useCurrentSeason().data;
  const { match } = useMatch(matchId);
  const entries = useEntries(season?.id).data;
  const teams = useTeamMap();
  const mesarios = useUsers().data.filter((u) => u.papeis?.mesario || u.papeis?.admin);
  const standings = useStandings(season?.id).data;
  const qual = useQualificacao(season?.id).data;
  const [f, setF] = useState({ fase: "quartas" as Fase, mandanteId: "", visitanteId: "", data: "", horario: "09:00", campo: "Campo 1", mesarioUid: "" });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (match) setF({ fase: match.fase, mandanteId: match.mandanteId, visitanteId: match.visitanteId, data: match.data, horario: match.horario, campo: match.campo, mesarioUid: match.mesarioUid ?? "" });
  }, [match]);

  const novo = !matchId;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const quartas = standings.filter((s) => s.situacao === "quartas").map((s) => s.teamId);
  const repescagem = standings.filter((s) => s.situacao === "repescagem").map((s) => s.teamId);

  return (
    <section className="space-y-4">
      <Voltar to="/admin/jogos" texto="Jogos" />
      <h1 className="text-3xl text-bronze">{novo ? "Novo jogo de mata-mata" : "Editar jogo"}</h1>
      {msg && <p role="status" className="rounded-lg border border-borda bg-superficie p-3 text-sm">{msg}</p>}

      {novo && qual && (
        <Card>
          <h2 className="text-lg">Qualificação calculada {qual.completo ? "" : "(provisória)"}</h2>
          <p className="text-sm"><span className="text-bronze">Quartas:</span> {quartas.map((id) => teams[id]?.nome).join(", ") || "—"}</p>
          <p className="text-sm"><span className="text-bronze">Repescagem:</span> {repescagem.map((id) => teams[id]?.nome).join(", ") || "—"}</p>
        </Card>
      )}

      <Card>
        {novo && (
          <>
            <Select label="Fase" value={f.fase} onChange={set("fase")}>
              {FASES_MM.map((x) => <option key={x} value={x}>{FASE_LABEL[x]}</option>)}
            </Select>
            <Select label="Mandante" value={f.mandanteId} onChange={set("mandanteId")}>
              <option value="">Selecione</option>
              {entries.map((e) => <option key={e.id} value={e.id}>{teams[e.id]?.nome ?? e.id}</option>)}
            </Select>
            <Select label="Visitante" value={f.visitanteId} onChange={set("visitanteId")}>
              <option value="">Selecione</option>
              {entries.map((e) => <option key={e.id} value={e.id}>{teams[e.id]?.nome ?? e.id}</option>)}
            </Select>
          </>
        )}
        {!novo && match && <p className="text-sm">{teams[match.mandanteId]?.nome} vs {teams[match.visitanteId]?.nome} · {match.status}</p>}
        <Field label="Data" type="date" value={f.data} onChange={set("data")} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Horário" type="time" value={f.horario} onChange={set("horario")} />
          <Select label="Campo" value={f.campo} onChange={set("campo")}><option>Campo 1</option><option>Campo 2</option></Select>
        </div>
        <Select label="Mesário" value={f.mesarioUid} onChange={set("mesarioUid")}>
          <option value="">Sem mesário</option>
          {mesarios.map((u) => <option key={u.id} value={u.id}>{u.nome || u.email}</option>)}
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={novo && (!season || !f.mandanteId || !f.visitanteId || f.mandanteId === f.visitanteId || !f.data)}
            onClick={async () => {
              if (novo) {
                const id = await createMatch({ seasonId: season!.id, fase: f.fase, rodada: 0, mandanteId: f.mandanteId, visitanteId: f.visitanteId, data: f.data, horario: f.horario, campo: f.campo, mesarioUid: f.mesarioUid || null });
                nav(`/admin/jogos/${id}`, { replace: true });
              } else {
                await updateMatch(matchId!, { data: f.data, horario: f.horario, campo: f.campo, mesarioUid: f.mesarioUid || null });
                setMsg("Jogo salvo.");
              }
            }}
          >
            Salvar
          </Button>
          {match?.status === "encerrado" && (
            <Button variant="secundario" onClick={async () => { await updateMatch(matchId!, { status: "ao-vivo" }); setMsg("Súmula reaberta para correção."); }}>
              Reabrir súmula
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
}
