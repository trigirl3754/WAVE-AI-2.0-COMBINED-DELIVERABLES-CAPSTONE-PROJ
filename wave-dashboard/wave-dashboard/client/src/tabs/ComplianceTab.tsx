/**
 * Compliance Ops tab.
 *
 * All transaction data, risk scores, case files and audit entries come from the
 * backend (see server/routes.mjs). This file renders them and posts decisions
 * back — it holds no source-of-truth data of its own.
 */

import { useEffect, useState } from "react";
import {
  useLive,
  usePolling,
  refresh as refreshLive,
  useReference,
  submitTransaction,
  decideCase,
  loadCase,
} from "../lib/live";
import { ApiError, type CaseFile, type Factor, type Transaction } from "../lib/api";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:     "#060A12",
  surf:   "#0C1220",
  card:   "#111C2E",
  dim:    "#172138",
  border: "rgba(255,255,255,0.07)",
  teal:   "#00E5C8",
  violet: "#A78BFA",
  orange: "#F97316",
  gold:   "#FACC15",
  red:    "#F43F5E",
  blue:   "#38BDF8",
  green:  "#34D399",
  text:   "#E2E8F0",
  muted:  "#64748B",
  light:  "#94A3B8",
};

function getRiskColor(score: number) {
  if (score >= 0.85) return C.red;
  if (score >= 0.70) return C.orange;
  if (score >= 0.50) return C.gold;
  return C.green;
}
function getRiskLabel(score: number) {
  if (score >= 0.85) return "CRITICAL";
  if (score >= 0.70) return "HIGH";
  if (score >= 0.50) return "MEDIUM";
  return "LOW";
}

const money = (t: { currency: string; amount: number }) =>
  `${t.currency} ${Number(t.amount).toLocaleString()}`;

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// ── SHARED PIECES ─────────────────────────────────────────────────────────────
function Loading({ label }: { label: string }) {
  return (
    <div style={{ padding: "60px 32px", textAlign: "center", color: C.muted, fontSize: 13 }}>
      <div style={{ display: "inline-flex", gap: 5, marginBottom: 14 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="wave-pulse-dot"
            style={{
              width: 7, height: 7, borderRadius: "50%", background: C.teal,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
      <div>{label}</div>
    </div>
  );
}

function Problem({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ margin: "28px 32px", padding: "20px 24px", borderRadius: 12,
      background: `${C.red}0D`, border: `1px solid ${C.red}35` }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.red, letterSpacing: 1, marginBottom: 6 }}>
        COMPLIANCE DATA UNAVAILABLE
      </div>
      <div style={{ fontSize: 13, color: C.light, marginBottom: 14 }}>{message}</div>
      <button onClick={onRetry} style={{
        padding: "8px 16px", borderRadius: 8, cursor: "pointer",
        background: `${C.teal}15`, border: `1px solid ${C.teal}45`,
        color: C.teal, fontSize: 12, fontWeight: 700,
      }}>Try again</button>
    </div>
  );
}

function FactorList({ factors }: { factors: Factor[] }) {
  if (!factors.length)
    return <div style={{ fontSize: 11, color: C.muted }}>No individual risk factors fired.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {factors.map((f) => (
        <div key={f.label} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 11 }}>
          <span style={{
            flexShrink: 0, minWidth: 44, textAlign: "right", fontWeight: 800,
            color: C.gold, fontVariantNumeric: "tabular-nums",
          }}>+{(f.weight * 100).toFixed(0)}</span>
          <span style={{ color: C.light }}>{f.detail}</span>
        </div>
      ))}
    </div>
  );
}

// ── TAG COMPONENT ─────────────────────────────────────────────────────────────
const RiskBadge = ({ score }: { score: number }) => {
  const color = getRiskColor(score);
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
      padding: "3px 8px", borderRadius: 20,
      color, border: `1px solid ${color}50`, background: `${color}15`,
    }}>{getRiskLabel(score)}</span>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// VIEWS
// ══════════════════════════════════════════════════════════════════════════════

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ onNav }: { onNav: (view: string) => void }) {
  const { metrics, alerts, loading, error, lastSync } = useLive();

  if (error) return <Problem message={error} onRetry={refreshLive} />;
  if (loading || !metrics) return <Loading label="Loading live compliance data…" />;

  const critical = alerts.filter((t) => t.riskScore >= 0.85);
  const high = alerts.filter((t) => t.riskScore >= metrics.threshold && t.riskScore < 0.85);

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: C.teal, fontWeight: 800, marginBottom: 6 }}>EXECUTIVE RISK COCKPIT</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Compliance Intelligence Dashboard</h1>
        <p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>
          Served live from the API{lastSync ? ` · last synced ${clock(lastSync)}` : ""} · refreshes every 15s
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Transactions", value: metrics.total, sub: "In the ledger", color: C.blue },
          { label: "Open Alerts", value: metrics.open, sub: "Requires review", color: C.orange },
          { label: "Critical", value: metrics.critical, sub: "Risk ≥ 85%", color: C.red },
          { label: "High", value: metrics.high, sub: "Risk 70–84%", color: C.gold },
          { label: "Resolved", value: metrics.resolved, sub: "Decision recorded", color: C.green },
        ].map((k, i) => (
          <div key={i} style={{
            padding: "18px 20px", borderRadius: 12,
            background: `${k.color}08`, border: `1px solid ${k.color}25`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginTop: 6 }}>{k.label}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert List Preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 10, letterSpacing: 1 }}>🔴 CRITICAL ALERTS — ACTION REQUIRED</div>
          {critical.slice(0,4).map(t => (
            <div key={t.id} onClick={() => onNav("alerts")} style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
              background: `${C.red}08`, border: `1px solid ${C.red}25`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "border-color 0.2s",
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t.customer}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{t.currency} {t.amount.toLocaleString()} · {t.location} · {t.type}</div>
              </div>
              <RiskBadge score={t.riskScore} />
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, marginBottom: 10, letterSpacing: 1 }}>🟠 HIGH RISK ALERTS</div>
          {high.slice(0,4).map(t => (
            <div key={t.id} onClick={() => onNav("alerts")} style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
              background: `${C.orange}08`, border: `1px solid ${C.orange}25`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t.customer}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{t.currency} {t.amount.toLocaleString()} · {t.location} · {t.type}</div>
              </div>
              <RiskBadge score={t.riskScore} />
            </div>
          ))}

          {/* Typology mix — computed server-side across the whole ledger */}
          <div style={{
            marginTop: 16, padding: "16px", borderRadius: 12,
            background: `${C.teal}08`, border: `1px solid ${C.teal}25`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, letterSpacing: 1 }}>TYPOLOGY MIX</div>
              <div style={{ fontSize: 10, color: C.muted }}>
                mean risk {(metrics.avgRiskScore * 100).toFixed(0)}%
              </div>
            </div>
            {metrics.byTypology.slice(0, 6).map((row) => (
              <div key={row.type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: C.light, width: 130, flexShrink: 0 }}>{row.type}</span>
                <span style={{ flex: 1, height: 6, borderRadius: 3, background: C.dim, overflow: "hidden" }}>
                  <span style={{
                    display: "block", height: "100%", borderRadius: 3, background: C.teal,
                    width: `${(row.count / metrics.total) * 100}%`,
                  }} />
                </span>
                <span style={{ fontSize: 11, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TRANSACTIONS VIEW ─────────────────────────────────────────────────────────
function TransactionsView({ onSubmit }: { onSubmit: (t: Transaction) => void }) {
  const ref = useReference();
  const [form, setForm] = useState({ customer: "", amount: "", currency: "USD", channel: "ONLINE", location: "US" });
  const [result, setResult] = useState<{ transaction: Transaction; factors: Factor[]; alertCreated: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setFieldErrors({});
    setFormError(null);
    try {
      // The server scores the transaction and decides whether an alert opens.
      const scored = await submitTransaction(form);
      setResult(scored);
      if (scored.alertCreated) onSubmit(scored.transaction);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFieldErrors(err.fields);
      else setFormError(err instanceof ApiError ? err.message : "Couldn't submit the transaction.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: C.blue, fontWeight: 800, marginBottom: 6 }}>TRANSACTION INTAKE</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>Submit New Transaction</h2>
      <p style={{ color: C.muted, margin: "0 0 24px", fontSize: 13 }}>AI fraud model scores in real-time. Alert auto-created if risk ≥ 70%.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ padding: "24px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Customer Name", key: "customer", type: "text", placeholder: "Full legal name" },
              { label: "Transaction Amount", key: "amount", type: "number", placeholder: "e.g. 15000" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>{f.label.toUpperCase()}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  aria-invalid={Boolean(fieldErrors[f.key])}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.dim,
                    border: `1px solid ${fieldErrors[f.key] ? C.red : C.border}`,
                    color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                {fieldErrors[f.key] && (
                  <div style={{ marginTop: 5, fontSize: 10, color: C.red }}>{fieldErrors[f.key]}</div>
                )}
              </div>
            ))}

            <div>
              <label style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>CURRENCY</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.dim, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none" }}>
                {ref.currencies.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>CHANNEL</label>
              <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.dim, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none" }}>
                {ref.channels.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>ORIGIN LOCATION</label>
              <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.dim, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none" }}>
                {ref.countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name} ({country.code})</option>
                ))}
              </select>
              {ref.isHighRisk(form.location) && (
                <div style={{ marginTop: 6, fontSize: 10, color: C.red }}>⚠ High-risk jurisdiction detected</div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{
              padding: "12px", borderRadius: 10, border: "none", cursor: loading ? "wait" : "pointer",
              background: loading ? C.muted : `linear-gradient(135deg,${C.teal},${C.violet})`,
              color: C.bg, fontWeight: 800, fontSize: 13, letterSpacing: 0.5,
              transition: "opacity 0.2s",
            }}>{loading ? "Scoring…" : "Submit transaction"}</button>
            {formError && (
              <div style={{ fontSize: 11, color: C.red, marginTop: -4 }}>{formError}</div>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <div>
          {!result ? (
            <div style={{
              height: "100%", minHeight: 320, borderRadius: 14, border: `1px dashed ${C.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              color: C.muted, fontSize: 13, gap: 8, textAlign: "center", padding: 24,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 2, fontWeight: 800, color: C.light }}>
                NO RESULT YET
              </div>
              <div style={{ maxWidth: 260 }}>
                Submit a transaction and the scoring service returns its risk score and the factors behind it.
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: 14, background: C.card, border: `1px solid ${getRiskColor(result.transaction.riskScore)}40`, padding: "24px", height: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Scoring result</div>
                <RiskBadge score={result.transaction.riskScore} />
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>COMPOSITE RISK SCORE</div>
                <div style={{ height: 10, borderRadius: 5, background: C.dim, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${result.transaction.riskScore * 100}%`, background: `linear-gradient(90deg,${C.teal},${getRiskColor(result.transaction.riskScore)})`, borderRadius: 5, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: getRiskColor(result.transaction.riskScore), marginTop: 6 }}>
                  {(result.transaction.riskScore * 100).toFixed(0)}%
                </div>
              </div>

              {([
                ["Transaction", result.transaction.id],
                ["Customer", result.transaction.customer],
                ["Amount", money(result.transaction)],
                ["Channel", result.transaction.channel],
                ["Origin", result.transaction.location],
                ["Typology", result.transaction.type],
                ["Alert", result.alertCreated ? "Opened — see Alerts" : "Not opened — below threshold"],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{l}</span>
                  <span style={{ color: l === "Alert" && result.alertCreated ? C.orange : C.text, fontWeight: 600, textAlign: "right" }}>{v}</span>
                </div>
              ))}

              {/* Factor breakdown returned by the scoring service */}
              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, background: `${C.teal}08`, border: `1px solid ${C.teal}20` }}>
                <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>
                  WHY IT SCORED THIS WAY
                </div>
                <FactorList factors={result.factors} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ALERTS VIEW ───────────────────────────────────────────────────────────────
function AlertsView({ onInvestigate }: { onInvestigate: (t: Transaction) => void }) {
  const [filter, setFilter] = useState("ALL");
  const { alerts, loading, error } = useLive();
  const ref = useReference();

  if (error) return <Problem message={error} onRetry={refreshLive} />;
  if (loading) return <Loading label="Loading the alert queue…" />;

  const open = alerts;
  const filtered = filter === "ALL" ? open : open.filter(t => getRiskLabel(t.riskScore) === filter);

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: C.orange, fontWeight: 800, marginBottom: 6 }}>ALERT QUEUE</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>Open alerts, highest risk first</h2>
      <p style={{ color: C.muted, margin: "0 0 20px", fontSize: 13 }}>
        {open.length} transaction{open.length === 1 ? "" : "s"} scored at or above the{" "}
        {(ref.threshold * 100).toFixed(0)}% review threshold. Open one to assemble its case file.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["ALL","CRITICAL","HIGH","MEDIUM"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700,
            background: filter === f ? `${f === "CRITICAL" ? C.red : f === "HIGH" ? C.orange : f === "MEDIUM" ? C.gold : C.teal}20` : "transparent",
            border: `1px solid ${filter === f ? (f === "CRITICAL" ? C.red : f === "HIGH" ? C.orange : f === "MEDIUM" ? C.gold : C.teal) + "60" : C.border}`,
            color: filter === f ? (f === "CRITICAL" ? C.red : f === "HIGH" ? C.orange : f === "MEDIUM" ? C.gold : C.teal) : C.muted,
          }}>{f} {f !== "ALL" && `(${open.filter(t => getRiskLabel(t.riskScore) === f).length})`}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.sort((a,b) => b.riskScore - a.riskScore).map(t => (
          <div key={t.id} onClick={() => onInvestigate(t)} style={{
            padding: "16px 20px", borderRadius: 12, cursor: "pointer",
            background: C.card, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 16,
            transition: "border-color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = getRiskColor(t.riskScore) + "50"}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

            {/* Risk score circle */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: `${getRiskColor(t.riskScore)}15`,
              border: `2px solid ${getRiskColor(t.riskScore)}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900, color: getRiskColor(t.riskScore),
            }}>{(t.riskScore * 100).toFixed(0)}%</div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{t.customer}</span>
                <RiskBadge score={t.riskScore} />
                <span style={{ fontSize: 10, color: C.muted, background: C.dim, padding: "2px 8px", borderRadius: 10 }}>{t.type}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {t.id} · {t.currency} {t.amount.toLocaleString()} · {t.channel} · {t.location}
                {ref.isHighRisk(t.location) && <span style={{ color: C.red, marginLeft: 6 }}>Watchlisted jurisdiction</span>}
              </div>
            </div>

            <button style={{
              padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.teal}40`,
              background: `${C.teal}10`, color: C.teal, fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>Open case</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── INVESTIGATOR CO-PILOT ─────────────────────────────────────────────────────
function InvestigatorView({
  transaction,
  onBack,
}: {
  transaction: Transaction;
  onBack: () => void;
}) {
  const t = transaction;
  const ref = useReference();
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null);
  const [caseError, setCaseError] = useState<string | null>(null);
  const [sarText, setSarText] = useState("");
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [deciding, setDeciding] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // The backend assembles the case: evidence, summary and SAR first draft.
  useEffect(() => {
    let cancelled = false;
    setCaseFile(null);
    setCaseError(null);
    loadCase(t.id)
      .then((file) => {
        if (cancelled) return;
        setCaseFile(file);
        setSarText(file.sarDraft);
      })
      .catch((err) => {
        if (!cancelled)
          setCaseError(err instanceof ApiError ? err.message : "Couldn't assemble the case file.");
      });
    return () => {
      cancelled = true;
    };
  }, [t.id]);

  async function handleDecision(d: string) {
    if (!justification.trim() || deciding) return;
    setDeciding(true);
    setDecisionError(null);
    try {
      await decideCase(t.id, d, justification.trim());
      setDecision(d);
    } catch (err) {
      setDecisionError(
        err instanceof ApiError ? err.message : "Couldn't record the decision. Nothing was saved."
      );
    } finally {
      setDeciding(false);
    }
  }

  const stage = decision ? "complete" : caseFile ? "review" : "loading";
  const summary = caseFile?.summary ?? "";

  return (
    <div style={{ padding: "28px 32px" }}>
      <button onClick={onBack} style={{
        background: "transparent", border: "none", color: C.muted,
        cursor: "pointer", fontSize: 12, marginBottom: 20, padding: 0,
      }}>← Back to alerts</button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: C.violet, fontWeight: 800 }}>CASE FILE</div>
        <RiskBadge score={t.riskScore} />
        <span style={{ fontSize: 10, color: C.muted }}>{t.id}</span>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>{t.customer}</h2>
      <p style={{ color: C.muted, margin: "0 0 24px", fontSize: 13 }}>
        {money(t)} · {t.channel} · {t.location} · risk {(t.riskScore * 100).toFixed(0)}%
      </p>

      {caseError && <Problem message={caseError} onRetry={() => loadCase(t.id).then(setCaseFile).catch(() => {})} />}

      {stage === "loading" && !caseError && (
        <Loading label="Assembling the case file — evidence, summary and SAR draft…" />
      )}

      {caseFile && (
        <>
        {/* Evidence bundle returned by the case service */}
        <div style={{ marginBottom: 20, padding: "16px 18px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>EVIDENCE GATHERED</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
            {caseFile.evidence.map((e) => {
              const tone = e.status === "attention" ? C.orange : e.status === "empty" ? C.muted : C.teal;
              return (
                <div key={e.source} style={{ padding: "10px 12px", borderRadius: 9, background: C.dim, border: `1px solid ${tone}25` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{e.source}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: tone }}>{e.status.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.5 }}>{e.detail}</div>
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}


      {stage !== "loading" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left: Case data + AI summary */}
          <div>
            {/* Transaction details */}
            <div style={{ padding: "18px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>TRANSACTION DETAILS</div>
              {[
                ["Transaction ID", t.id],
                ["Customer ID", t.customerId],
                ["Amount", `${t.currency} ${t.amount.toLocaleString()}`],
                ["Channel", t.channel],
                ["Origin", t.location + (ref.isHighRisk(t.location) ? " · watchlisted" : "")],
                ["Typology", t.type],
                ["Risk Score", `${(t.riskScore*100).toFixed(0)}%`],
              ].map(([l,v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{l}</span>
                  <span style={{ color: l === "Risk Score" ? getRiskColor(t.riskScore) : l.includes("Origin") && ref.isHighRisk(t.location) ? C.red : C.text, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            <div style={{ padding: "18px", borderRadius: 12, background: `${C.violet}08`, border: `1px solid ${C.violet}30` }}>
              <div style={{ fontSize: 10, color: C.violet, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>CASE SUMMARY</div>
              <pre style={{ fontSize: 11, color: C.light, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{summary}</pre>
            </div>

            {/* Investigator notes */}
            {stage !== "complete" && (
              <div style={{ marginTop: 16, padding: "16px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>INVESTIGATOR NOTES</div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Working notes for this case…"
                  style={{ width: "100%", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, padding: "10px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
          </div>

          {/* Right: SAR Draft */}
          <div>
            <div style={{ padding: "18px", borderRadius: 12, background: `${C.teal}08`, border: `1px solid ${C.teal}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, letterSpacing: 1 }}>SAR FIRST DRAFT — EDITABLE</div>
                <span style={{ fontSize: 9, color: C.orange, background: `${C.orange}15`, padding: "2px 8px", borderRadius: 10, border: `1px solid ${C.orange}30` }}>NEEDS YOUR APPROVAL</span>
              </div>
              <textarea value={sarText} onChange={e => setSarText(e.target.value)} rows={18}
                style={{ width: "100%", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 11, padding: "12px", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", fontFamily: "monospace" }} />
            </div>

            {/* Decision Panel */}
            {stage !== "complete" ? (
              <div style={{ marginTop: 16, padding: "18px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>YOUR DECISION</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
                  The analysis above is a recommendation. The decision is yours, and it goes into the audit trail with your justification attached.
                </div>
                <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={2}
                  placeholder="Why are you making this decision?"
                  style={{ width: "100%", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, padding: "10px", resize: "none", outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "Approve SAR", action: "APPROVE", color: C.green },
                    { label: "Escalate", action: "ESCALATE", color: C.orange },
                    { label: "Close case", action: "CLOSE", color: C.light },
                  ].map(btn => {
                    const ready = Boolean(justification.trim()) && !deciding;
                    return (
                      <button key={btn.action} onClick={() => handleDecision(btn.action)} disabled={!ready} style={{
                        flex: 1, padding: "10px 8px", borderRadius: 8, border: `1px solid ${btn.color}40`,
                        background: ready ? `${btn.color}15` : "transparent",
                        color: ready ? btn.color : C.muted,
                        fontSize: 11, fontWeight: 700, cursor: ready ? "pointer" : "not-allowed",
                      }}>{deciding ? "Saving…" : btn.label}</button>
                    );
                  })}
                </div>
                {!justification.trim() && (
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>
                    Write a justification to enable these actions.
                  </div>
                )}
                {decisionError && (
                  <div style={{ fontSize: 11, color: C.red, marginTop: 8 }}>{decisionError}</div>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 16, padding: "18px", borderRadius: 12, background: `${decision === "APPROVE" ? C.green : decision === "ESCALATE" ? C.orange : C.muted}10`, border: `1px solid ${decision === "APPROVE" ? C.green : decision === "ESCALATE" ? C.orange : C.muted}40` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: decision === "APPROVE" ? C.green : decision === "ESCALATE" ? C.orange : C.light, marginBottom: 8 }}>
                  {decision === "APPROVE" ? "SAR approved, ready to file" : decision === "ESCALATE" ? "Escalated to senior review" : "Case closed"}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Justification recorded: “{justification}”</div>
                <div style={{ fontSize: 10, color: C.teal }}>Saved to the audit trail. Reopen it from the Audit tab.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AUDIT TRAIL VIEW ──────────────────────────────────────────────────────────
function AuditView() {
  const { audit, loading, error } = useLive();

  if (error) return <Problem message={error} onRetry={refreshLive} />;
  if (loading) return <Loading label="Loading the audit trail…" />;

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: C.gold, fontWeight: 800, marginBottom: 6 }}>GOVERNANCE & ACCOUNTABILITY</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>Audit trail</h2>
          <p style={{ color: C.muted, margin: "0 0 24px", fontSize: 13 }}>
            Every scoring run, case assembly and human decision, append-only and stored server-side.
          </p>
        </div>
        <a href="/api/audit.csv" download style={{
          padding: "8px 16px", borderRadius: 8, textDecoration: "none",
          background: `${C.gold}12`, border: `1px solid ${C.gold}40`,
          color: C.gold, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
        }}>Export CSV</a>
      </div>

      {audit.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: C.muted, fontSize: 13 }}>
          <div style={{ fontSize: 13, color: C.light, fontWeight: 700, marginBottom: 6 }}>Nothing logged yet</div>
          <div>Submit a transaction or open a case, and the entries will appear here.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {audit.map((log) => (
            <div key={log.id} style={{
              padding: "14px 18px", borderRadius: 10,
              background: C.card, border: `1px solid ${C.border}`,
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: log.action.includes("SAR") ? `${C.green}15` : log.action.includes("CLOSE") ? `${C.muted}15` : log.action.includes("AI") || log.action.includes("CASE") ? `${C.violet}15` : `${C.teal}15`,
                border: `1px solid ${log.action.includes("SAR") ? C.green : log.action.includes("AI") || log.action.includes("CASE") ? C.violet : C.teal}30`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>
                {log.action.includes("SAR") ? "✅" : log.action.includes("CLOSE") ? "✖️" : log.action.includes("AI") || log.action.includes("CASE") ? "🤖" : "📋"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{log.action.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 10, color: C.muted, background: C.dim, padding: "2px 8px", borderRadius: 10 }}>{log.user}</span>
                  <span style={{ fontSize: 10, color: C.muted }}>{clock(log.ts)}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Entity: <strong style={{ color: C.light }}>{log.entity}</strong> — {log.detail}
                </div>
              </div>
              <div style={{ fontSize: 9, color: C.teal, letterSpacing: 1, fontWeight: 700 }}>LOGGED</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function ComplianceOps() {
  const [view, setView] = useState("dashboard");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const { alerts, audit, lastSync, error } = useLive();

  // Keeps this tab in step with the server while it's on screen.
  usePolling(15_000);

  const navItems = [
    { id: "dashboard",    label: "Dashboard",    icon: "▪" },
    { id: "transactions", label: "Intake",       icon: "▪" },
    { id: "alerts",       label: "Alerts",       icon: "▪", badge: alerts.length || null },
    { id: "audit",        label: "Audit trail",  icon: "▪", badge: audit.length || null },
  ];

  function handleInvestigate(txn: Transaction) {
    setSelectedTxn(txn);
    setView("investigate");
  }

  return (
    <div style={{
      height:"100%", display: "flex", flexDirection: "column",
      background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif",
      color: C.text, overflow: "hidden",
    }}>
      {/* ── TOP BAR ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", background: C.surf, borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg,${C.teal},${C.violet})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: C.teal, fontWeight: 800 }}>WAVE AI</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Compliance operations</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12,
              background: view === n.id || (view === "investigate" && n.id === "alerts") ? `${C.teal}15` : "transparent",
              border: `1px solid ${view === n.id || (view === "investigate" && n.id === "alerts") ? C.teal + "50" : "transparent"}`,
              color: view === n.id || (view === "investigate" && n.id === "alerts") ? C.teal : C.muted,
              fontWeight: view === n.id ? 700 : 400, transition: "all 0.15s",
            }}>
              {n.icon} {n.label}
              {n.badge ? (
                <span style={{
                  background: C.red, color: "#fff", borderRadius: "50%",
                  width: 16, height: 16, fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{n.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: error ? C.red : C.green,
            boxShadow: `0 0 6px ${error ? C.red : C.green}`,
          }} />
          <span style={{ fontSize: 11, color: C.muted }}>
            {error ? "API unreachable" : lastSync ? `Synced ${clock(lastSync)}` : "Connecting…"}
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
        {view === "dashboard"    && <Dashboard onNav={setView} />}
        {view === "transactions" && <TransactionsView onSubmit={t => { setSelectedTxn(t); }} />}
        {view === "alerts"       && <AlertsView onInvestigate={handleInvestigate} />}
        {view === "investigate"  && selectedTxn && (
          <InvestigatorView transaction={selectedTxn} onBack={() => setView("alerts")} />
        )}
        {view === "audit" && <AuditView />}
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{
        flexShrink: 0, padding: "6px 24px",
        background: C.surf, borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: C.muted,
      }}>
        <span>WAVE AI · WIC × Microsoft AI Innovator Apprenticeship · 2026</span>
        <span>
          {alerts.length} open alert{alerts.length === 1 ? "" : "s"} ·{" "}
          {audit.length} audit entr{audit.length === 1 ? "y" : "ies"} ·{" "}
          <span style={{ color: error ? C.red : C.green }}>●</span>{" "}
          {error ? "API unreachable" : "served from the API"}
        </span>
      </div>
    </div>
  );
}
