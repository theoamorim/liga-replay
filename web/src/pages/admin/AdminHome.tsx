import { Link, Route, Routes } from "react-router";
import Temporadas from "./Temporadas";
import Temporada from "./Temporada";
import Times from "./Times";
import TimeForm from "./TimeForm";
import Jogadores from "./Jogadores";
import JogadorEditar from "./JogadorEditar";
import Jogos from "./Jogos";
import JogoForm from "./JogoForm";
import Usuarios from "./Usuarios";

const SECOES = [
  { to: "temporadas", titulo: "Temporadas", desc: "Criar temporada, grupos, tabela e configuração" },
  { to: "times", titulo: "Times", desc: "Nome, escudo e cores" },
  { to: "jogadores", titulo: "Jogadores", desc: "Cadastro, dados privados e vínculo com time" },
  { to: "jogos", titulo: "Jogos", desc: "Datas, mesários, mata-mata e reabrir súmulas" },
  { to: "usuarios", titulo: "Usuários e papéis", desc: "Admin, mesário, capitão e vínculo com jogador" },
];

function Painel() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl text-bronze">Administração</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {SECOES.map((s) => (
          <Link key={s.to} to={s.to} className="rounded-xl border border-borda bg-superficie p-4 hover:border-cobre">
            <div className="font-serif text-lg text-bronze">{s.titulo}</div>
            <div className="text-sm text-suave">{s.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function AdminHome() {
  return (
    <Routes>
      <Route index element={<Painel />} />
      <Route path="temporadas" element={<Temporadas />} />
      <Route path="temporadas/:seasonId" element={<Temporada />} />
      <Route path="times" element={<Times />} />
      <Route path="times/novo" element={<TimeForm />} />
      <Route path="times/:teamId" element={<TimeForm />} />
      <Route path="jogadores" element={<Jogadores />} />
      <Route path="jogadores/novo" element={<JogadorEditar />} />
      <Route path="jogadores/:playerId" element={<JogadorEditar />} />
      <Route path="jogos" element={<Jogos />} />
      <Route path="jogos/novo" element={<JogoForm />} />
      <Route path="jogos/:matchId" element={<JogoForm />} />
      <Route path="usuarios" element={<Usuarios />} />
    </Routes>
  );
}

export function Voltar({ to, texto }: { to: string; texto: string }) {
  return <Link to={to} className="inline-flex min-h-11 items-center text-sm text-suave">← {texto}</Link>;
}
