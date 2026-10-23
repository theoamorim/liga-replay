export type MatchStatus = "agendado" | "ao-vivo" | "encerrado";
export type Fase = "grupos" | "repescagem-semi" | "repescagem-final" | "quartas" | "semi" | "final";

export interface MatchResult {
  id: string;
  fase: Fase;
  grupo?: string;
  rodada: number;
  mandanteId: string;
  visitanteId: string;
  golsMandante: number;
  golsVisitante: number;
  status: MatchStatus;
}

export interface PointsConfig {
  vitoria: number;
  empate: number;
  derrota: number;
}

export interface StandingRow {
  teamId: string;
  grupo: string;
  posicao: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
  pts: number;
}

export type EventTipo = "gol" | "gol-contra" | "amarelo" | "vermelho";

export interface MatchEvent {
  id: string;
  tipo: EventTipo;
  playerId: string;
  teamId: string;
  assistPlayerId?: string;
  minuto?: number;
}

export interface Lineup {
  teamId: string;
  playerIds: string[];
  goleiroId?: string;
}

export interface PlayerStatRow {
  playerId: string;
  teamId: string;
  j: number;
  g: number;
  a: number;
  ga: number;
  am: number;
  vm: number;
  mvp: number;
}

export interface MatchBundle {
  match: MatchResult & { mvpPlayerId?: string };
  events: MatchEvent[];
  lineups: Lineup[];
}
