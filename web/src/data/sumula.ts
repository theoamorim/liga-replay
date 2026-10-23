import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { EventTipo, Lineup } from "./types";

export async function startMatch(matchId: string, lineups: Lineup[]): Promise<void> {
  // status primeiro: as regras só liberam escalação com o jogo ao vivo
  await updateDoc(doc(db, "matches", matchId), { status: "ao-vivo" });
  await saveLineups(matchId, lineups);
}

export async function saveLineups(matchId: string, lineups: Lineup[]): Promise<void> {
  await Promise.all(lineups.map((l) => setDoc(doc(db, "matches", matchId, "lineups", l.teamId), { playerIds: l.playerIds, goleiroId: l.goleiroId ?? null })));
}

export async function addEvent(matchId: string, ev: { tipo: EventTipo; teamId: string; playerId: string; assistPlayerId: string | null }): Promise<void> {
  await addDoc(collection(db, "matches", matchId, "events"), { ...ev, criadoPor: auth.currentUser?.uid ?? null, criadoEm: serverTimestamp() });
}

export const deleteEvent = (matchId: string, eventId: string) => deleteDoc(doc(db, "matches", matchId, "events", eventId));

export const closeMatch = (matchId: string, mvpPlayerId: string, penaltis: { mandante: number; visitante: number } | null) =>
  updateDoc(doc(db, "matches", matchId), { status: "encerrado", mvpPlayerId, penaltis });
