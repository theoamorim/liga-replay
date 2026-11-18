import type { Player } from "../data/types";

export const nomeCurto = (p?: Player) => p?.apelido || p?.nome || "…";
