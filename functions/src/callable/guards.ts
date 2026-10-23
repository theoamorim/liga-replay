import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export function requireAdmin(req: CallableRequest): void {
  if (!req.auth) throw new HttpsError("unauthenticated", "Faça login.");
  if (req.auth.token.admin !== true) throw new HttpsError("permission-denied", "Apenas administradores.");
}
