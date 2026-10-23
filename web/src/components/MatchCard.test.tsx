import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import MatchCard from "./MatchCard";
import type { Match, Team } from "../data/types";

const teams: Record<string, Team> = { a: { id: "a", nome: "Alfa" }, b: { id: "b", nome: "Beta" } };
const base: Match = {
  id: "m1", seasonId: "s", fase: "grupos", grupo: "A", rodada: 1, data: "2026-11-07", horario: "09:40", campo: "Campo 2",
  mandanteId: "a", visitanteId: "b", placar: { mandante: 2, visitante: 1 }, status: "encerrado",
};
const renderCard = (m: Match) => render(<MemoryRouter><MatchCard match={m} teams={teams} /></MemoryRouter>);

test("encerrado mostra o placar", () => {
  renderCard(base);
  expect(screen.getByTestId("placar")).toHaveTextContent("2 × 1");
});

test("agendado mostra horário e campo, sem placar", () => {
  renderCard({ ...base, status: "agendado" });
  expect(screen.getByText(/09:40/)).toBeInTheDocument();
  expect(screen.getByText(/Campo 2/)).toBeInTheDocument();
  expect(screen.queryByTestId("placar")).not.toBeInTheDocument();
});

test("ao vivo mostra selo e placar", () => {
  renderCard({ ...base, status: "ao-vivo" });
  expect(screen.getByText("AO VIVO")).toBeInTheDocument();
  expect(screen.getByTestId("placar")).toBeInTheDocument();
});

test("pênaltis aparecem quando houver", () => {
  renderCard({ ...base, fase: "quartas", placar: { mandante: 1, visitante: 1 }, penaltis: { mandante: 4, visitante: 3 } });
  expect(screen.getByText(/pên\. 4 × 3/)).toBeInTheDocument();
});
