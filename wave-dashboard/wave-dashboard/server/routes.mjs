/**
 * All /api routes.
 */

import { Router, json, text, readJsonBody, HttpError } from './lib/router.mjs';
import * as store from './lib/store.mjs';
import { TABS, CURRENCIES, CHANNELS, COUNTRIES, HIGH_RISK_COUNTRIES } from './seed.mjs';
import { scoreTransaction, riskLabel, SAR_THRESHOLD } from './lib/scoring.mjs';
import { buildCase } from './lib/caseFile.mjs';

const STARTED = Date.now();
const VERSION = '1.0.0';

const DECISIONS = {
  APPROVE: { action: 'SAR_APPROVED', status: 'SAR_FILED' },
  ESCALATE: { action: 'ESCALATED', status: 'ESCALATED' },
  CLOSE: { action: 'CASE_CLOSED', status: 'CLOSED' },
};

function audit(user, action, entity, detail) {
  return store.write((s) => {
    const entry = {
      id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user,
      action,
      entity,
      detail,
      ts: new Date().toISOString(),
    };
    s.audit.unshift(entry);
    if (s.audit.length > 500) s.audit.length = 500;
    return entry;
  });
}

function findTransaction(id) {
  const t = store.read().transactions.find((x) => x.id === id);
  if (!t) throw new HttpError(404, `No transaction with id ${id}`);
  return t;
}

function computeMetrics() {
  const { transactions, audit: log } = store.read();
  const open = transactions.filter((t) => t.status === 'OPEN');
  const critical = open.filter((t) => t.riskScore >= 0.85);
  const high = open.filter((t) => t.riskScore >= SAR_THRESHOLD && t.riskScore < 0.85);
  const resolved = transactions.filter((t) => t.decision);
  const avg = transactions.length
    ? transactions.reduce((s, t) => s + t.riskScore, 0) / transactions.length
    : 0;

  const byTypology = {};
  for (const t of transactions) byTypology[t.type] = (byTypology[t.type] || 0) + 1;

  return {
    total: transactions.length,
    open: open.length,
    closed: transactions.length - open.length,
    critical: critical.length,
    high: high.length,
    resolved: resolved.length,
    avgRiskScore: Number(avg.toFixed(3)),
    auditEvents: log.length,
    byTypology: Object.entries(byTypology)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    threshold: SAR_THRESHOLD,
  };
}

export function buildRouter() {
  const r = new Router();

  // ── Meta ──────────────────────────────────────────────────────────────────
  r.get('/api/health', (_req, res) => {
    const s = store.read();
    json(res, 200, {
      status: 'ok',
      version: VERSION,
      uptimeSeconds: Math.round((Date.now() - STARTED) / 1000),
      dataFile: store.dataFile,
      records: {
        transactions: s.transactions.length,
        audit: s.audit.length,
        favorites: s.favorites.length,
      },
      serverTime: new Date().toISOString(),
    });
  });

  r.get('/api/tabs', (_req, res) => {
    const usage = store.read().usage;
    json(res, 200, {
      tabs: TABS.map((t, i) => ({ ...t, order: i, views: usage[t.id] || 0 })),
    });
  });

  r.get('/api/reference', (_req, res) => {
    json(res, 200, {
      currencies: CURRENCIES,
      channels: CHANNELS,
      countries: COUNTRIES,
      highRiskCountries: HIGH_RISK_COUNTRIES,
      threshold: SAR_THRESHOLD,
    });
  });

  r.get('/api/metrics', (_req, res) => json(res, 200, computeMetrics()));

  // ── Transactions ──────────────────────────────────────────────────────────
  r.get('/api/transactions', (req, res, { query }) => {
    let list = [...store.read().transactions];
    if (query.status) list = list.filter((t) => t.status === query.status.toUpperCase());
    if (query.minRisk) list = list.filter((t) => t.riskScore >= Number(query.minRisk));
    if (query.q) {
      const q = query.q.toLowerCase();
      list = list.filter(
        (t) =>
          t.customer.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }
    if (query.sort === 'risk') list.sort((a, b) => b.riskScore - a.riskScore);
    json(res, 200, { transactions: list, count: list.length });
  });

  r.get('/api/transactions/:id', (_req, res, { params }) =>
    json(res, 200, findTransaction(params.id))
  );

  r.post('/api/transactions', async (req, res) => {
    const body = await readJsonBody(req);
    const errors = {};
    if (!body.customer || !String(body.customer).trim()) errors.customer = 'Enter a customer name';
    const amount = Number(body.amount);
    if (!body.amount || Number.isNaN(amount) || amount <= 0)
      errors.amount = 'Enter an amount greater than zero';
    if (body.channel && !CHANNELS.includes(body.channel)) errors.channel = 'Unknown channel';
    if (Object.keys(errors).length) throw new HttpError(422, 'Check the highlighted fields', errors);

    const channel = body.channel || 'ONLINE';
    const location = body.location || 'US';
    const { score, factors, typology } = scoreTransaction({ amount, channel, location });

    const txn = store.write((s) => {
      s.counters.transaction = (s.counters.transaction || 0) + 1;
      const record = {
        id: `TXN-${String(s.counters.transaction).padStart(3, '0')}`,
        customer: String(body.customer).trim(),
        customerId: body.customerId || `C${String(s.counters.transaction).padStart(3, '0')}`,
        amount,
        currency: CURRENCIES.includes(body.currency) ? body.currency : 'USD',
        channel,
        location,
        riskScore: score,
        type: typology,
        status: score >= SAR_THRESHOLD ? 'OPEN' : 'CLOSED',
        origin: 'intake',
        createdAt: new Date().toISOString(),
        decision: null,
        justification: null,
      };
      s.transactions.unshift(record);
      return record;
    });

    audit(
      body.user || 'Investigator',
      'TRANSACTION_SUBMITTED',
      txn.id,
      `Scored ${(score * 100).toFixed(0)}% (${riskLabel(score)}) — ${
        score >= SAR_THRESHOLD ? 'alert created' : 'auto-closed, below threshold'
      }`
    );

    json(res, 201, {
      transaction: txn,
      factors,
      alertCreated: score >= SAR_THRESHOLD,
      riskLabel: riskLabel(score),
    });
  });

  r.patch('/api/transactions/:id', async (req, res, { params }) => {
    const body = await readJsonBody(req);
    const t = findTransaction(params.id);
    const mapping = DECISIONS[body.decision];
    if (!mapping)
      throw new HttpError(422, 'decision must be APPROVE, ESCALATE or CLOSE', {
        decision: 'Unknown decision',
      });
    if (!body.justification || !String(body.justification).trim())
      throw new HttpError(422, 'A written justification is required', {
        justification: 'Record why you reached this decision',
      });

    const updated = store.write((s) => {
      const rec = s.transactions.find((x) => x.id === params.id);
      rec.status = mapping.status;
      rec.decision = body.decision;
      rec.justification = String(body.justification).trim();
      rec.decidedAt = new Date().toISOString();
      rec.decidedBy = body.user || 'Investigator';
      return rec;
    });

    audit(body.user || 'Investigator', mapping.action, t.id, updated.justification);
    json(res, 200, { transaction: updated });
  });

  r.get('/api/transactions/:id/case', (_req, res, { params }) => {
    const t = findTransaction(params.id);
    const built = buildCase(t, store.read().transactions);
    audit('Case service', 'CASE_ASSEMBLED', t.id, 'Evidence aggregated, summary and SAR draft ready');
    json(res, 200, built);
  });

  // ── Alerts ────────────────────────────────────────────────────────────────
  r.get('/api/alerts', (_req, res) => {
    const alerts = store
      .read()
      .transactions.filter((t) => t.status === 'OPEN' && t.riskScore >= SAR_THRESHOLD)
      .sort((a, b) => b.riskScore - a.riskScore)
      .map((t) => ({ ...t, riskLabel: riskLabel(t.riskScore) }));
    json(res, 200, { alerts, count: alerts.length });
  });

  // ── Audit ─────────────────────────────────────────────────────────────────
  r.get('/api/audit', (_req, res, { query }) => {
    const limit = Math.min(Number(query.limit) || 100, 500);
    const log = store.read().audit;
    json(res, 200, { entries: log.slice(0, limit), total: log.length });
  });

  r.post('/api/audit', async (req, res) => {
    const body = await readJsonBody(req);
    if (!body.action) throw new HttpError(422, 'action is required', { action: 'Required' });
    const entry = audit(
      body.user || 'System',
      body.action,
      body.entity || '—',
      body.detail || ''
    );
    json(res, 201, entry);
  });

  r.get('/api/audit.csv', (_req, res) => {
    const rows = [['timestamp', 'user', 'action', 'entity', 'detail']];
    for (const e of store.read().audit) rows.push([e.ts, e.user, e.action, e.entity, e.detail]);
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    text(res, 200, csv, 'text/csv; charset=utf-8', {
      'Content-Disposition': 'attachment; filename="wave-audit-trail.csv"',
    });
  });

  // ── Favorites (prompt library + glossary) ─────────────────────────────────
  r.get('/api/favorites', (_req, res, { query }) => {
    let list = store.read().favorites;
    if (query.kind) list = list.filter((f) => f.kind === query.kind);
    json(res, 200, { favorites: list });
  });

  r.post('/api/favorites', async (req, res) => {
    const body = await readJsonBody(req);
    if (!body.kind || !body.itemId)
      throw new HttpError(422, 'kind and itemId are required', { itemId: 'Required' });
    const key = `${body.kind}:${body.itemId}`;
    const created = store.write((s) => {
      if (s.favorites.some((f) => f.key === key)) return null;
      const fav = {
        key,
        kind: body.kind,
        itemId: body.itemId,
        label: body.label || body.itemId,
        savedAt: new Date().toISOString(),
      };
      s.favorites.push(fav);
      return fav;
    });
    if (created) audit('Analyst', 'ITEM_SAVED', body.itemId, `Saved to ${body.kind} favourites`);
    json(res, created ? 201 : 200, { favorites: store.read().favorites });
  });

  r.delete('/api/favorites/:key', (_req, res, { params }) => {
    store.write((s) => {
      s.favorites = s.favorites.filter((f) => f.key !== params.key);
    });
    json(res, 200, { favorites: store.read().favorites });
  });

  // ── Usage counters (drives the "views" figure in the nav rail) ────────────
  r.post('/api/usage/:tabId', (_req, res, { params }) => {
    const views = store.write((s) => {
      s.usage[params.tabId] = (s.usage[params.tabId] || 0) + 1;
      return s.usage[params.tabId];
    });
    json(res, 200, { tabId: params.tabId, views });
  });

  // ── Reset (handy while demoing) ───────────────────────────────────────────
  r.post('/api/reset', (_req, res) => {
    store.reset();
    json(res, 200, { status: 'reset', records: store.read().transactions.length });
  });

  return r;
}
