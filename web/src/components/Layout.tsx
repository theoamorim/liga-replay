import { Link, Outlet } from "react-router";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-borda bg-fundo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-bold text-bronze">Liga Replay</span>
            <span className="text-xs tracking-widest text-suave">FUT7</span>
          </Link>
          <NavBar variant="top" />
          <Link to="/conta" className="flex min-h-11 items-center text-sm text-suave hover:text-texto">
            Entrar
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      <NavBar variant="bottom" />
    </div>
  );
}
