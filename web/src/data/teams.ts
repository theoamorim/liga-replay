import { collection } from "firebase/firestore";
import { useMemo } from "react";
import { db } from "../firebase";
import { useDocData, useQueryData } from "./hooks";
import type { Team } from "./types";

export const useTeams = () => useQueryData<Team>("teams", () => collection(db, "teams"));
export const useTeam = (teamId: string | undefined) => useDocData<Team>(teamId ? `teams/${teamId}` : null);

export function useTeamMap(): Record<string, Team> {
  const { data } = useTeams();
  return useMemo(() => Object.fromEntries(data.map((t) => [t.id, t])), [data]);
}
