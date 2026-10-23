import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const TERMOS_VERSAO = "2026-10";

export async function acceptTerms(uid: string): Promise<void> {
  await setDoc(doc(db, "users", uid), { termosAceitosEm: serverTimestamp(), termosVersao: TERMOS_VERSAO }, { merge: true });
}

export async function requestDeletion(uid: string): Promise<void> {
  await setDoc(doc(db, "deletionRequests", uid), { pedidoEm: serverTimestamp() });
}
