import { collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useDocData, useQueryData } from "./hooks";
import type { Lineup, Match, MatchEvent } from "./types";

export const useMatches = (seasonId: string | undefined) =>
  useQueryData<Match>(seasonId ? `matches:${seasonId}` : null, () => query(collection(db, "matches"), where("seasonId", "==", seasonId)));

export function useMatch(matchId: string | undefined) {
  const match = useDocData<Match>(matchId ? `matches/${matchId}` : null);
  const events = useQueryData<MatchEvent>(matchId ? `events:${matchId}` : null, () => collection(db, "matches", matchId!, "events"));
  const lineups = useQueryData<Lineup>(matchId ? `lineups:${matchId}` : null, () => collection(db, "matches", matchId!, "lineups"), "teamId");
  return { match: match.data, events: events.data, lineups: lineups.data, loading: match.loading || events.loading || lineups.loading };
}

export function sortMatches(ms: Match[]): Match[] {
  return [...ms].sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario) || a.campo.localeCompare(b.campo));
}

export function sortEvents(evs: MatchEvent[]): MatchEvent[] {
  const t = (e: MatchEvent) => (e.criadoEm as { toMillis?: () => number } | undefined)?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
  return [...evs].sort((a, b) => (a.minuto ?? 0) - (b.minuto ?? 0) || t(a) - t(b));
}
