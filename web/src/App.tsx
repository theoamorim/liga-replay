import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Placeholder from "./components/Placeholder";
import RequireRole from "./auth/RequireRole";
import Entrar from "./pages/conta/Entrar";
import MinhaConta from "./pages/conta/MinhaConta";
import AdminHome from "./pages/admin/AdminHome";
import MeusJogos from "./pages/mesario/MeusJogos";
import SumulaAoVivo from "./pages/mesario/SumulaAoVivo";
import Privacidade from "./pages/public/Privacidade";
import Inicio from "./pages/public/Inicio";
import Jogos from "./pages/public/Jogos";
import Sumula from "./pages/public/Sumula";
import Classificacao from "./pages/public/Classificacao";
import MataMata from "./pages/public/MataMata";
import Estatisticas from "./pages/public/Estatisticas";
import Times from "./pages/public/Times";
import Time from "./pages/public/Time";
import Jogador from "./pages/public/Jogador";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="jogos" element={<Jogos />} />
        <Route path="jogos/:matchId" element={<Sumula />} />
        <Route path="classificacao" element={<Classificacao />} />
        <Route path="mata-mata" element={<MataMata />} />
        <Route path="estatisticas" element={<Estatisticas />} />
        <Route path="times" element={<Times />} />
        <Route path="times/:teamId" element={<Time />} />
        <Route path="jogadores/:playerId" element={<Jogador />} />
        <Route path="entrar" element={<Entrar />} />
        <Route path="conta" element={<MinhaConta />} />
        <Route path="privacidade" element={<Privacidade />} />
        <Route path="admin/*" element={<RequireRole role="admin"><AdminHome /></RequireRole>} />
        <Route path="mesario" element={<RequireRole role="mesario"><MeusJogos /></RequireRole>} />
        <Route path="mesario/:matchId" element={<RequireRole role="mesario"><SumulaAoVivo /></RequireRole>} />
        <Route path="*" element={<Placeholder titulo="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}
