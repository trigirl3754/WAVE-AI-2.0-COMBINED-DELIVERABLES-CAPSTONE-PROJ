/**
 * Live store for the data the backend owns: transactions, alerts, the audit
 * trail and the derived metrics. Components read a snapshot via useLive() and
 * re-render when the store refreshes.
 */

import { useEffect, useState } from 'react';
import { api, ApiError, type AuditEntry, type Metrics, type Transaction } from './api';

export type LiveState = {
  transactions: Transaction[];
  alerts: Transaction[];
  audit: AuditEntry[];
  metrics: Metrics | null;
  loading: boolean;
  error: string | null;
  lastSync: string | null;
};

let state: LiveState = {
  transactions: [],
  alerts: [],
  audit: [],
  metrics: null,
  loading: true,
  error: null,
  lastSync: null,
};

const listeners = new Set<() => void>();

function set(patch: Partial<LiveState>) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

export function getLive() {
  return state;
}

/** Subscribe a component to store changes. */
export function useLive(): LiveState {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return state;
}

let inFlight: Promise<void> | null = null;

export function refresh(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const [txns, alerts, audit, metrics] = await Promise.all([
        api.transactions({ sort: 'risk' }),
        api.alerts(),
        api.audit(200),
        api.metrics(),
      ]);
      set({
        transactions: txns.transactions,
        alerts: alerts.alerts,
        audit: audit.entries,
        metrics,
        loading: false,
        error: null,
        lastSync: new Date().toISOString(),
      });
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof ApiError
            ? err.message
            : 'Something went wrong loading compliance data.',
      });
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Poll while the compliance tab is mounted. */
export function usePolling(intervalMs = 15_000) {
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

export async function submitTransaction(input: {
  customer: string;
  amount: string;
  currency: string;
  channel: string;
  location: string;
}) {
  const result = await api.createTransaction(input);
  await refresh();
  return result;
}

export async function decideCase(id: string, decision: string, justification: string) {
  const result = await api.decide(id, decision, justification);
  await refresh();
  return result.transaction;
}

export async function loadCase(id: string) {
  const file = await api.caseFile(id);
  refresh();
  return file;
}

/**
 * Reference data (currencies, channels, the jurisdiction watchlist, the SAR
 * threshold) lives on the server so the client never keeps its own copy.
 * Fetched once and shared between components.
 */
type Reference = {
  currencies: string[];
  channels: string[];
  countries: Array<{ code: string; name: string; }>;
  highRiskCountries: Array<{ code: string; name: string; }>;
  threshold: number;
  isHighRisk: (location: string) => boolean;
};

const FALLBACK: Omit<Reference, 'isHighRisk'> = {
  currencies: ['USD'],
  channels: ['ONLINE'],
  countries: [{ code: 'US', name: 'United States' }],
  highRiskCountries: [],
  threshold: 0.7,
};

let refCache: Omit<Reference, 'isHighRisk'> | null = null;
let refPromise: Promise<void> | null = null;
const refListeners = new Set<() => void>();

export function useReference(): Reference {
  const [, bump] = useState(0);

  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    refListeners.add(fn);
    if (!refCache && !refPromise) {
      refPromise = api
        .reference()
        .then((r) => {
          refCache = r;
          refListeners.forEach((l) => l());
        })
        .catch(() => {
          /* keep fallbacks; the form still works */
        })
        .finally(() => {
          refPromise = null;
        });
    }
    return () => {
      refListeners.delete(fn);
    };
  }, []);

  const data = refCache ?? FALLBACK;
  return {
    ...data,
    isHighRisk: (location: string) =>
      data.highRiskCountries.some((country) => country.code === location || country.name === location),
  };
}
