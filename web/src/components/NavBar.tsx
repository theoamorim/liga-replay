import { NavLink } from "react-router";

export const NAV_ITEMS = [
  { to: "/", label: "Início" },
  { to: "/jogos", label: "Jogos" },
  { to: "/classificacao", label: "Classificação" },
  { to: "/mata-mata", label: "Mata-mata" },
  { to: "/estatisticas", label: "Estatísticas" },
  { to: "/times", label: "Times" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center justify-center px-2 text-xs md:text-sm font-medium transition-colors ${
    isActive ? "text-bronze" : "text-suave hover:text-texto"
  }`;

export default function NavBar({ variant }: { variant: "top" | "bottom" }) {
  if (variant === "top") {
    return (
      <nav className="hidden md:flex gap-4">
        {NAV_ITEMS.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.to === "/"} className={linkClass}>
            {i.label}
          </NavLink>
        ))}
      </nav>
    );
  }
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-borda bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {NAV_ITEMS.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.to === "/"} className={linkClass}>
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}
