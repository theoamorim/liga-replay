import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import StandingsTable from "./StandingsTable";
import type { Standing, Team } from "../data/types";

const row = (teamId: string, posicao: number, pts: number, situacao?: Standing["situacao"]): Standing => ({
  teamId, grupo: "A", posicao, j: 3, v: 0, e: 0, d: 0, gp: 5, gc: 2, sg: 3, pts, situacao,
});
const teams: Record<string, Team> = { a: { id: "a", nome: "Alfa" }, b: { id: "b", nome: "Beta" }, c: { id: "c", nome: "Gama" } };

test("mostra colunas e destaca a situação", () => {
  render(<MemoryRouter><StandingsTable rows={[row("a", 1, 9, "quartas"), row("b", 2, 4, "repescagem"), row("c", 3, 0, "eliminado")]} teams={teams} /></MemoryRouter>);
  for (const h of ["#", "Time", "J", "V", "E", "D", "GP", "GC", "SG", "Pts"]) {
    expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument();
  }
  const linhas = screen.getAllByRole("row").slice(1);
  expect(within(linhas[0]).getByText("Alfa")).toBeInTheDocument();
  expect(linhas[0]).toHaveAttribute("data-situacao", "quartas");
  expect(linhas[1]).toHaveAttribute("data-situacao", "repescagem");
  expect(linhas[2]).toHaveAttribute("data-situacao", "eliminado");
});
