import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { getBytes, ref, uploadBytes } from "firebase/storage";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, test } from "vitest";

let env: RulesTestEnvironment;
const img = new Uint8Array([1, 2, 3]);

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-liga-replay",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
    storage: { rules: readFileSync("storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "users/u1"), { playerId: "p1" });
    await uploadBytes(ref(ctx.storage(), "teams/t1.jpg"), img, { contentType: "image/jpeg" });
  });
});
afterAll(() => env.cleanup());

const st = (uid?: string, claims: Record<string, unknown> = {}) =>
  (uid ? env.authenticatedContext(uid, claims) : env.unauthenticatedContext()).storage();

test("leitura pública de escudos", async () => {
  await assertSucceeds(getBytes(ref(st(), "teams/t1.jpg")));
});

test("admin envia escudo; público não", async () => {
  await assertSucceeds(uploadBytes(ref(st("adm", { admin: true }), "teams/t2.jpg"), img, { contentType: "image/jpeg" }));
  await assertFails(uploadBytes(ref(st(), "teams/t3.jpg"), img, { contentType: "image/jpeg" }));
  await assertFails(uploadBytes(ref(st("u2"), "teams/t3.jpg"), img, { contentType: "image/jpeg" }));
});

test("jogador envia a própria foto; não a de outro", async () => {
  await assertSucceeds(uploadBytes(ref(st("u1"), "players/p1/foto.jpg"), img, { contentType: "image/jpeg" }));
  await assertFails(uploadBytes(ref(st("u1"), "players/p2/foto.jpg"), img, { contentType: "image/jpeg" }));
});

test("só imagens até 2 MB", async () => {
  const adm = st("adm", { admin: true });
  await assertFails(uploadBytes(ref(adm, "teams/x.pdf"), img, { contentType: "application/pdf" }));
  await assertFails(uploadBytes(ref(adm, "teams/grande.jpg"), new Uint8Array(2 * 1024 * 1024 + 1), { contentType: "image/jpeg" }));
});
