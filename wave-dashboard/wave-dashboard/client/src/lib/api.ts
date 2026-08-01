/**
 * API client. Same-origin relative URLs: in dev, Vite proxies /api to the
 * Node server on :4000; in production the Node server serves this bundle.
 */

export type Transaction = {
  id: string;
  customer: string;
  customerId: string;
  amount: number;
  currency: string;
  channel: string;
  location: string;
  riskScore: number;
  type: string;
  status: 'OPEN' | 'CLOSED' | 'SAR_FILED' | 'ESCALATED';
  origin: 'seed' | 'intake';
  createdAt: string | null;
  decision: 'APPROVE' | 'ESCALATE' | 'CLOSE' | null;
  justification: string | null;
  decidedAt?: string;
  decidedBy?: string;
  riskLabel?: string;
};

export type AuditEntry = {
  id: string;
  user: string;
  action: string;
  entity: string;
  detail: string;
  ts: string;
};

export type Factor = { label: string; weight: number; detail: string; };

export type CaseFile = {
  transactionId: string;
  assembledAt: string;
  evidence: { source: string; status: string; detail: string; }[];
  summary: string;
  sarDraft: string;
  factors: Factor[];
};

export type Metrics = {
  total: number;
  open: number;
  closed: number;
  critical: number;
  high: number;
  resolved: number;
  avgRiskScore: number;
  auditEvents: number;
  byTypology: { type: string; count: number; }[];
  threshold: number;
};

export type TabMeta = {
  id: string;
  label: string;
  short: string;
  icon: string;
  accent: string;
  summary: string;
  source: string;
  live: boolean;
  order: number;
  views: number;
};

export type Favorite = {
  key: string;
  kind: string;
  itemId: string;
  label: string;
  savedAt: string;
};

/** Thrown for any non-2xx response. `fields` carries per-field messages for 422s. */
export class ApiError extends Error {
  status: number;
  fields: Record<string, string> | null;
  constructor(status: number, message: string, fields: Record<string, string> | null = null) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** Emits 'activity' on every request and 'status' when reachability changes. */
export const apiEvents = new EventTarget();

let reachable = true;
export const isReachable = () => reachable;

function setReachable(next: boolean) {
  if (next === reachable) return;
  reachable = next;
  apiEvents.dispatchEvent(new CustomEvent('status', { detail: next }));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  apiEvents.dispatchEvent(new CustomEvent('activity', { detail: path }));

  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json', ...init?.headers } : init?.headers,
    });
  } catch {
    setReachable(false);
    throw new ApiError(0, "Can't reach the API. Is the server running on port 4000?");
  }

  setReachable(true);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let fields: Record<string, string> | null = null;
    try {
      const body = await res.json();
      message = body.error || body.message || message;
      fields = body.fields ?? null;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message, fields);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const post = (path: string, body?: unknown) =>
  request<any>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const api = {
  health: () => request<{ status: string; version: string; records: Record<string, number>; }>('/api/health'),
  tabs: () => request<{ tabs: TabMeta[]; }>('/api/tabs'),
  reference: () =>
    request<{ currencies: string[]; channels: string[]; countries: Array<{ code: string; name: string; }>; highRiskCountries: Array<{ code: string; name: string; }>; threshold: number; }>(
      '/api/reference'
    ),
  metrics: () => request<Metrics>('/api/metrics'),

  transactions: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ transactions: Transaction[]; count: number; }>(
      `/api/transactions${qs ? `?${qs}` : ''}`
    );
  },
  createTransaction: (input: {
    customer: string;
    amount: number | string;
    currency: string;
    channel: string;
    location: string;
  }) =>
    post('/api/transactions', input) as Promise<{
      transaction: Transaction;
      factors: Factor[];
      alertCreated: boolean;
      riskLabel: string;
    }>,
  decide: (id: string, decision: string, justification: string) =>
    request<{ transaction: Transaction; }>(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, justification }),
    }),
  caseFile: (id: string) => request<CaseFile>(`/api/transactions/${id}/case`),

  alerts: () => request<{ alerts: Transaction[]; count: number; }>('/api/alerts'),
  audit: (limit = 100) => request<{ entries: AuditEntry[]; total: number; }>(`/api/audit?limit=${limit}`),

  favorites: () => request<{ favorites: Favorite[]; }>('/api/favorites'),
  addFavorite: (kind: string, itemId: string, label: string) =>
    post('/api/favorites', { kind, itemId, label }) as Promise<{ favorites: Favorite[]; }>,
  removeFavorite: (key: string) =>
    request<{ favorites: Favorite[]; }>(`/api/favorites/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    }),

  recordView: (tabId: string) => post(`/api/usage/${tabId}`) as Promise<{ views: number; }>,
  reset: () => post('/api/reset'),
};
