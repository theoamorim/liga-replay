import { collection } from "firebase/firestore";
import { db } from "../firebase";
import { useQueryData } from "./hooks";

export interface AppUser {
  id: string; nome: string; email: string; playerId?: string | null;
  papeis?: { admin: boolean; mesario: boolean; capitaoDe: string[] };
}
export const useUsers = () => useQueryData<AppUser>("users", () => collection(db, "users"));
