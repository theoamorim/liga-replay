/**
 * Popula o emulador com uma temporada de exemplo.
 * Uso: com os emuladores rodando, `npm run seed`.
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { generateGroupSchedule } from "../functions/src/domain/schedule";

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
initializeApp({ projectId: "demo-liga-replay" });
const db = getFirestore();
const auth = getAuth();

const TIMES = [
  ["Atlético Replay", "#8B1E2D", "#F2E6D8"], ["Bronze FC", "#B87333", "#0E0E10"], ["Calçadão", "#1F4E79", "#FFFFFF"],
  ["Dínamo Tijuca", "#2E7D32", "#FFFFFF"], ["Estrela do Leme", "#F2C14E", "#111111"], ["Flamenguinho", "#C62828", "#111111"],
  ["Gávea United", "#3949AB", "#FFFFFF"], ["Humaitá", "#6D4C41", "#FFFFFF"], ["Ipanema SC", "#00838F", "#FFFFFF"],
  ["Jardim Botânico", "#558B2F", "#FFFFFF"], ["Laranjeiras", "#EF6C00", "#111111"], ["Maracanã 7", "#455A64", "#FFFFFF"],
];
const NOMES = ["Lucas", "Pedro", "Gabriel", "Rafael", "Bruno", "Thiago", "Felipe", "Diego"];
const POS = ["Goleiro", "Fixo", "Ala", "Ala", "Meia", "Meia", "Pivô", "Pivô"];
const SEASON = "temporada-2026";

let semente = 42;
const rand = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);

async function ensureUser(email: string, nome: string, claims: Record<string, unknown> | null) {
  let user;
  try { user = await auth.getUserByEmail(email); } catch { user = await auth.createUser({ email, password: "senha123", displayName: nome }); }
  // espera a function onUserCreated criar o documento
  for (let i = 0; i < 50 && !(await db.doc(`users/${user.uid}`).get()).exists; i++) await new Promise((r) => setTimeout(r, 200));
  if (claims) {
    const papeis = { admin: false, mesario: false, capitaoDe: [], ...claims };
    await auth.setCustomUserClaims(user.uid, papeis);
    await db.doc(`users/${user.uid}`).set({ papeis }, { merge: true });
  }
  await db.doc(`users/${user.uid}`).set({ nome, email, termosVersao: "2026-10", termosAceitosEm: new Date() }, { merge: true });
  return user.uid;
}

async function main() {
  const adminUid = await ensureUser("admin@teste.com", "Admin Teste", { admin: true });
  const mesarioUid = await ensureUser("mesario@teste.com", "Mesário Teste", { mesario: true });

  await db.doc(`seasons/${SEASON}`).set({
    nome: "Temporada 2026", ano: 2026, status: "grupos",
    config: { pontos: { vitoria: 3, empate: 1, derrota: 0 }, formatoMataMata: "padrao-12-times", convidados: { limitePorJogo: 2, prazo: { diaSemana: 5, hora: "23:59" }, taxa: 35 } },
  });
  await db.doc("settings/site").set({ temporadaAtualId: SEASON });

  const grupos: Record<string, string[]> = { A: [], B: [], C: [] };
  const elenco: Record<string, string[]> = {};
  for (const [i, [nome, primaria, secundaria]] of TIMES.entries()) {
    const teamId = `time-${i + 1}`;
    const grupo = "ABC"[i % 3];
    grupos[grupo].push(teamId);
    await db.doc(`teams/${teamId}`).set({ nome, cores: { primaria, secundaria }, escudoUrl: null });
    await db.doc(`seasons/${SEASON}/entries/${teamId}`).set({ grupo, capitaoUid: null, contato: "" });
    elenco[teamId] = [];
    for (let j = 0; j < 8; j++) {
      const playerId = `${teamId}-j${j + 1}`;
      elenco[teamId].push(playerId);
      const apelido = `${NOMES[j]} ${nome.split(" ")[0].slice(0, 3)}`;
      await db.doc(`players/${playerId}`).set({ nome: `${NOMES[j]} da Silva ${i + 1}`, apelido, posicao: POS[j], instagram: null, fotoUrl: null, menor: false });
      await db.doc(`players/${playerId}/private/dados`).set({ telefone: "21900000000", documento: "00000000000", dataNascimento: "1995-01-01", consentimento: { versaoTermos: "2026-10", aceitoEm: new Date().toISOString() } });
      await db.doc(`seasons/${SEASON}/rosters/${playerId}`).set({ teamId, numero: j + 1, tipo: j === 7 ? "convidado" : "inscrito" });
    }
  }

  const jogos = generateGroupSchedule(grupos, { datas: ["2026-11-07", "2026-11-14", "2026-11-21"], horarios: ["09:00", "09:40", "10:20"], campos: ["Campo 1", "Campo 2"] });
  let n = 0;
  for (const j of jogos) {
    const id = `jogo-${++n}`;
    const ref = db.doc(`matches/${id}`);
    const rodada1 = j.rodada === 1;
    await ref.set({ ...j, seasonId: SEASON, placar: { mandante: 0, visitante: 0 }, status: rodada1 ? "ao-vivo" : "agendado", mesarioUid: j.rodada === 2 ? mesarioUid : adminUid, mvpPlayerId: null, penaltis: null });
    if (!rodada1) continue;
    for (const t of [j.mandanteId, j.visitanteId]) await ref.collection("lineups").doc(t).set({ playerIds: elenco[t], goleiroId: elenco[t][0] });
    const gols = [Math.floor(rand() * 4), Math.floor(rand() * 3)];
    let e = 0;
    for (const [lado, qtd] of gols.entries()) {
      const t = lado === 0 ? j.mandanteId : j.visitanteId;
      for (let g = 0; g < qtd; g++) {
        const autor = elenco[t][1 + Math.floor(rand() * 7)];
        const assist = rand() > 0.4 ? elenco[t].filter((p) => p !== autor)[1 + Math.floor(rand() * 6)] : null;
        await ref.collection("events").doc(`e${++e}`).set({ tipo: "gol", teamId: t, playerId: autor, assistPlayerId: assist, criadoEm: new Date() });
      }
    }
    if (rand() > 0.5) await ref.collection("events").doc(`e${++e}`).set({ tipo: "amarelo", teamId: j.visitanteId, playerId: elenco[j.visitanteId][2], assistPlayerId: null, criadoEm: new Date() });
    await ref.update({ status: "encerrado", mvpPlayerId: elenco[j.mandanteId][1] });
  }

  // espera as functions calcularem a classificação
  for (let i = 0; i < 100; i++) {
    const s = await db.collection(`seasons/${SEASON}/standings`).get();
    if (s.size === 12 && s.docs.reduce((acc, d) => acc + (d.get("j") ?? 0), 0) === 12) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log("Seed concluído: 12 times, 96 jogadores, 18 jogos (rodada 1 encerrada).");
  console.log("Logins de teste: admin@teste.com / mesario@teste.com (senha: senha123)");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
