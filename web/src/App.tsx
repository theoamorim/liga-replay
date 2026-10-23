import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Placeholder from "./components/Placeholder";

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
        <Route path="entrar" element={<Placeholder titulo="Entrar" />} />
        <Route path="conta" element={<Placeholder titulo="Minha conta" />} />
        <Route path="privacidade" element={<Placeholder titulo="Privacidade" />} />
        <Route path="admin/*" element={<Placeholder titulo="Administração" />} />
        <Route path="mesario/*" element={<Placeholder titulo="Mesário" />} />
        <Route path="*" element={<Placeholder titulo="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}
