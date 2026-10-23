import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User } from "firebase/auth";
import { signInGoogle } from "./signIn";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState, type ReactNode } from "react";
import { auth, db } from "../firebase";
import { AuthContext, NO_CLAIMS, type Claims, type UserProfile } from "./AuthContext";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<Claims>(NO_CLAIMS);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    if (!u) { setClaims(NO_CLAIMS); setProfile(null); setLoading(false); }
  }), []);

  useEffect(() => {
    if (!user) return;
    // quando o servidor muda os papéis no doc do usuário, renova o token para ler as claims novas
    return onSnapshot(doc(db, "users", user.uid), async (snap) => {
      const data = snap.data();
      setProfile({ termosVersao: data?.termosVersao ?? null, playerId: data?.playerId ?? null });
      const token = await user.getIdTokenResult(true);
      setClaims({
        admin: token.claims.admin === true,
        mesario: token.claims.mesario === true,
        capitaoDe: (token.claims.capitaoDe as string[] | undefined) ?? [],
      });
      setLoading(false);
    });
  }, [user]);

  const value = {
    user, claims, profile, loading,
    signIn: () => signInGoogle({ popup: () => signInWithPopup(auth, new GoogleAuthProvider()), redirect: () => signInWithRedirect(auth, new GoogleAuthProvider()) }),
    signOut: async () => { await fbSignOut(auth); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
