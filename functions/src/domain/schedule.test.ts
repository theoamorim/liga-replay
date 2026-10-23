import { expect, test } from "vitest";
import { generateGroupSchedule, type ScheduleConfig } from "./schedule";

const groups = { A: ["a1", "a2", "a3", "a4"], B: ["b1", "b2", "b3", "b4"], C: ["c1", "c2", "c3", "c4"] };
const cfg: ScheduleConfig = {
  datas: ["2026-11-07", "2026-11-14", "2026-11-21"],
  horarios: ["09:00", "09:40", "10:20"],
  campos: ["Campo 1", "Campo 2"],
};

test("18 jogos em 3 rodadas de 6", () => {
  const s = generateGroupSchedule(groups, cfg);
  expect(s).toHaveLength(18);
  for (const r of [1, 2, 3]) {
    const rodada = s.filter((m) => m.rodada === r);
    expect(rodada).toHaveLength(6);
    expect(new Set(rodada.map((m) => m.data))).toEqual(new Set([cfg.datas[r - 1]]));
  }
});

test("cada par do grupo se enfrenta exatamente uma vez", () => {
  const s = generateGroupSchedule(groups, cfg);
  for (const [g, ids] of Object.entries(groups)) {
    const pares = s.filter((m) => m.grupo === g).map((m) => [m.mandanteId, m.visitanteId].sort().join("-"));
    expect(new Set(pares).size).toBe(6);
    expect(pares).toHaveLength(6);
    for (const m of s.filter((x) => x.grupo === g)) expect(ids).toContain(m.mandanteId);
  }
});

test("ninguém joga duas vezes na rodada e nenhum horário/campo se repete", () => {
  const s = generateGroupSchedule(groups, cfg);
  for (const r of [1, 2, 3]) {
    const rodada = s.filter((m) => m.rodada === r);
    const times = rodada.flatMap((m) => [m.mandanteId, m.visitanteId]);
    expect(new Set(times).size).toBe(times.length);
    const slots = rodada.map((m) => `${m.horario}|${m.campo}`);
    expect(new Set(slots).size).toBe(6);
  }
});

test("erros de configuração", () => {
  expect(() => generateGroupSchedule(groups, { ...cfg, datas: cfg.datas.slice(0, 2) })).toThrow(/datas/);
  expect(() => generateGroupSchedule(groups, { ...cfg, horarios: ["09:00", "09:40"] })).toThrow(/horários/);
});
