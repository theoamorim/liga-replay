import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button, Card, Field, Select, inputCls } from "../../components/Field";
import TeamBadge from "../../components/TeamBadge";
import { generateSchedule, removeEntry, saveEntry, setCurrentSeason, updateSeason } from "../../data/admin";
import { useDocData } from "../../data/hooks";
import { useCurrentSeason, useEntries } from "../../data/seasons";
import { useTeams } from "../../data/teams";
import type { Season } from "../../data/types";
import { Voltar } from "./AdminHome";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const GRUPOS = ["A", "B", "C"];

export default function Temporada() {
  const { seasonId } = useParams();
  const { data: s } = useDocData<Season>(`seasons/${seasonId}`);
  const atual = useCurrentSeason().data;
  const { data: entries } = useEntries(seasonId);
  const { data: teams } = useTeams();
  const [cfg, setCfg] = useState<Season | null>(null);
  const [datas, setDatas] = useState(["", "", ""]);
  const [horarios, setHorarios] = useState("09:00, 09:40, 10:20");
  const [campos, setCampos] = useState("Campo 1, Campo 2");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { if (s && !cfg) setCfg(s); }, [s, cfg]);
  if (!s || !cfg) return <p className="text-suave">Carregando…</p>;

  const conv = cfg.config.convidados;
  const setConv = (patch: Partial<typeof conv>) => setCfg({ ...cfg, config: { ...cfg.config, convidados: { ...conv, ...patch } } });
  const grupoDe = Object.fromEntries(entries.map((e) => [e.id, e.grupo]));
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setMsg(null);
    try { await fn(); setMsg(ok); } catch (e) { setMsg(`Erro: ${(e as Error).message}`); }
  };

  return (
    <section className="space-y-4">
      <Voltar to="/admin/temporadas" texto="Temporadas" />
      <h1 className="text-3xl text-bronze">{s.nome}</h1>
      {msg && <p role="status" className="rounded-lg border border-borda bg-superficie p-3 text-sm">{msg}</p>}

      <Card>
        <h2 className="text-lg">Dados e regras</h2>
        <Field label="Nome" value={cfg.nome} onChange={(e) => setCfg({ ...cfg, nome: e.target.value })} />
        <Select label="Situação" value={cfg.status} onChange={(e) => setCfg({ ...cfg, status: e.target.value as Season["status"] })}>
          <option value="rascunho">Rascunho</option><option value="grupos">Fase de grupos</option>
          <option value="mata-mata">Mata-mata</option><option value="encerrada">Encerrada</option>
        </Select>
        <Select label="Formato do mata-mata" value={cfg.config.formatoMataMata} onChange={(e) => setCfg({ ...cfg, config: { ...cfg.config, formatoMataMata: e.target.value } })}>
          <option value="padrao-12-times">Padrão 12 times (6 diretos + melhor 3º + repescagem)</option>
          <option value="manual">Manual (admin monta os confrontos)</option>
        </Select>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Pts vitória" type="number" value={cfg.config.pontos.vitoria} onChange={(e) => setCfg({ ...cfg, config: { ...cfg.config, pontos: { ...cfg.config.pontos, vitoria: Number(e.target.value) } } })} />
          <Field label="Pts empate" type="number" value={cfg.config.pontos.empate} onChange={(e) => setCfg({ ...cfg, config: { ...cfg.config, pontos: { ...cfg.config.pontos, empate: Number(e.target.value) } } })} />
          <Field label="Pts derrota" type="number" value={cfg.config.pontos.derrota} onChange={(e) => setCfg({ ...cfg, config: { ...cfg.config, pontos: { ...cfg.config.pontos, derrota: Number(e.target.value) } } })} />
        </div>
        <h3 className="pt-2 text-base">Convidados</h3>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Limite por jogo" type="number" min={0} value={conv.limitePorJogo} onChange={(e) => setConv({ limitePorJogo: Number(e.target.value) })} />
          <Field label="Taxa (R$)" type="number" min={0} value={conv.taxa} onChange={(e) => setConv({ taxa: Number(e.target.value) })} />
          <Select label="Prazo: dia" value={conv.prazo.diaSemana} onChange={(e) => setConv({ prazo: { ...conv.prazo, diaSemana: Number(e.target.value) } })}>
            {DIAS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </Select>
          <Field label="Prazo: hora" type="time" value={conv.prazo.hora} onChange={(e) => setConv({ prazo: { ...conv.prazo, hora: e.target.value } })} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run(() => updateSeason(s.id, { nome: cfg.nome, status: cfg.status, config: cfg.config }), "Temporada salva.")}>Salvar</Button>
          {atual?.id !== s.id && <Button variant="secundario" onClick={() => run(() => setCurrentSeason(s.id), "Agora esta é a temporada exibida no site.")}>Tornar temporada atual</Button>}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg">Times e grupos</h2>
        <ul className="divide-y divide-borda">
          {teams.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2">
              <TeamBadge team={t} size="sm" />
              <span className="flex-1 truncate text-sm">{t.nome}</span>
              <select
                aria-label={`Grupo de ${t.nome}`}
                className={`${inputCls} mt-0 w-28`}
                value={grupoDe[t.id] ?? ""}
                onChange={(e) => run(() => (e.target.value ? saveEntry(s.id, t.id, { grupo: e.target.value }) : removeEntry(s.id, t.id)), "Grupos atualizados.")}
              >
                <option value="">Fora</option>
                {GRUPOS.map((g) => <option key={g} value={g}>Grupo {g}</option>)}
              </select>
            </li>
          ))}
        </ul>
        <p className="text-xs text-suave">{entries.length} times inscritos.</p>
      </Card>

      <Card>
        <h2 className="text-lg">Gerar tabela da fase de grupos</h2>
        {datas.map((d, i) => (
          <Field key={i} label={`Data da rodada ${i + 1}`} type="date" value={d} onChange={(e) => setDatas(datas.map((x, j) => (j === i ? e.target.value : x)))} />
        ))}
        <Field label="Horários (separados por vírgula)" value={horarios} onChange={(e) => setHorarios(e.target.value)} />
        <Field label="Campos (separados por vírgula)" value={campos} onChange={(e) => setCampos(e.target.value)} />
        <Button
          disabled={datas.some((d) => !d)}
          onClick={() => run(async () => {
            const n = await generateSchedule(s.id, datas, horarios.split(",").map((x) => x.trim()).filter(Boolean), campos.split(",").map((x) => x.trim()).filter(Boolean));
            setMsg(`${n} jogos criados.`);
          }, "")}
        >
          Gerar tabela
        </Button>
      </Card>
    </section>
  );
}
