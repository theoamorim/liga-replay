import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Placeholder from "./components/Placeholder";
import RequireRole from "./auth/RequireRole";
import Entrar from "./pages/conta/Entrar";
import MinhaConta from "./pages/conta/MinhaConta";
import Privacidade from "./pages/public/Privacidade";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Placeholder titulo="Início" />} />
        <Route path="jogos" element={<Placeholder titulo="Jogos" />} />
        <Route path="jogos/:matchId" element={<Placeholder titulo="Súmula" />} />
        <Route path="classificacao" element={<Placeholder titulo="Classificação" />} />
        <Route path="mata-mata" element={<Placeholder titulo="Mata-mata" />} />
        <Route path="estatisticas" element={<Placeholder titulo="Estatísticas" />} />
        <Route path="times" element={<Placeholder titulo="Times" />} />
        <Route path="times/:teamId" element={<Placeholder titulo="Time" />} />
        <Route path="jogadores/:playerId" element={<Placeholder titulo="Jogador" />} />
        <Route path="entrar" element={<Entrar />} />
        <Route path="conta" element={<MinhaConta />} />
        <Route path="privacidade" element={<Privacidade />} />
        <Route path="admin/*" element={<RequireRole role="admin"><Placeholder titulo="Administração" /></RequireRole>} />
        <Route path="mesario/*" element={<RequireRole role="mesario"><Placeholder titulo="Mesário" /></RequireRole>} />
        <Route path="*" element={<Placeholder titulo="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}
