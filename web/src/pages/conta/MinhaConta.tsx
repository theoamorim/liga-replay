import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { requestDeletion } from "../../data/users";
import { db } from "../../firebase";

export default function MinhaConta() {
  const { user, claims, profile, loading, signOut } = useAuth();
  const [form, setForm] = useState({ apelido: "", instagram: "", telefone: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const playerId = profile?.playerId;

  useEffect(() => {
    if (!playerId) return;
    Promise.all([getDoc(doc(db, "players", playerId)), getDoc(doc(db, "players", playerId, "private", "dados"))]).then(([p, priv]) =>
      setForm({ apelido: p.get("apelido") ?? "", instagram: p.get("instagram") ?? "", telefone: priv.get("telefone") ?? "" }),
    );
  }, [playerId]);

  if (loading) return <p className="text-suave">Carregando…</p>;
  if (!user) return <Navigate to="/entrar" replace />;

  const salvar = async () => {
    if (!playerId) return;
    await updateDoc(doc(db, "players", playerId), { apelido: form.apelido, instagram: form.instagram.replace(/^@/, "") });
    await setDoc(doc(db, "players", playerId, "private", "dados"), { telefone: form.telefone }, { merge: true });
    setMsg("Dados salvos.");
  };

  const input = "min-h-11 w-full rounded-lg border border-borda bg-fundo px-3";
  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl text-bronze">Minha conta</h1>
        <p className="text-sm text-suave">{user.displayName} · {user.email}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {claims.admin && <Link to="/admin" className="rounded-lg border border-cobre px-4 py-2 text-bronze">Administração</Link>}
        {(claims.mesario || claims.admin) && <Link to="/mesario" className="rounded-lg border border-cobre px-4 py-2 text-bronze">Súmulas (mesário)</Link>}
        {playerId && <Link to={`/jogadores/${playerId}`} className="rounded-lg border border-borda px-4 py-2">Meu perfil público</Link>}
      </div>

      {playerId ? (
        <div className="space-y-3 rounded-xl border border-borda bg-superficie p-4">
          <h2 className="text-lg">Meus dados</h2>
          <label className="block text-sm">Apelido<input className={input} value={form.apelido} onChange={(e) => setForm({ ...form, apelido: e.target.value })} /></label>
          <label className="block text-sm">Instagram<input className={input} value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></label>
          <label className="block text-sm">Telefone (só a administração vê)<input className={input} inputMode="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></label>
          <button onClick={salvar} className="min-h-11 w-full rounded-lg bg-cobre font-semibold text-fundo">Salvar</button>
          {msg && <p className="text-sm text-bronze">{msg}</p>}
        </div>
      ) : (
        <p className="text-sm text-suave">Sua conta ainda não está vinculada a um jogador. Peça à administração da liga para fazer o vínculo.</p>
      )}

      <div className="space-y-2 border-t border-borda pt-4">
        <button onClick={signOut} className="min-h-11 w-full rounded-lg border border-borda">Sair</button>
        <button
          onClick={async () => {
            if (!confirm("Pedir a exclusão dos seus dados pessoais? A administração vai processar o pedido.")) return;
            await requestDeletion(user.uid);
            setMsg("Pedido de exclusão enviado.");
          }}
          className="min-h-11 w-full text-sm text-suave underline"
        >
          Pedir exclusão dos meus dados
        </button>
      </div>
    </section>
  );
}
