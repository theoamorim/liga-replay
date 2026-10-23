import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";
import type { PlayerPrivado, PlayerPublico } from "../pages/admin/JogadorForm";
import type { Match, RosterEntry, SeasonConfig, Team } from "./types";

export const DEFAULT_CONFIG: SeasonConfig = {
  pontos: { vitoria: 3, empate: 1, derrota: 0 },
  formatoMataMata: "padrao-12-times",
  convidados: { limitePorJogo: 2, prazo: { diaSemana: 5, hora: "23:59" }, taxa: 35 },
};

export async function createSeason(nome: string, ano: number): Promise<string> {
  const ref = await addDoc(collection(db, "seasons"), { nome, ano, status: "rascunho", config: DEFAULT_CONFIG, criadoEm: serverTimestamp() });
  return ref.id;
}
export const updateSeason = (id: string, patch: Record<string, unknown>) => updateDoc(doc(db, "seasons", id), patch);
export const setCurrentSeason = (id: string) => setDoc(doc(db, "settings", "site"), { temporadaAtualId: id }, { merge: true });

export const saveEntry = (seasonId: string, teamId: string, data: { grupo: string; capitaoUid?: string | null; contato?: string }) =>
  setDoc(doc(db, "seasons", seasonId, "entries", teamId), data, { merge: true });
export const removeEntry = (seasonId: string, teamId: string) => deleteDoc(doc(db, "seasons", seasonId, "entries", teamId));

export async function generateSchedule(seasonId: string, datas: string[], horarios: string[], campos: string[]): Promise<number> {
  const fn = httpsCallable<unknown, { criados: number }>(functions, "generateSchedule");
  return (await fn({ seasonId, datas, horarios, campos })).data.criados;
}

export async function saveTeam(id: string | null, data: Omit<Team, "id">): Promise<string> {
  const slug = data.nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (id) { await setDoc(doc(db, "teams", id), { ...data, slug }, { merge: true }); return id; }
  return (await addDoc(collection(db, "teams"), { ...data, slug })).id;
}

export async function savePlayer(id: string | null, publico: PlayerPublico, privado: PlayerPrivado): Promise<string> {
  const ref = id ? doc(db, "players", id) : doc(collection(db, "players"));
  const batch = writeBatch(db);
  batch.set(ref, { ...publico, ...(id ? {} : { criadoEm: serverTimestamp() }) }, { merge: true });
  batch.set(doc(db, "players", ref.id, "private", "dados"), privado);
  await batch.commit();
  return ref.id;
}

export const saveRoster = (seasonId: string, playerId: string, data: Omit<RosterEntry, "playerId">) =>
  setDoc(doc(db, "seasons", seasonId, "rosters", playerId), data);
export const removeRoster = (seasonId: string, playerId: string) => deleteDoc(doc(db, "seasons", seasonId, "rosters", playerId));

export const updateMatch = (id: string, patch: Partial<Match>) => updateDoc(doc(db, "matches", id), patch);
export async function createMatch(data: Omit<Match, "id" | "placar" | "status">): Promise<string> {
  const ref = await addDoc(collection(db, "matches"), {
    ...data, placar: { mandante: 0, visitante: 0 }, status: "agendado", mvpPlayerId: null, penaltis: null, criadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function setUserRole(uid: string, roles: { admin?: boolean; mesario?: boolean; capitaoDe?: string[] }) {
  const fn = httpsCallable(functions, "setUserRole");
  return (await fn({ uid, ...roles })).data;
}
export const linkUserToPlayer = (uid: string, playerId: string | null) => updateDoc(doc(db, "users", uid), { playerId });
