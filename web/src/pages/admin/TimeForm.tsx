import { doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Field } from "../../components/Field";
import ImageUpload from "../../components/ImageUpload";
import TeamBadge from "../../components/TeamBadge";
import { saveTeam } from "../../data/admin";
import { useTeam } from "../../data/teams";
import { db } from "../../firebase";
import { collection } from "firebase/firestore";
import { Voltar } from "./AdminHome";

export default function TimeForm() {
  const { teamId } = useParams();
  const { data: team } = useTeam(teamId);
  const nav = useNavigate();
  // id gerado antes para o escudo ter caminho fixo mesmo em time novo
  const [id] = useState(() => teamId ?? doc(collection(db, "teams")).id);
  const [f, setF] = useState({ nome: "", primaria: "#B87333", secundaria: "#0E0E10", escudoUrl: null as string | null });

  useEffect(() => {
    if (team) setF({ nome: team.nome, primaria: team.cores?.primaria ?? "#B87333", secundaria: team.cores?.secundaria ?? "#0E0E10", escudoUrl: team.escudoUrl ?? null });
  }, [team]);

  return (
    <section className="space-y-4">
      <Voltar to="/admin/times" texto="Times" />
      <h1 className="text-3xl text-bronze">{teamId ? "Editar time" : "Novo time"}</h1>
      <Card>
        <div className="flex justify-center"><TeamBadge team={{ id, nome: f.nome || "?", escudoUrl: f.escudoUrl, cores: { primaria: f.primaria, secundaria: f.secundaria } }} size="lg" /></div>
        <Field label="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Cor principal" type="color" value={f.primaria} onChange={(e) => setF({ ...f, primaria: e.target.value })} />
          <Field label="Cor secundária" type="color" value={f.secundaria} onChange={(e) => setF({ ...f, secundaria: e.target.value })} />
        </div>
        <ImageUpload label="Escudo" path={`teams/${id}.jpg`} currentUrl={f.escudoUrl} onUploaded={(url) => setF((x) => ({ ...x, escudoUrl: url }))} />
        <Button
          disabled={!f.nome.trim()}
          onClick={async () => {
            await saveTeam(id, { nome: f.nome.trim(), escudoUrl: f.escudoUrl, cores: { primaria: f.primaria, secundaria: f.secundaria } });
            nav("/admin/times");
          }}
        >
          Salvar
        </Button>
      </Card>
    </section>
  );
}
