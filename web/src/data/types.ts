export type Situacao = "quartas" | "repescagem" | "eliminado";
export type Fase = "grupos" | "repescagem-semi" | "repescagem-final" | "quartas" | "semi" | "final";
export type MatchStatus = "agendado" | "ao-vivo" | "encerrado";

export interface Team { id: string; nome: string; slug?: string; escudoUrl?: string | null; cores?: { primaria: string; secundaria: string } }

export interface SeasonConfig {
  pontos: { vitoria: number; empate: number; derrota: number };
  formatoMataMata: string;
  convidados: { limitePorJogo: number; prazo: { diaSemana: number; hora: string }; taxa: number };
}
export interface Season { id: string; nome: string; ano: number; status: "rascunho" | "grupos" | "mata-mata" | "encerrada"; config: SeasonConfig }
export interface Entry { id: string; grupo: string; capitaoUid?: string | null; contato?: string }

export interface Match {
  id: string; seasonId: string; fase: Fase; grupo?: string; rodada: number;
  data: string; horario: string; campo: string;
  mandanteId: string; visitanteId: string;
  placar: { mandante: number; visitante: number };
  penaltis?: { mandante: number; visitante: number } | null;
  status: MatchStatus; mesarioUid?: string | null; mvpPlayerId?: string | null;
}

export type EventTipo = "gol" | "gol-contra" | "amarelo" | "vermelho";
export interface MatchEvent { id: string; tipo: EventTipo; playerId: string; teamId: string; assistPlayerId?: string | null; minuto?: number | null; criadoEm?: unknown }
export interface Lineup { teamId: string; playerIds: string[]; goleiroId?: string | null }

export interface Standing {
  teamId: string; grupo: string; posicao: number;
  j: number; v: number; e: number; d: number; gp: number; gc: number; sg: number; pts: number;
  situacao?: Situacao;
}
export interface Qualificacao { rankingTerceiros: string[]; rankingQuartos: string[]; completo: boolean }

export interface PlayerStat {
  playerId: string; teamId: string; nome: string; apelido: string; fotoUrl?: string | null;
  j: number; g: number; a: number; ga: number; am: number; vm: number; mvp: number;
}

export interface Player { id: string; nome: string; apelido: string; fotoUrl?: string | null; posicao: string; instagram?: string | null; menor?: boolean }
export interface RosterEntry { playerId: string; teamId: string; numero: number | null; tipo: "inscrito" | "convidado" }

export const FASE_LABEL: Record<Fase, string> = {
  grupos: "Fase de grupos",
  "repescagem-semi": "Repescagem — semifinal",
  "repescagem-final": "Repescagem — final",
  quartas: "Quartas de final",
  semi: "Semifinal",
  final: "Final",
};
