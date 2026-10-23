import { useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { Button, Card, Field, Select } from "../../components/Field";
import { idade } from "../../lib/mask";

export const POSICOES = ["Goleiro", "Fixo", "Ala", "Meia", "Pivô"];
export const CONSENTIMENTO_VERSAO = "2026-10";

export interface PlayerPublico { nome: string; apelido: string; posicao: string; instagram: string; fotoUrl: string | null; menor: boolean }
export interface PlayerPrivado {
  telefone: string; documento: string; dataNascimento: string;
  consentimento: { versaoTermos: string; aceitoEm: string };
  responsavel?: { nome: string; telefone: string; documento: string; consentimentoEm: string };
}

interface Props {
  playerId?: string;
  initial?: { publico?: Partial<PlayerPublico>; privado?: Partial<PlayerPrivado> };
  onSave(publico: PlayerPublico, privado: PlayerPrivado): Promise<void> | void;
  hoje?: Date;
}

export default function JogadorForm({ playerId, initial, onSave, hoje = new Date() }: Props) {
  const ip = initial?.publico ?? {};
  const iv = initial?.privado ?? {};
  const [f, setF] = useState({
    nome: ip.nome ?? "", apelido: ip.apelido ?? "", posicao: ip.posicao ?? "", instagram: ip.instagram ?? "", fotoUrl: ip.fotoUrl ?? null,
    telefone: iv.telefone ?? "", documento: iv.documento ?? "", dataNascimento: iv.dataNascimento ?? "",
    consentimento: !!iv.consentimento,
    respNome: iv.responsavel?.nome ?? "", respTel: iv.responsavel?.telefone ?? "", respDoc: iv.responsavel?.documento ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const menor = !!f.dataNascimento && idade(f.dataNascimento, hoje) < 18;

  const salvar = async () => {
    if (!f.nome.trim() || !f.apelido.trim() || !f.posicao) return setErro("Preencha nome, apelido e posição.");
    if (!f.consentimento) return setErro("Confirme o consentimento do jogador para o uso dos dados.");
    if (menor && (!f.respNome.trim() || !f.respTel.trim() || !f.respDoc.trim())) {
      return setErro("Jogador menor de 18 anos: preencha os dados do responsável.");
    }
    setErro(null);
    const agora = new Date().toISOString();
    const publico: PlayerPublico = {
      nome: f.nome.trim(), apelido: f.apelido.trim(), posicao: f.posicao,
      instagram: f.instagram.trim().replace(/^@/, ""), fotoUrl: f.fotoUrl, menor,
    };
    const privado: PlayerPrivado = {
      telefone: f.telefone.trim(), documento: f.documento.trim(), dataNascimento: f.dataNascimento,
      consentimento: iv.consentimento ?? { versaoTermos: CONSENTIMENTO_VERSAO, aceitoEm: agora },
      ...(menor ? { responsavel: { nome: f.respNome.trim(), telefone: f.respTel.trim(), documento: f.respDoc.trim(), consentimentoEm: iv.responsavel?.consentimentoEm ?? agora } } : {}),
    };
    setSalvando(true);
    try { await onSave(publico, privado); } finally { setSalvando(false); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg">Dados públicos</h2>
        <Field label="Nome completo" value={f.nome} onChange={set("nome")} />
        <Field label="Apelido" value={f.apelido} onChange={set("apelido")} />
        <Select label="Posição" value={f.posicao} onChange={set("posicao")}>
          <option value="">Selecione</option>
          {POSICOES.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Field label="Instagram" value={f.instagram} onChange={set("instagram")} placeholder="@usuario" />
        {playerId && <ImageUpload label="Foto" path={`players/${playerId}/foto.jpg`} currentUrl={f.fotoUrl} onUploaded={(url) => setF((x) => ({ ...x, fotoUrl: url }))} />}
      </Card>
      <Card>
        <h2 className="text-lg">Dados privados <span className="text-xs text-suave">(só a administração vê)</span></h2>
        <Field label="Telefone" inputMode="tel" value={f.telefone} onChange={set("telefone")} />
        <Field label="Documento (CPF ou RG)" value={f.documento} onChange={set("documento")} />
        <Field label="Data de nascimento" type="date" value={f.dataNascimento} onChange={set("dataNascimento")} />
        {menor && (
          <div className="space-y-3 rounded-lg border border-bronze/40 p-3">
            <p className="text-sm text-bronze">Menor de 18 anos: dados e consentimento do responsável são obrigatórios.</p>
            <Field label="Nome do responsável" value={f.respNome} onChange={set("respNome")} />
            <Field label="Telefone do responsável" inputMode="tel" value={f.respTel} onChange={set("respTel")} />
            <Field label="Documento do responsável" value={f.respDoc} onChange={set("respDoc")} />
          </div>
        )}
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className="size-5 accent-cobre" checked={f.consentimento} onChange={(e) => setF({ ...f, consentimento: e.target.checked })} />
          {menor ? "O responsável autorizou o uso dos dados conforme a política de privacidade." : "O jogador autorizou o uso dos dados conforme a política de privacidade."}
        </label>
      </Card>
      {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}
      <Button onClick={salvar} disabled={salvando} className="w-full">Salvar</Button>
    </div>
  );
}
