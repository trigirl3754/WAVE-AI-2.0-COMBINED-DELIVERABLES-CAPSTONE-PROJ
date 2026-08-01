/**
 * Saved items, persisted server-side so they survive a reload.
 * Used by the prompt library ("prompt") and the glossary ("term").
 */

import { useCallback, useEffect, useState } from 'react';
import { api, apiEvents, type Favorite } from './api';

let cache: Favorite[] | null = null;
const listeners = new Set<(f: Favorite[]) => void>();

function publish(next: Favorite[]) {
  cache = next;
  listeners.forEach((fn) => fn(next));
}

export function useFavorites(kind: string) {
  const [all, setAll] = useState<Favorite[]>(cache ?? []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listeners.add(setAll);
    if (cache === null) {
      api
        .favorites()
        .then((r) => publish(r.favorites))
        .catch(() => setError("Saved items aren't available — the API is unreachable."));
    }
    return () => {
      listeners.delete(setAll);
    };
  }, []);

  const saved = all.filter((f) => f.kind === kind);
  const isSaved = useCallback(
    (itemId: string) => saved.some((f) => f.itemId === itemId),
    [saved]
  );

  const toggle = useCallback(
    async (itemId: string, label: string) => {
      const key = `${kind}:${itemId}`;
      const existing = (cache ?? []).some((f) => f.key === key);
      // Optimistic — reconciled by the response.
      publish(
        existing
          ? (cache ?? []).filter((f) => f.key !== key)
          : [...(cache ?? []), { key, kind, itemId, label, savedAt: new Date().toISOString() }]
      );
      try {
        const r = existing ? await api.removeFavorite(key) : await api.addFavorite(kind, itemId, label);
        publish(r.favorites);
        setError(null);
      } catch {
        setError("Couldn't save that — the API is unreachable. Your change wasn't kept.");
        api.favorites().then((r) => publish(r.favorites)).catch(() => {});
      }
    },
    [kind]
  );

  useEffect(() => {
    const onStatus = (e: Event) => {
      if ((e as CustomEvent<boolean>).detail) {
        api.favorites().then((r) => publish(r.favorites)).catch(() => {});
      }
    };
    apiEvents.addEventListener('status', onStatus);
    return () => apiEvents.removeEventListener('status', onStatus);
  }, []);

  return { saved, savedIds: saved.map((f) => f.itemId), isSaved, toggle, error };
}
