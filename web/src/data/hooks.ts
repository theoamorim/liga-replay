import { doc, onSnapshot, type DocumentData, type Query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

export interface Loadable<T> { data: T; loading: boolean; error?: Error }

export function useDocData<T>(path: string | null, initial: T | null = null): Loadable<T | null> {
  const [state, setState] = useState<Loadable<T | null>>({ data: initial, loading: !!path });
  useEffect(() => {
    if (!path) { setState({ data: null, loading: false }); return; }
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      doc(db, path),
      (snap) => setState({ data: snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null, loading: false }),
      (error) => setState({ data: null, loading: false, error }),
    );
  }, [path]);
  return state;
}

/** `key` identifica a consulta; muda quando os parâmetros mudam. */
export function useQueryData<T>(key: string | null, build: () => Query<DocumentData>, idField = "id"): Loadable<T[]> {
  const [state, setState] = useState<Loadable<T[]>>({ data: [], loading: !!key });
  useEffect(() => {
    if (!key) { setState({ data: [], loading: false }); return; }
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      build(),
      (snap) => setState({ data: snap.docs.map((d) => ({ [idField]: d.id, ...d.data() }) as T), loading: false }),
      (error) => setState({ data: [], loading: false, error }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}
