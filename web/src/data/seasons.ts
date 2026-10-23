import { collection, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useDocData, useQueryData } from "./hooks";
import type { Entry, Qualificacao, Season } from "./types";

export function useCurrentSeason() {
  const settings = useDocData<{ temporadaAtualId?: string }>("settings/site");
  const id = settings.data?.temporadaAtualId ?? null;
  const season = useDocData<Season>(id ? `seasons/${id}` : null);
  return { data: season.data, loading: settings.loading || season.loading };
}

export const useSeasons = () =>
  useQueryData<Season>("seasons", () => query(collection(db, "seasons"), orderBy("ano", "desc")));

export const useEntries = (seasonId: string | undefined) =>
  useQueryData<Entry>(seasonId ? `entries:${seasonId}` : null, () => collection(db, "seasons", seasonId!, "entries"));

export const useQualificacao = (seasonId: string | undefined) =>
  useDocData<Qualificacao>(seasonId ? `seasons/${seasonId}/computed/qualificacao` : null);
