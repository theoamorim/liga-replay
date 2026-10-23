import { HttpsError, onCall } from "firebase-functions/v2/https";
import { auth, db, REGION } from "../admin";
import { requireAdmin } from "./guards";

interface Input { uid: string; admin?: boolean; mesario?: boolean; capitaoDe?: string[] }

export const setUserRole = onCall<Input>({ region: REGION }, async (req) => {
  requireAdmin(req);
  const { uid, admin, mesario, capitaoDe } = req.data ?? ({} as Input);
  if (!uid) throw new HttpsError("invalid-argument", "uid obrigatório.");
  const user = await auth.getUser(uid);
  const atual = user.customClaims ?? {};
  const claims = {
    admin: admin ?? atual.admin ?? false,
    mesario: mesario ?? atual.mesario ?? false,
    capitaoDe: capitaoDe ?? atual.capitaoDe ?? [],
  };
  await auth.setCustomUserClaims(uid, claims);
  await db.doc(`users/${uid}`).set({ papeis: claims }, { merge: true });
  return claims;
});
