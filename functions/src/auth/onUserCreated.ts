import * as functionsV1 from "firebase-functions/v1";
import { defineString } from "firebase-functions/params";
import { FieldValue } from "firebase-admin/firestore";
import { auth, db, REGION } from "../admin";

const ADMIN_EMAILS = defineString("ADMIN_EMAILS", { default: "" });

export const onUserCreated = functionsV1.region(REGION).auth.user().onCreate(async (user) => {
  const admins = ADMIN_EMAILS.value().split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = !!user.email && admins.includes(user.email.toLowerCase());
  const papeis = { admin: isAdmin, mesario: false, capitaoDe: [] as string[] };
  if (isAdmin) await auth.setCustomUserClaims(user.uid, papeis);
  await db.doc(`users/${user.uid}`).set(
    {
      nome: user.displayName ?? "",
      email: user.email ?? "",
      fotoUrl: user.photoURL ?? null,
      papeis,
      criadoEm: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
});
