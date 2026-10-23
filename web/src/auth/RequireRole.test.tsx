import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthContext, type AuthState } from "./AuthContext";
import RequireRole from "./RequireRole";

const base: AuthState = {
  user: null, loading: false, profile: null,
  claims: { admin: false, mesario: false, capitaoDe: [] },
  signIn: async () => {}, signOut: async () => {},
};

function renderWith(state: AuthState) {
  return render(
    <AuthContext.Provider value={state}>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/entrar" element={<p>tela de login</p>} />
          <Route path="/admin" element={<RequireRole role="admin"><p>área admin</p></RequireRole>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

test("sem usuário redireciona para /entrar", () => {
  renderWith(base);
  expect(screen.getByText("tela de login")).toBeInTheDocument();
});

test("usuário sem a claim vê aviso de acesso negado", () => {
  renderWith({ ...base, user: { uid: "u1" } as AuthState["user"] });
  expect(screen.getByText(/sem permissão/i)).toBeInTheDocument();
});

test("com a claim correta mostra o conteúdo", () => {
  renderWith({ ...base, user: { uid: "u1" } as AuthState["user"], claims: { ...base.claims, admin: true } });
  expect(screen.getByText("área admin")).toBeInTheDocument();
});
