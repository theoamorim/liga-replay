import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-liga-replay",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "players/p1"), { nome: "Um", apelido: "Um", menor: false });
    await setDoc(doc(db, "players/p1/private/dados"), { telefone: "21999999999", documento: "12345678901" });
    await setDoc(doc(db, "users/u1"), { nome: "Um", playerId: "p1" });
    await setDoc(doc(db, "users/u2"), { nome: "Dois" });
    await setDoc(doc(db, "teams/t1"), { nome: "Time" });
    await setDoc(doc(db, "seasons/s1"), { nome: "2026" });
    await setDoc(doc(db, "seasons/s1/standings/t1"), { pts: 3 });
    await setDoc(doc(db, "seasons/s1/playerStats/p1"), { g: 1 });
    await setDoc(doc(db, "settings/site"), { temporadaAtualId: "s1" });
    await setDoc(doc(db, "matches/m1"), { seasonId: "s1", status: "ao-vivo", mesarioUid: "mes1", placar: { mandante: 0, visitante: 0 } });
    await setDoc(doc(db, "matches/m2"), { seasonId: "s1", status: "ao-vivo", mesarioUid: "mes2", placar: { mandante: 0, visitante: 0 } });
    await setDoc(doc(db, "matches/m3"), { seasonId: "s1", status: "encerrado", mesarioUid: "mes1", placar: { mandante: 0, visitante: 0 } });
    await setDoc(doc(db, "matches/m4"), { seasonId: "s1", status: "agendado", mesarioUid: "mes1", placar: { mandante: 0, visitante: 0 } });
  });
});

const anon = () => env.unauthenticatedContext().firestore();
const user = (uid: string, claims: Record<string, unknown> = {}) => env.authenticatedContext(uid, claims).firestore();
const admin = () => user("adm", { admin: true });
const mesario = (uid = "mes1") => user(uid, { mesario: true });

describe("público", () => {
  test("lê dados públicos", async () => {
    const db = anon();
    for (const p of ["players/p1", "teams/t1", "seasons/s1", "seasons/s1/standings/t1", "seasons/s1/playerStats/p1", "matches/m1", "settings/site"]) {
      await assertSucceeds(getDoc(doc(db, p)));
    }
  });
  test("não lê dados privados nem escreve", async () => {
    await assertFails(getDoc(doc(anon(), "players/p1/private/dados")));
    await assertFails(getDoc(doc(user("u2"), "players/p1/private/dados")));
    await assertFails(setDoc(doc(anon(), "teams/t2"), { nome: "X" }));
    await assertFails(getDoc(doc(anon(), "users/u1")));
  });
});

describe("jogador", () => {
  test("lê e edita os próprios dados privados", async () => {
    const db = user("u1");
    await assertSucceeds(getDoc(doc(db, "players/p1/private/dados")));
    await assertSucceeds(updateDoc(doc(db, "players/p1/private/dados"), { telefone: "21888888888" }));
  });
  test("edita perfil público próprio, mas não o campo menor nem outro jogador", async () => {
    const db = user("u1");
    await assertSucceeds(updateDoc(doc(db, "players/p1"), { apelido: "Novo" }));
    await assertFails(updateDoc(doc(db, "players/p1"), { menor: true }));
    await assertFails(updateDoc(doc(user("u2"), "players/p1"), { apelido: "Hack" }));
  });
  test("aceita termos no próprio usuário, sem mexer em papéis ou vínculo", async () => {
    const db = user("u2");
    await assertSucceeds(setDoc(doc(db, "users/u2"), { termosAceitosEm: new Date(), termosVersao: "2026-10" }, { merge: true }));
    await assertFails(updateDoc(doc(db, "users/u2"), { papeis: { admin: true } }));
    await assertFails(updateDoc(doc(db, "users/u2"), { playerId: "p1" }));
    await assertFails(setDoc(doc(db, "users/u1"), { termosVersao: "x" }, { merge: true }));
  });
  test("pede exclusão dos próprios dados", async () => {
    await assertSucceeds(setDoc(doc(user("u1"), "deletionRequests/u1"), { pedidoEm: new Date() }));
    await assertFails(setDoc(doc(user("u1"), "deletionRequests/u2"), { pedidoEm: new Date() }));
  });
});

describe("mesário", () => {
  test("lança eventos e escalação no próprio jogo ao vivo", async () => {
    const db = mesario();
    await assertSucceeds(setDoc(doc(db, "matches/m1/events/e1"), { tipo: "gol", playerId: "p1", teamId: "t1" }));
    await assertSucceeds(deleteDoc(doc(db, "matches/m1/events/e1")));
    await assertSucceeds(setDoc(doc(db, "matches/m1/lineups/t1"), { playerIds: ["p1"] }));
  });
  test("não lança em jogo de outro mesário nem em jogo encerrado ou agendado", async () => {
    const db = mesario();
    await assertFails(setDoc(doc(db, "matches/m2/events/e1"), { tipo: "gol" }));
    await assertFails(setDoc(doc(db, "matches/m3/events/e1"), { tipo: "gol" }));
    await assertFails(setDoc(doc(db, "matches/m4/events/e1"), { tipo: "gol" }));
  });
  test("inicia, encerra e define MVP; não mexe em placar nem em times", async () => {
    const db = mesario();
    await assertSucceeds(updateDoc(doc(db, "matches/m4"), { status: "ao-vivo" }));
    await assertSucceeds(updateDoc(doc(db, "matches/m1"), { status: "encerrado", mvpPlayerId: "p1" }));
    await assertFails(updateDoc(doc(mesario(), "matches/m2"), { status: "encerrado" }));
    await assertFails(updateDoc(doc(db, "matches/m3"), { status: "ao-vivo" }));
    await assertFails(updateDoc(doc(mesario(), "matches/m4"), { placar: { mandante: 5, visitante: 0 } }));
    await assertFails(updateDoc(doc(mesario(), "matches/m4"), { mandanteId: "x" }));
  });
});

describe("admin", () => {
  test("escreve cadastro, mas não documentos calculados nem placar", async () => {
    const db = admin();
    await assertSucceeds(setDoc(doc(db, "teams/t2"), { nome: "Novo" }));
    await assertSucceeds(setDoc(doc(db, "players/p2"), { nome: "Dois" }));
    await assertSucceeds(setDoc(doc(db, "players/p1/private/dados"), { telefone: "1" }));
    await assertSucceeds(updateDoc(doc(db, "matches/m3"), { status: "ao-vivo", mesarioUid: "mes2" }));
    await assertSucceeds(setDoc(doc(db, "matches/m3/events/e9"), { tipo: "gol" }));
    await assertSucceeds(updateDoc(doc(db, "users/u2"), { playerId: "p1" }));
    await assertFails(setDoc(doc(db, "seasons/s1/standings/t1"), { pts: 99 }));
    await assertFails(setDoc(doc(db, "seasons/s1/playerStats/p1"), { g: 99 }));
    await assertFails(updateDoc(doc(db, "matches/m1"), { placar: { mandante: 9, visitante: 0 } }));
    await assertFails(updateDoc(doc(db, "users/u2"), { papeis: { admin: true } }));
  });
});
