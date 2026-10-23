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
