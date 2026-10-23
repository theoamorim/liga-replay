import { expect, test } from "vitest";
import { computeScore } from "./matchScore";
import type { MatchEvent } from "./types";

const ev = (id: string, tipo: MatchEvent["tipo"], teamId: string, playerId = "p"): MatchEvent => ({ id, tipo, teamId, playerId });

test("gols e gol contra", () => {
  const events = [ev("1", "gol", "A"), ev("2", "gol", "B"), ev("3", "gol-contra", "A"), ev("4", "amarelo", "A")];
  expect(computeScore(events, "A", "B")).toEqual({ mandante: 1, visitante: 2 });
});

test("remover evento reduz placar", () => {
  const events = [ev("1", "gol", "A"), ev("2", "gol", "A")];
  expect(computeScore(events, "A", "B")).toEqual({ mandante: 2, visitante: 0 });
  expect(computeScore(events.slice(1), "A", "B")).toEqual({ mandante: 1, visitante: 0 });
});
