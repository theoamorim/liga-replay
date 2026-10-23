import { useId, useState } from "react";
import { uploadImage } from "../data/storageUpload";
import { resizeImage } from "../lib/image";

export default function ImageUpload({ path, onUploaded, label, currentUrl }: { path: string; onUploaded(url: string): void; label: string; currentUrl?: string | null }) {
  const id = useId();
  const [estado, setEstado] = useState<"ocioso" | "enviando" | "erro">("ocioso");
  return (
    <div className="flex items-center gap-3">
      {currentUrl && <img src={currentUrl} alt="" className="size-14 rounded-full border border-borda object-cover" />}
      <label htmlFor={id} className="text-sm">
        {label}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-xs text-suave file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-borda file:px-3 file:text-texto"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setEstado("enviando");
            try {
              const blob = await resizeImage(file, 512);
              onUploaded(await uploadImage(path, blob));
              setEstado("ocioso");
            } catch {
              setEstado("erro");
            }
          }}
        />
      </label>
      {estado === "enviando" && <span className="text-xs text-suave">Enviando…</span>}
      {estado === "erro" && <span className="text-xs text-red-400">Falha no envio</span>}
    </div>
  );
}
