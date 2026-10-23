export interface ScheduleConfig {
  datas: string[];
  horarios: string[];
  campos: string[];
}

export interface ScheduledMatch {
  fase: "grupos";
  grupo: string;
  rodada: number;
  mandanteId: string;
  visitanteId: string;
  data: string;
  horario: string;
  campo: string;
}

export const DEFAULT_HORARIOS = ["09:00", "09:40", "10:20"];
export const DEFAULT_CAMPOS = ["Campo 1", "Campo 2"];

/** Método do círculo: devolve, por rodada, os pares [mandante, visitante]. */
function roundRobin(ids: string[]): [string, string][][] {
  const teams = ids.length % 2 === 0 ? [...ids] : [...ids, ""];
  const n = teams.length;
  const rounds: [string, string][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = teams[i];
      const b = teams[n - 1 - i];
      if (a && b) pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(pairs);
    teams.splice(1, 0, teams.pop()!);
  }
  return rounds;
}

export function generateGroupSchedule(groups: Record<string, string[]>, cfg: ScheduleConfig): ScheduledMatch[] {
  const perGroup = Object.entries(groups).map(([g, ids]) => [g, roundRobin(ids)] as const);
  const numRodadas = Math.max(...perGroup.map(([, r]) => r.length));
  if (cfg.datas.length < numRodadas) throw new Error(`São necessárias ${numRodadas} datas, uma por rodada.`);

  const out: ScheduledMatch[] = [];
  for (let r = 0; r < numRodadas; r++) {
    const jogos = perGroup.flatMap(([g, rounds]) => (rounds[r] ?? []).map(([a, b]) => ({ g, a, b })));
    if (cfg.horarios.length * cfg.campos.length < jogos.length) {
      throw new Error(`A rodada tem ${jogos.length} jogos, mas só há ${cfg.horarios.length * cfg.campos.length} combinações de horários e campos.`);
    }
    jogos.forEach(({ g, a, b }, i) => {
      out.push({
        fase: "grupos", grupo: g, rodada: r + 1, mandanteId: a, visitanteId: b, data: cfg.datas[r],
        horario: cfg.horarios[Math.floor(i / cfg.campos.length)], campo: cfg.campos[i % cfg.campos.length],
      });
    });
  }
  return out;
}
