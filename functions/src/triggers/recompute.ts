import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { db, REGION } from "../admin";
import { computeScore } from "../domain/matchScore";
import type { MatchEvent } from "../domain/types";
import { recomputeSeason } from "../season";

export const onEventWritten = onDocumentWritten(
  { document: "matches/{matchId}/events/{eventId}", region: REGION },
  async (event) => {
    const matchRef = db.doc(`matches/${event.params.matchId}`);
    const [match, events] = await Promise.all([matchRef.get(), matchRef.collection("events").get()]);
    if (!match.exists) return;
    const placar = computeScore(
      events.docs.map((e) => ({ id: e.id, ...e.data() }) as MatchEvent),
      match.get("mandanteId"),
      match.get("visitanteId"),
    );
    const atual = match.get("placar") ?? {};
    if (atual.mandante !== placar.mandante || atual.visitante !== placar.visitante) {
      await matchRef.update({ placar });
    }
  },
);

export const onMatchWritten = onDocumentWritten(
  { document: "matches/{matchId}", region: REGION },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const foiOuEstaEncerrado = before?.status === "encerrado" || after?.status === "encerrado";
    const mudouAlgoRelevante =
      before?.status !== after?.status ||
      before?.mvpPlayerId !== after?.mvpPlayerId ||
      before?.placar?.mandante !== after?.placar?.mandante ||
      before?.placar?.visitante !== after?.placar?.visitante ||
      before?.mandanteId !== after?.mandanteId ||
      before?.visitanteId !== after?.visitanteId;
    const seasonId = after?.seasonId ?? before?.seasonId;
    if (seasonId && foiOuEstaEncerrado && mudouAlgoRelevante) await recomputeSeason(db, seasonId);
  },
);
