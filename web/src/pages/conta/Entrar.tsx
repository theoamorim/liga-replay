import { useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";

export default function Entrar() {
  const { user, signIn, loading } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  if (!loading && user) return <Navigate to="/conta" replace />;
  return (
    <section className="mx-auto max-w-sm space-y-5 pt-8 text-center">
      <h1 className="text-3xl text-bronze">Entrar</h1>
      <p className="text-sm text-suave">Jogadores, capitães, mesários e administração entram com a conta Google.</p>
      <button
        onClick={() => signIn().catch(() => setErro("Não foi possível entrar. Tente novamente."))}
        className="min-h-12 w-full rounded-lg bg-cobre font-semibold text-fundo"
      >
        Entrar com Google
      </button>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
    </section>
  );
}
