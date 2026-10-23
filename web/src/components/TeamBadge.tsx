import type { Team } from "../data/types";

const SIZES = { sm: "size-6 text-[10px]", md: "size-9 text-xs", lg: "size-16 text-lg" };

export default function TeamBadge({ team, size = "md" }: { team?: Team; size?: keyof typeof SIZES }) {
  const cls = `${SIZES[size]} shrink-0 rounded-full`;
  if (team?.escudoUrl) return <img src={team.escudoUrl} alt="" className={`${cls} object-cover`} loading="lazy" />;
  const iniciais = (team?.nome ?? "?").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden
      className={`${cls} flex items-center justify-center border border-borda font-semibold`}
      style={{ background: team?.cores?.primaria ?? "#2a2a2e", color: team?.cores?.secundaria ?? "#ede6dd" }}
    >
      {iniciais}
    </span>
  );
}
