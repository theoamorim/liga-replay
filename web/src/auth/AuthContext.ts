import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export interface Claims {
  admin: boolean;
  mesario: boolean;
  capitaoDe: string[];
}

export interface UserProfile {
  termosVersao: string | null;
  playerId?: string | null;
}

export interface AuthState {
  user: User | null;
  claims: Claims;
  profile: UserProfile | null;
  loading: boolean;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export const NO_CLAIMS: Claims = { admin: false, mesario: false, capitaoDe: [] };

export const AuthContext = createContext<AuthState>({
  user: null, claims: NO_CLAIMS, profile: null, loading: true,
  signIn: async () => {}, signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);
