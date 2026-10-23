import { collection } from "firebase/firestore";
import { db } from "../firebase";
import { useQueryData } from "./hooks";
import type { PlayerStat, Standing } from "./types";

export const useStandings = (seasonId: string | undefined) =>
  useQueryData<Standing>(seasonId ? `standings:${seasonId}` : null, () => collection(db, "seasons", seasonId!, "standings"), "teamId");

export const usePlayerStats = (seasonId: string | undefined) =>
  useQueryData<PlayerStat>(seasonId ? `stats:${seasonId}` : null, () => collection(db, "seasons", seasonId!, "playerStats"), "playerId");
