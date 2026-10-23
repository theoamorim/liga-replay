import { useState } from "react";
import { Card, Select } from "../../components/Field";
import { linkUserToPlayer, setUserRole } from "../../data/admin";
import { usePlayers } from "../../data/players";
import { useTeams } from "../../data/teams";
import type { Player, Team } from "../../data/types";
import { useUsers, type AppUser } from "../../data/users-admin";
import { Voltar } from "./AdminHome";

export default function Usuarios() {
  const { data: users } = useUsers();
  const players = usePlayers().data;
  const teams = useTeams().data;
  return (
    <section className="space-y-4">
      <Voltar to="/admin" texto="Administração" />
      <h1 className="text-3xl text-bronze">Usuários e papéis</h1>
      <p className="text-sm text-suave">A pessoa aparece aqui depois de entrar no site com a conta Google pela primeira vez.</p>
      {[...users].sort((a, b) => (a.nome || a.email).localeCompare(b.nome || b.email)).map((u) => <UsuarioCard key={u.id} u={u} players={players} teams={teams} />)}
    </section>
  );
}

function UsuarioCard({ u, players, teams }: { u: AppUser; players: Player[]; teams: Team[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const papeis = u.papeis ?? { admin: false, mesario: false, capitaoDe: [] };
  const salvar = async (roles: Partial<typeof papeis>) => {
    setMsg("Salvando…");
    try { await setUserRole(u.id, roles); setMsg("Papéis atualizados."); } catch (e) { setMsg(`Erro: ${(e as Error).message}`); }
  };
  const check = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <input type="checkbox" className="size-5 accent-cobre" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}
    </label>
  );
  return (
    <Card>
      <div>
        <div className="font-medium">{u.nome || "(sem nome)"}</div>
        <div className="text-xs text-suave">{u.email}</div>
      </div>
      <div className="flex flex-wrap gap-x-6">
        {check("Admin", papeis.admin, (v) => salvar({ admin: v }))}
        {check("Mesário", papeis.mesario, (v) => salvar({ mesario: v }))}
      </div>
      <Select label="Capitão de" value={papeis.capitaoDe[0] ?? ""} onChange={(e) => salvar({ capitaoDe: e.target.value ? [e.target.value] : [] })}>
        <option value="">Nenhum time</option>
        {teams.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
      </Select>
      <Select label="Jogador vinculado" value={u.playerId ?? ""} onChange={async (e) => { await linkUserToPlayer(u.id, e.target.value || null); setMsg("Vínculo salvo."); }}>
        <option value="">Nenhum</option>
        {[...players].sort((a, b) => a.nome.localeCompare(b.nome)).map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.apelido})</option>)}
      </Select>
      {msg && <p className="text-xs text-bronze">{msg}</p>}
    </Card>
  );
}
