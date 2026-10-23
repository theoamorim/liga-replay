import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { beforeAll, expect, test } from "vitest";

const PROJECT = "demo-liga-replay";
if (!getApps().length) initializeApp({ projectId: PROJECT });
const db = getFirestore();
const auth = getAuth();
const FN = `http://127.0.0.1:5001/${PROJECT}/southamerica-east1`;
const AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1";

async function waitFor<T>(fn: () => Promise<T>, ok: (v: T) => boolean, ms = 20000): Promise<T> {
  const fim = Date.now() + ms;
  let v = await fn();
  while (!ok(v)) {
    if (Date.now() > fim) throw new Error(`timeout: ${JSON.stringify(v)}`);
    await new Promise((r) => setTimeout(r, 300));
    v = await fn();
  }
  return v;
}

async function idToken(email: string): Promise<string> {
  const body = JSON.stringify({ email, password: "senha123", returnSecureToken: true });
  let r = await fetch(`${AUTH}/accounts:signInWithPassword?key=fake`, { method: "POST", body, headers: { "content-type": "application/json" } });
  if (!r.ok) r = await fetch(`${AUTH}/accounts:signUp?key=fake`, { method: "POST", body, headers: { "content-type": "application/json" } });
  return (await r.json()).idToken;
}

async function call(name: string, data: unknown, token?: string) {
  const r = await fetch(`${FN}/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ data }),
  });
  return { status: r.status, body: await r.json() };
}

const S = "t-int";
const standing = (id: string) => db.doc(`seasons/${S}/standings/${id}`).get().then((d) => d.data());
const stat = (id: string) => db.doc(`seasons/${S}/playerStats/${id}`).get().then((d) => d.data());

beforeAll(async () => {
  await db.doc(`seasons/${S}`).set({ nome: "Teste", config: { pontos: { vitoria: 3, empate: 1, derrota: 0 }, formatoMataMata: "padrao-12-times" } });
  for (const t of ["A", "B", "C", "D"]) await db.doc(`seasons/${S}/entries/${t}`).set({ grupo: "A" });
  await db.doc("players/p1").set({ nome: "Jogador Um", apelido: "Um" });
  await db.doc("matches/j1").set({
    seasonId: S, fase: "grupos", grupo: "A", rodada: 1, mandanteId: "A", visitanteId: "B",
    placar: { mandante: 0, visitante: 0 }, status: "ao-vivo",
  });
  await db.doc("matches/j1/lineups/A").set({ playerIds: ["p1"] });
  await db.doc("matches/j1/lineups/B").set({ playerIds: ["p2"] });
}, 30000);

test("gols atualizam placar; encerrar gera classificação e estatísticas", async () => {
  await db.doc("matches/j1/events/e1").set({ tipo: "gol", playerId: "p1", teamId: "A" });
  await db.doc("matches/j1/events/e2").set({ tipo: "gol", playerId: "p1", teamId: "A" });
  await waitFor(() => db.doc("matches/j1").get().then((d) => d.get("placar")), (p) => p?.mandante === 2);
  await db.doc("matches/j1").update({ status: "encerrado", mvpPlayerId: "p1" });
  const a = await waitFor(() => standing("A"), (r) => r?.pts === 3);
  expect(a).toMatchObject({ j: 1, v: 1, gp: 2, gc: 0 });
  const p1 = await waitFor(() => stat("p1"), (r) => r?.g === 2);
  expect(p1).toMatchObject({ nome: "Jogador Um", mvp: 1, j: 1 });
}, 40000);

test("apagar gol e reencerrar reduz placar e estatísticas", async () => {
  await db.doc("matches/j1").update({ status: "ao-vivo" });
  await db.doc("matches/j1/events/e2").delete();
  await waitFor(() => db.doc("matches/j1").get().then((d) => d.get("placar")), (p) => p?.mandante === 1);
  await db.doc("matches/j1").update({ status: "encerrado" });
  await waitFor(() => stat("p1"), (r) => r?.g === 1);
  expect(await standing("A")).toMatchObject({ gp: 1, pts: 3 });
}, 40000);

test("recalcular duas vezes dá o mesmo resultado", async () => {
  const antes = await stat("p1");
  await db.doc("matches/j1").update({ mvpPlayerId: null });
  await waitFor(() => stat("p1"), (r) => r?.mvp === 0);
  await db.doc("matches/j1").update({ mvpPlayerId: "p1" });
  const depois = await waitFor(() => stat("p1"), (r) => r?.mvp === 1);
  expect(depois).toEqual(antes);
}, 40000);

test("setUserRole: não-admin recebe permission-denied; admin consegue", async () => {
  const comum = await idToken("comum@teste.com");
  const r1 = await call("setUserRole", { uid: "x", mesario: true }, comum);
  expect(r1.body.error?.status).toBe("PERMISSION_DENIED");

  await idToken("admin@teste.com");
  const adminUser = await auth.getUserByEmail("admin@teste.com");
  await waitFor(() => auth.getUser(adminUser.uid).then((u) => u.customClaims?.admin), (v) => v === true);
  const tokenAdmin = await idToken("admin@teste.com");
  const alvo = await auth.getUserByEmail("comum@teste.com");
  const r2 = await call("setUserRole", { uid: alvo.uid, mesario: true }, tokenAdmin);
  expect(r2.body.result).toMatchObject({ mesario: true, admin: false });
}, 40000);

test("generateSchedule cria 18 jogos e recusa repetir", async () => {
  const T = "t-tabela";
  const grupos = { A: ["a1", "a2", "a3", "a4"], B: ["b1", "b2", "b3", "b4"], C: ["c1", "c2", "c3", "c4"] };
  for (const [g, ids] of Object.entries(grupos)) for (const id of ids) await db.doc(`seasons/${T}/entries/${id}`).set({ grupo: g });
  const token = await idToken("admin@teste.com");
  const r = await call("generateSchedule", { seasonId: T, datas: ["2026-11-07", "2026-11-14", "2026-11-21"] }, token);
  expect(r.body.result).toEqual({ criados: 18 });
  const r2 = await call("generateSchedule", { seasonId: T, datas: ["2026-11-07", "2026-11-14", "2026-11-21"] }, token);
  expect(r2.body.error?.status).toBe("FAILED_PRECONDITION");
}, 40000);
