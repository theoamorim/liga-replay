import { collection, query, where } from "firebase/firestore";
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
