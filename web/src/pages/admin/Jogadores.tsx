import { useState } from "react";
import { Link } from "react-router";
import { inputCls } from "../../components/Field";
import { usePlayers } from "../../data/players";
import { Voltar } from "./AdminHome";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Jogadores() {
  const { data } = usePlayers();
  const [busca, setBusca] = useState("");
  const lista = data
    .filter((p) => norm(`${p.nome} ${p.apelido}`).includes(norm(busca)))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  return (
    <section className="space-y-4">
      <Voltar to="/admin" texto="Administração" />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-bronze">Jogadores</h1>
        <Link to="novo" className="rounded-lg bg-cobre px-4 py-2 font-semibold text-fundo">Novo jogador</Link>
      </div>
      <input aria-label="Buscar jogador" placeholder="Buscar por nome ou apelido" className={inputCls} value={busca} onChange={(e) => setBusca(e.target.value)} />
      <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {lista.map((p) => (
          <li key={p.id}>
            <Link to={p.id} className="flex min-h-12 items-center justify-between px-4">
              <span>{p.nome} <span className="text-suave">({p.apelido})</span></span>
              <span className="text-xs text-suave">{p.posicao}{p.menor ? " · menor" : ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
