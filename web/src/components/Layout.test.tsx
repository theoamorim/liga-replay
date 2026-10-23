import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Layout from "./Layout";

test("mostra a navegação principal", () => {
  render(
    <MemoryRouter>
      <Layout />
    </MemoryRouter>,
  );
  for (const nome of ["Início", "Jogos", "Classificação", "Mata-mata", "Estatísticas", "Times"]) {
    expect(screen.getAllByRole("link", { name: nome }).length).toBeGreaterThan(0);
  }
  expect(screen.getByText("Liga Replay")).toBeInTheDocument();
});
