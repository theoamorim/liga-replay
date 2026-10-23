import type { Firestore } from "firebase-admin/firestore";
import { computeScore } from "./domain/matchScore";
import { computePlayerStats } from "./domain/playerStats";
import { qualifyPadrao12 } from "./domain/qualification";
import { computeGroupStandings } from "./domain/standings";
import type { Lineup, MatchBundle, MatchEvent, MatchResult, PointsConfig, StandingRow } from "./domain/types";

const DEFAULT_PTS: PointsConfig = { vitoria: 3, empate: 1, derrota: 0 };

async function replaceCollection(db: Firestore, path: string, docs: Record<string, object>) {
  const col = db.collection(path);
  const existing = await col.listDocuments();
  const batch = db.batch();
  for (const ref of existing) if (!(ref.id in docs)) batch.delete(ref);
  for (const [id, data] of Object.entries(docs)) batch.set(col.doc(id), data);
  await batch.commit();
}

/** Recalcula do zero classificação, qualificação e estatísticas da temporada. Idempotente. */
export async function recomputeSeason(db: Firestore, seasonId: string): Promise<void> {
  const seasonRef = db.doc(`seasons/${seasonId}`);
  const [season, entries, matchesSnap] = await Promise.all([
    seasonRef.get(),
    seasonRef.collection("entries").get(),
    db.collection("matches").where("seasonId", "==", seasonId).get(),
  ]);
  const pts: PointsConfig = season.get("config.pontos") ?? DEFAULT_PTS;

  const bundles: MatchBundle[] = await Promise.all(
    matchesSnap.docs.map(async (d) => {
      const m = d.data();
      const [ev, lu] = m.status === "encerrado"
        ? await Promise.all([d.ref.collection("events").get(), d.ref.collection("lineups").get()])
        : [null, null];
      const events = (ev?.docs ?? []).map((e) => ({ id: e.id, ...e.data() }) as MatchEvent);
      const lineups = (lu?.docs ?? []).map((l) => ({ teamId: l.id, ...l.data() }) as Lineup);
      const score = computeScore(events, m.mandanteId, m.visitanteId);
      const match: MatchResult & { mvpPlayerId?: string } = {
        id: d.id, fase: m.fase, grupo: m.grupo, rodada: m.rodada,
        mandanteId: m.mandanteId, visitanteId: m.visitanteId,
        golsMandante: score.mandante, golsVisitante: score.visitante,
        status: m.status, mvpPlayerId: m.mvpPlayerId ?? undefined,
      };
      return { match, events, lineups };
    }),
  );

  // Classificação por grupo
  const groups = new Map<string, string[]>();
  for (const e of entries.docs) {
    const g = e.get("grupo") as string;
    if (!g) continue;
    groups.set(g, [...(groups.get(g) ?? []), e.id]);
  }
  const groupMatches = bundles.map((b) => b.match).filter((m) => m.fase === "grupos");
  const tables: StandingRow[][] = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([g, ids]) => computeGroupStandings(g, ids, groupMatches.filter((m) => m.grupo === g), pts));

  const standingDocs: Record<string, object> = {};
  for (const row of tables.flat()) standingDocs[row.teamId] = { ...row };

  let qualificacao: object = { rankingTerceiros: [], rankingQuartos: [], completo: false, formato: null };
  if ((season.get("config.formatoMataMata") ?? "padrao-12-times") === "padrao-12-times") {
    try {
      const q = qualifyPadrao12(tables);
      for (const [teamId, s] of Object.entries(q.situacao)) (standingDocs[teamId] as Record<string, unknown>).situacao = s;
      qualificacao = {
        formato: "padrao-12-times",
        rankingTerceiros: q.rankingTerceiros.map((r) => r.teamId),
        rankingQuartos: q.rankingQuartos.map((r) => r.teamId),
        completo: groupMatches.length > 0 && groupMatches.every((m) => m.status === "encerrado"),
      };
    } catch {
      // grupos incompletos: sem qualificação ainda
    }
  }

  // Estatísticas com nome denormalizado (evita o site ler todos os jogadores)
  const stats = computePlayerStats(bundles);
  const players = stats.length
    ? await db.getAll(...stats.map((s) => db.doc(`players/${s.playerId}`)))
    : [];
  const statDocs: Record<string, object> = {};
  stats.forEach((s, i) => {
    const p = players[i];
    statDocs[s.playerId] = {
      ...s,
      nome: p?.get("nome") ?? "",
      apelido: p?.get("apelido") ?? "",
      fotoUrl: p?.get("fotoUrl") ?? null,
    };
  });

  await Promise.all([
    replaceCollection(db, `seasons/${seasonId}/standings`, standingDocs),
    replaceCollection(db, `seasons/${seasonId}/playerStats`, statDocs),
    seasonRef.collection("computed").doc("qualificacao").set(qualificacao),
  ]);
}
