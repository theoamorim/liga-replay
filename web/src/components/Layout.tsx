import { Link, Outlet } from "react-router";
import NavBar from "./NavBar";
import { useAuth } from "../auth/AuthContext";
import TermsGate from "../pages/conta/TermsGate";

export default function Layout() {
  const { user } = useAuth();
  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-borda bg-fundo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-bold text-bronze">Liga Replay</span>
            <span className="text-xs tracking-widest text-suave">FUT7</span>
          </Link>
          <NavBar variant="top" />
          <Link to={user ? "/conta" : "/entrar"} className="flex min-h-11 items-center text-sm text-suave hover:text-texto">
            {user ? "Minha conta" : "Entrar"}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <TermsGate>
          <Outlet />
        </TermsGate>
      </main>
      <NavBar variant="bottom" />
    </div>
  );
}
