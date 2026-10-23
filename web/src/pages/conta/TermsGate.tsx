import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { acceptTerms, TERMOS_VERSAO } from "../../data/users";

export default function TermsGate({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [marcado, setMarcado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!user || !profile || profile.termosVersao === TERMOS_VERSAO) return <>{children}</>;

  return (
    <section className="mx-auto max-w-lg space-y-4 rounded-xl border border-borda bg-superficie p-5">
      <h1 className="text-2xl text-bronze">Termos de uso e privacidade</h1>
      <p className="text-sm text-suave">
        Para usar sua conta na Liga Replay, precisamos do seu aceite. Usamos seus dados apenas para organizar a liga:
        cadastro de jogadores, súmulas, estatísticas e contato. Telefone, documento e data de nascimento ficam visíveis
        só para a administração.
      </p>
      <Link to="/privacidade" className="text-sm text-bronze underline">Ler a política de privacidade completa</Link>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" className="size-5 accent-cobre" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} />
        Li e concordo com os termos e a política de privacidade.
      </label>
      <button
        disabled={!marcado || enviando}
        onClick={async () => { setEnviando(true); try { await acceptTerms(user.uid); } finally { setEnviando(false); } }}
        className="min-h-11 w-full rounded-lg bg-cobre font-semibold text-fundo disabled:opacity-40"
      >
        Aceito
      </button>
    </section>
  );
}
