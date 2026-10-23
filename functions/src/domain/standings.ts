import type { MatchResult, PointsConfig, StandingRow } from "./types";

function emptyRow(teamId: string, grupo: string): StandingRow {
  return { teamId, grupo, posicao: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0 };
}

function tabulate(teamIds: string[], grupo: string, matches: MatchResult[], pts: PointsConfig): Map<string, StandingRow> {
  const rows = new Map(teamIds.map((id) => [id, emptyRow(id, grupo)]));
  for (const mt of matches) {
    const a = rows.get(mt.mandanteId);
    const b = rows.get(mt.visitanteId);
    if (!a || !b) continue;
    a.j++; b.j++;
    a.gp += mt.golsMandante; a.gc += mt.golsVisitante;
    b.gp += mt.golsVisitante; b.gc += mt.golsMandante;
    if (mt.golsMandante > mt.golsVisitante) { a.v++; b.d++; a.pts += pts.vitoria; b.pts += pts.derrota; }
    else if (mt.golsMandante < mt.golsVisitante) { b.v++; a.d++; b.pts += pts.vitoria; a.pts += pts.derrota; }
    else { a.e++; b.e++; a.pts += pts.empate; b.pts += pts.empate; }
  }
  for (const r of rows.values()) r.sg = r.gp - r.gc;
  return rows;
}

/** Ordem sem confronto direto: saldo → gols pró → menos gols sofridos. Usado também no ranking entre grupos. */
export function compareOverall(a: StandingRow, b: StandingRow): number {
  return b.pts - a.pts || b.sg - a.sg || b.gp - a.gp || a.gc - b.gc;
}

function compareAfterHeadToHead(a: StandingRow, b: StandingRow): number {
  return b.sg - a.sg || b.gp - a.gp || a.gc - b.gc;
}

function groupBy<T>(items: T[], key: (t: T) => string | number): T[][] {
  const out: T[][] = [];
  for (const it of items) {
    const last = out[out.length - 1];
    if (last && key(last[0]) === key(it)) last.push(it);
    else out.push([it]);
  }
  return out;
}

/** Sorteio estável: atribui uma chave aleatória por time e ordena por ela. */
export function drawOrder<T>(items: T[], rng: () => number): T[] {
  const keyed = items.map((it, i) => ({ it, k: rng(), i }));
  keyed.sort((x, y) => x.k - y.k || x.i - y.i);
  return keyed.map((x) => x.it);
}

export function computeGroupStandings(
  grupo: string,
  teamIds: string[],
  matches: MatchResult[],
  pts: PointsConfig,
  rng: () => number = Math.random,
): StandingRow[] {
  const played = matches.filter((mt) => mt.status === "encerrado");
  const rows = [...tabulate(teamIds, grupo, played, pts).values()];
  rows.sort((a, b) => b.pts - a.pts);

  const ordered: StandingRow[] = [];
  for (const tied of groupBy(rows, (r) => r.pts)) {
    if (tied.length === 1) { ordered.push(tied[0]); continue; }
    const ids = new Set(tied.map((r) => r.teamId));
    const h2h = tabulate([...ids], grupo, played.filter((mt) => ids.has(mt.mandanteId) && ids.has(mt.visitanteId)), pts);
    tied.sort((a, b) => h2h.get(b.teamId)!.pts - h2h.get(a.teamId)!.pts);
    for (const sub of groupBy(tied, (r) => h2h.get(r.teamId)!.pts)) {
      sub.sort(compareAfterHeadToHead);
      for (const still of groupBy(sub, (r) => `${r.sg}|${r.gp}|${r.gc}`)) {
        ordered.push(...(still.length > 1 ? drawOrder(still, rng) : still));
      }
    }
  }
  ordered.forEach((r, i) => (r.posicao = i + 1));
  return ordered;
}
