import { expect, test } from "vitest";
import { seededRng } from "./rng";

test("mesma semente gera a mesma sequência; sementes diferentes, sequências diferentes", () => {
  const a = seededRng("temporada-2026:A");
  const b = seededRng("temporada-2026:A");
  const c = seededRng("temporada-2026:B");
  const sa = [a(), a(), a()];
  expect([b(), b(), b()]).toEqual(sa);
  expect([c(), c(), c()]).not.toEqual(sa);
  for (const v of sa) expect(v >= 0 && v < 1).toBe(true);
});
