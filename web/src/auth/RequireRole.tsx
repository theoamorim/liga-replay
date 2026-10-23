import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";

export default function RequireRole({ role, children }: { role: "admin" | "mesario"; children: ReactNode }) {
  const { user, claims, loading } = useAuth();
  if (loading) return <p className="text-suave">Carregando…</p>;
  if (!user) return <Navigate to="/entrar" replace />;
  const ok = claims.admin || (role === "mesario" && claims.mesario);
  if (!ok) return <p className="text-suave">Você está sem permissão para acessar esta área.</p>;
  return <>{children}</>;
}
