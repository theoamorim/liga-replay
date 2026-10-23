import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import { AuthContext, type AuthState } from "../../auth/AuthContext";
import TermsGate from "./TermsGate";

const acceptTerms = vi.fn(async () => {});
vi.mock("../../data/users", () => ({ acceptTerms: (...a: unknown[]) => acceptTerms(...(a as [])), TERMOS_VERSAO: "2026-10" }));

const state = (profile: AuthState["profile"]): AuthState => ({
  user: { uid: "u1" } as AuthState["user"], loading: false, profile,
  claims: { admin: false, mesario: false, capitaoDe: [] },
  signIn: async () => {}, signOut: async () => {},
});

const renderGate = (s: AuthState) =>
  render(
    <AuthContext.Provider value={s}>
      <MemoryRouter><TermsGate><p>conteúdo</p></TermsGate></MemoryRouter>
    </AuthContext.Provider>,
  );

test("usuário sem aceite vê os termos e aceitar grava a versão 2026-10", async () => {
  renderGate(state({ termosVersao: null }));
  expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();
  const botao = screen.getByRole("button", { name: /aceito/i });
  expect(botao).toBeDisabled();
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(botao);
  expect(acceptTerms).toHaveBeenCalledWith("u1");
});

test("usuário com aceite na versão atual vê o conteúdo", () => {
  renderGate(state({ termosVersao: "2026-10" }));
  expect(screen.getByText("conteúdo")).toBeInTheDocument();
});
