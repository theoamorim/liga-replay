import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db, REGION } from "../admin";
import { DEFAULT_CAMPOS, DEFAULT_HORARIOS, generateGroupSchedule } from "../domain/schedule";
import { requireAdmin } from "./guards";

interface Input { seasonId: string; datas: string[]; horarios?: string[]; campos?: string[] }

export const generateSchedule = onCall<Input>({ region: REGION }, async (req) => {
  requireAdmin(req);
  const { seasonId, datas, horarios = DEFAULT_HORARIOS, campos = DEFAULT_CAMPOS } = req.data ?? ({} as Input);
  if (!seasonId || !Array.isArray(datas)) throw new HttpsError("invalid-argument", "Informe a temporada e as datas.");

  const existentes = await db.collection("matches").where("seasonId", "==", seasonId).where("fase", "==", "grupos").limit(1).get();
  if (!existentes.empty) throw new HttpsError("failed-precondition", "Esta temporada já tem jogos de grupo.");

  const entries = await db.collection(`seasons/${seasonId}/entries`).get();
  const groups: Record<string, string[]> = {};
  for (const e of entries.docs) {
    const g = e.get("grupo");
    if (g) (groups[g] ??= []).push(e.id);
  }
  if (!Object.keys(groups).length) throw new HttpsError("failed-precondition", "Inscreva os times nos grupos primeiro.");

  let jogos;
  try {
    jogos = generateGroupSchedule(groups, { datas, horarios, campos });
  } catch (e) {
    throw new HttpsError("invalid-argument", (e as Error).message);
  }
  const batch = db.batch();
  for (const j of jogos) {
    batch.set(db.collection("matches").doc(), {
      ...j, seasonId, placar: { mandante: 0, visitante: 0 }, status: "agendado",
      mesarioUid: null, mvpPlayerId: null, criadoEm: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  return { criados: jogos.length };
});
