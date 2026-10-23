import { collection, doc, getDoc, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useDocData, useQueryData } from "./hooks";
import type { Player, RosterEntry } from "./types";

export const usePlayer = (playerId: string | undefined) => useDocData<Player>(playerId ? `players/${playerId}` : null);

export const useRoster = (seasonId: string | undefined, teamId: string | undefined) =>
  useQueryData<RosterEntry>(
    seasonId && teamId ? `roster:${seasonId}:${teamId}` : null,
    () => query(collection(db, "seasons", seasonId!, "rosters"), where("teamId", "==", teamId)),
    "playerId",
  );

export const usePlayerRosterEntry = (seasonId: string | undefined, playerId: string | undefined) =>
  useDocData<RosterEntry>(seasonId && playerId ? `seasons/${seasonId}/rosters/${playerId}` : null);

export const usePlayers = () => useQueryData<Player>("players", () => collection(db, "players"));

export function usePlayersByIds(ids: string[]): Record<string, Player> {
  const [map, setMap] = useState<Record<string, Player>>({});
  const chave = [...new Set(ids.filter(Boolean))].sort().join(",");
  useEffect(() => {
    const faltando = chave ? chave.split(",").filter((id) => !(id in map)) : [];
    if (!faltando.length) return;
    Promise.all(faltando.map((id) => getDoc(doc(db, "players", id)))).then((snaps) =>
      setMap((m) => ({ ...m, ...Object.fromEntries(snaps.map((s) => [s.id, { id: s.id, ...(s.data() ?? { nome: "Jogador", apelido: "" }) } as Player])) })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
  return map;
}

