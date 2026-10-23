import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import type { PlayerStat } from "../../data/types";
import Estatisticas from "./Estatisticas";

const s = (playerId: string, apelido: string, g: number, a: number, am = 0): PlayerStat => ({
  playerId, teamId: "t", nome: apelido, apelido, j: 1, g, a, ga: g + a, am, vm: 0, mvp: 0,
});
vi.mock("../../data/seasons", () => ({ useCurrentSeason: () => ({ data: { id: "s1", nome: "2026" }, loading: false }) }));
vi.mock("../../data/teams", () => ({ useTeams: () => ({ data: [], loading: false }) }));
vi.mock("../../data/stats", () => ({
  usePlayerStats: () => ({ data: [s("1", "Zé", 1, 5), s("2", "Rafa", 4, 0, 2), s("3", "Leo", 0, 0)], loading: false }),
}));

const nomes = () => within(screen.getByRole("list")).getAllByRole("listitem").map((li) => li.getAttribute("data-player"));

test("artilharia ordenada e sem zeros", () => {
  render(<MemoryRouter><Estatisticas /></MemoryRouter>);
  expect(nomes()).toEqual(["2", "1"]);
});

test("alternar abas", async () => {
  render(<MemoryRouter><Estatisticas /></MemoryRouter>);
  for (const aba of ["Artilharia", "Assistências", "G+A", "Amarelos", "Vermelhos", "MVPs"]) {
    expect(screen.getByRole("tab", { name: aba })).toBeInTheDocument();
  }
  await userEvent.click(screen.getByRole("tab", { name: "Assistências" }));
  expect(nomes()).toEqual(["1"]);
  await userEvent.click(screen.getByRole("tab", { name: "G+A" }));
  expect(nomes()).toEqual(["1", "2"]);
  await userEvent.click(screen.getByRole("tab", { name: "Amarelos" }));
  expect(nomes()).toEqual(["2"]);
  await userEvent.click(screen.getByRole("tab", { name: "Vermelhos" }));
  expect(screen.getByText(/nenhum registro/i)).toBeInTheDocument();
});
