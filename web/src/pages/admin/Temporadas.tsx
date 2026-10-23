import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Field } from "../../components/Field";
import { createSeason } from "../../data/admin";
import { useCurrentSeason, useSeasons } from "../../data/seasons";
import { Voltar } from "./AdminHome";

export default function Temporadas() {
  const { data: seasons } = useSeasons();
  const atual = useCurrentSeason().data;
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  return (
    <section className="space-y-4">
      <Voltar to="/admin" texto="Administração" />
      <h1 className="text-3xl text-bronze">Temporadas</h1>
      <Card>
        <h2 className="text-lg">Nova temporada</h2>
        <Field label="Nome" placeholder="Ex.: Temporada 2027.1" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="Ano" type="number" value={ano} onChange={(e) => setAno(e.target.value)} />
        <Button disabled={!nome.trim()} onClick={async () => nav(`/admin/temporadas/${await createSeason(nome.trim(), Number(ano))}`)}>Criar</Button>
      </Card>
      <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {seasons.map((s) => (
          <li key={s.id}>
            <Link to={s.id} className="flex min-h-12 items-center justify-between px-4">
              <span>{s.nome}</span>
              <span className="text-xs text-suave">{s.id === atual?.id ? "atual · " : ""}{s.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
