import { useState } from "react";
import { Navigate } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../auth/AuthContext";
import { auth, useEmulators } from "../../firebase";
import { isInAppBrowser } from "../../auth/signIn";

export default function Entrar() {
  const { user, signIn, loading } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  if (!loading && user) return <Navigate to="/conta" replace />;
  return (
    <section className="mx-auto max-w-sm space-y-5 pt-8 text-center">
      <h1 className="text-3xl text-bronze">Entrar</h1>
      <p className="text-sm text-suave">Jogadores, capitães, mesários e administração entram com a conta Google.</p>
      {isInAppBrowser() && (
        <p role="alert" className="rounded-lg border border-bronze/50 p-3 text-left text-sm text-bronze">
          Você abriu o site dentro de um app (Instagram, WhatsApp…). O Google não permite login aqui: toque nos três pontinhos
          e escolha <strong>Abrir no navegador</strong> (Chrome ou Safari).
        </p>
      )}
      <button
        onClick={() => signIn().catch(() => setErro("Não foi possível entrar. Tente novamente."))}
        className="min-h-12 w-full rounded-lg bg-cobre font-semibold text-fundo"
      >
        Entrar com Google
      </button>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {useEmulators && <LoginEmulador onErro={setErro} />}
    </section>
  );
}

/** Só aparece no ambiente de testes (emulador): login com e-mail e senha dos usuários de exemplo. */
function LoginEmulador({ onErro }: { onErro(msg: string): void }) {
  const [email, setEmail] = useState("admin@teste.com");
  const [senha, setSenha] = useState("senha123");
  const cls = "mt-1 min-h-11 w-full rounded-lg border border-borda bg-fundo px-3";
  return (
    <div className="space-y-2 rounded-xl border border-dashed border-borda p-4 text-left">
      <p className="text-xs text-suave">Ambiente de testes</p>
      <label className="block text-sm">E-mail<input className={cls} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="block text-sm">Senha<input className={cls} type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
      <button onClick={() => signInWithEmailAndPassword(auth, email, senha).catch(() => onErro("Login de teste falhou."))} className="min-h-11 w-full rounded-lg border border-cobre text-bronze">
        Entrar (emulador)
      </button>
    </div>
  );
}
