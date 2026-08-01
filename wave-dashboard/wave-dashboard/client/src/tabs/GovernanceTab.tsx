import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Bot,
  UserCheck,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  OctagonAlert,
  CircleAlert,
  FileWarning,
  Eye,
  Scale,
  Landmark,
} from "lucide-react";

/* -------------------------------------------------------------------------
 * TYPES
 * ---------------------------------------------------------------------- */

type Verdict = "ai" | "assist" | "human";

interface OpportunityRow {
  task: string;
  why: string;
  verdict: Verdict;
  verdictLabel: string;
}

interface VerificationRow {
  produces: string;
  checks: string;
}

type Priority = "high" | "medium" | "low";

interface RiskRow {
  risk: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  priority: Priority;
  priorityLabel: string;
  rationale: string;
}

type RaciValue = "R" | "A" | "C" | "I" | "R,A" | "—";

interface RaciRow {
  task: string;
  aiSystem: RaciValue;
  investigator: RaciValue;
  complianceManager: RaciValue;
  auditor: RaciValue;
}

interface WorkflowStep {
  step: number;
  label: string;
  actor: "ai" | "human" | "system";
  checkpoint?: number;
  branch?: string;
}

/* -------------------------------------------------------------------------
 * DATA
 * ---------------------------------------------------------------------- */

const opportunityRows: OpportunityRow[] = [
  {
    task: "Summarize transaction history",
    why: "AI just reads & summarizes data — easy to spot mistakes",
    verdict: "ai",
    verdictLabel: "Good idea for AI",
  },
  {
    task: "Summarize customer profile",
    why: "Same — low risk, saves time",
    verdict: "ai",
    verdictLabel: "Good idea for AI",
  },
  {
    task: "Spot suspicious patterns",
    why: "Helpful flagging, human still reviews it",
    verdict: "ai",
    verdictLabel: "Good idea for AI",
  },
  {
    task: "Calculate a risk score",
    why: "Speeds things up, human sees reasoning before acting",
    verdict: "ai",
    verdictLabel: "Good idea for AI",
  },
  {
    task: "Recommend next action (escalate/close/review)",
    why: "AI only suggests — human clicks the final button",
    verdict: "ai",
    verdictLabel: "Good idea for AI",
  },
  {
    task: "Draft the SAR report",
    why: "Real legal document — mistakes matter a lot",
    verdict: "assist",
    verdictLabel: "AI helps, human must check",
  },
  {
    task: "Close an investigation",
    why: "Final decision, real consequences",
    verdict: "human",
    verdictLabel: "Humans only",
  },
  {
    task: "Submit a SAR to regulators",
    why: "Legal filing — must be human-approved",
    verdict: "human",
    verdictLabel: "Humans only",
  },
  {
    task: "Freeze a bank account",
    why: "Direct financial action on a real person",
    verdict: "human",
    verdictLabel: "Humans only",
  },
  {
    task: "Approve an escalation",
    why: "Affects what happens to a real case",
    verdict: "human",
    verdictLabel: "Humans only",
  },
];

const verificationRows: VerificationRow[] = [
  {
    produces: "Risk score",
    checks: "Does this score actually match the evidence given?",
  },
  {
    produces: "Case summary",
    checks: "Did it miss anything important, or invent something not in the data?",
  },
  {
    produces: "Recommendation (escalate/close/review)",
    checks: "Does this match the risk score and summary, or contradict them?",
  },
  {
    produces: "SAR draft",
    checks: "Are required fields complete? Any factual mismatches with the case data?",
  },
];

const riskRows: RiskRow[] = [
  {
    risk: "AI hallucination",
    likelihood: "Medium",
    impact: "High",
    priority: "high",
    priorityLabel: "High",
    rationale:
      "AI language models can produce plausible but false details, especially when summarizing large amounts of data.",
  },
  {
    risk: "Wrong risk score",
    likelihood: "Medium",
    impact: "High",
    priority: "high",
    priorityLabel: "High",
    rationale:
      "Risk scoring involves judgment calls; AI can misweigh factors or miss context a human would catch.",
  },
  {
    risk: "Biased recommendations",
    likelihood: "Low",
    impact: "High",
    priority: "medium",
    priorityLabel: "Medium",
    rationale:
      "AI models can reflect patterns from training data that unintentionally disadvantage certain groups.",
  },
  {
    risk: "Automation bias",
    likelihood: "High",
    impact: "Medium",
    priority: "medium",
    priorityLabel: "Medium",
    rationale:
      "People tend to over-trust automated suggestions over time, especially under time pressure.",
  },
  {
    risk: "SAR draft errors",
    likelihood: "Medium",
    impact: "High",
    priority: "high",
    priorityLabel: "High",
    rationale:
      "Legal documents require precision; a small AI detail error could pass review if the human skims.",
  },
  {
    risk: "AI #2 misses an error",
    likelihood: "Low",
    impact: "Medium",
    priority: "low",
    priorityLabel: "Low",
    rationale:
      "A second AI layer reduces risk but cannot eliminate shared blind spots.",
  },
  {
    risk: "System downtime",
    likelihood: "Low",
    impact: "Medium",
    priority: "low",
    priorityLabel: "Low",
    rationale:
      "Cloud-based AI services generally have high uptime, but outages do happen and block workflows temporarily.",
  },
  {
    risk: "Data privacy leak",
    likelihood: "Low",
    impact: "High",
    priority: "medium",
    priorityLabel: "Medium",
    rationale:
      "Handling sensitive financial/PII data always carries exposure risk if controls are weak.",
  },
];

const raciRoleLabels = ["AI System", "Investigator", "Compliance Manager", "Auditor"] as const;

const raciRows: RaciRow[] = [
  { task: "Generate risk score", aiSystem: "R", investigator: "I", complianceManager: "C", auditor: "I" },
  { task: "Summarize case (transactions/customer)", aiSystem: "R", investigator: "I", complianceManager: "—", auditor: "—" },
  { task: "Generate recommendation", aiSystem: "R", investigator: "C", complianceManager: "—", auditor: "—" },
  { task: "Review case & make decision", aiSystem: "C", investigator: "R,A", complianceManager: "I", auditor: "—" },
  { task: "Approve escalation", aiSystem: "I", investigator: "R", complianceManager: "A", auditor: "I" },
  { task: "Draft SAR", aiSystem: "R", investigator: "C", complianceManager: "I", auditor: "—" },
  { task: "Review & edit SAR", aiSystem: "C", investigator: "R,A", complianceManager: "C", auditor: "I" },
  { task: "Approve SAR submission", aiSystem: "I", investigator: "I", complianceManager: "R,A", auditor: "I" },
  { task: "Close investigation", aiSystem: "I", investigator: "R,A", complianceManager: "I", auditor: "—" },
  { task: "Maintain audit logs", aiSystem: "R", investigator: "I", complianceManager: "I", auditor: "A" },
  { task: "Review governance/compliance", aiSystem: "I", investigator: "I", complianceManager: "C", auditor: "R,A" },
];

const raciLegend = [
  { letter: "R", label: "Responsible", desc: "who actually does the work" },
  { letter: "A", label: "Accountable", desc: "who's ultimately on the hook if it goes wrong" },
  { letter: "C", label: "Consulted", desc: "who gives input before it happens" },
  { letter: "I", label: "Informed", desc: "who just needs to know after it happens" },
];

const raciRoles = [
  { name: "AI System", detail: "Risk Engine + Investigator Copilot" },
  { name: "Investigator", detail: "Owns day-to-day case decisions" },
  { name: "Compliance Manager", detail: "Owns approvals with legal weight" },
  { name: "Auditor", detail: "Owns oversight of the whole system" },
];

const workflowSteps: WorkflowStep[] = [
  { step: 1, label: "Alert comes in", actor: "system" },
  { step: 2, label: "AI scores the risk", actor: "ai" },
  { step: 3, label: "AI #2 checks the score (verification layer)", actor: "ai" },
  { step: 4, label: "AI summarizes the case", actor: "ai" },
  { step: 5, label: "AI recommends an action", actor: "ai" },
  {
    step: 6,
    label: "Investigator reviews everything, decides: Close / Escalate / Need more info",
    actor: "human",
    checkpoint: 1,
    branch: "If Close → case closes and is logged. If Escalate → it moves into SAR drafting.",
  },
  { step: 7, label: "AI drafts the SAR", actor: "ai" },
  {
    step: 8,
    label: "Investigator edits/reviews the draft",
    actor: "human",
    checkpoint: 2,
  },
  {
    step: 9,
    label: "Compliance Manager approves submission",
    actor: "human",
    checkpoint: 3,
  },
  { step: 10, label: "Everything is logged — Auditor has visibility", actor: "system" },
];

const T = {
  bg: "#06080F",
  surface: "#0D1117",
  card: "#111827",
  border: "rgba(255,255,255,0.08)",
  teal: "#00E5C8",
  violet: "#A78BFA",
  orange: "#F97316",
  gold: "#FACC15",
  red: "#F43F5E",
  blue: "#38BDF8",
  text: "#E2E8F0",
  muted: "#64748B",
  dim: "#1E293B",
};

function sectionCardStyle(accent: string) {
  return {
    background: T.card,
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: "20px 22px",
    boxShadow: `0 0 0 1px ${T.border} inset`,
  } as const;
}

function verdictStyles(v: Verdict) {
  if (v === "ai") {
    return {
      accent: T.teal,
      badgeBackground: "rgba(0,229,200,0.12)",
      badgeText: T.teal,
      icon: <ShieldCheck size={16} color={T.teal} />,
    };
  }
  if (v === "assist") {
    return {
      accent: T.violet,
      badgeBackground: "rgba(167,139,250,0.12)",
      badgeText: T.violet,
      icon: <ShieldAlert size={16} color={T.violet} />,
    };
  }
  return {
    accent: T.red,
    badgeBackground: "rgba(244,63,94,0.12)",
    badgeText: T.red,
    icon: <ShieldX size={16} color={T.red} />,
  };
}

function priorityStyles(priority: Priority) {
  if (priority === "high") {
    return { background: "rgba(244,63,94,0.12)", color: T.red };
  }
  if (priority === "medium") {
    return { background: "rgba(249,115,22,0.12)", color: T.orange };
  }
  return { background: "rgba(250,204,21,0.12)", color: T.gold };
}

function levelDot(level: "Low" | "Medium" | "High") {
  const map = { Low: T.muted, Medium: T.blue, High: T.text };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: map[level], marginRight: 8 }} />;
}

function RaciCell({ value }: { value: RaciValue }) {
  const hasA = value.includes("A");
  if (value === "—") {
    return <span style={{ color: T.muted }}>—</span>;
  }
  return <span style={{ color: hasA ? T.red : T.text, fontWeight: hasA ? 800 : 600 }}>{value}</span>;
}

function OpportunityMatrix() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section style={{ marginBottom: 28 }}>
      <SectionHeader
        eyebrow="01 — Opportunity Matrix"
        title="What can AI actually do here?"
        subtitle="A per-task verdict on where AI is a good fit, where it needs a human check, and where only a human may act."
      />

      <div style={{ display: "grid", gap: 12 }}>
        {opportunityRows.map((row, index) => {
          const style = verdictStyles(row.verdict);
          return (
            <div key={row.task} style={{ ...sectionCardStyle(style.accent), padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(expanded === index ? null : index)}
                style={{ width: "100%", border: 0, background: "transparent", color: T.text, textAlign: "left", padding: "16px 18px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: style.accent, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
                      {row.verdictLabel}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{row.task}</div>
                    <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{row.why}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: style.badgeBackground, color: style.badgeText, padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      {style.icon}
                      {row.verdictLabel}
                    </span>
                    {expanded === index ? <ChevronDown size={16} color={T.muted} /> : <ChevronRight size={16} color={T.muted} />}
                  </div>
                </div>
              </button>
              {expanded === index && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 18px 16px", fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
                  {row.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VerificationLayer() {
  return (
    <section style={{ marginBottom: 28 }}>
      <SectionHeader
        eyebrow="02 — Verification Layer"
        title="AI checking AI"
        subtitle="Sits between AI output and human review — it is a quality check, not a decision-maker."
      />

      <div style={{ display: "grid", gap: 12 }}>
        {verificationRows.map((row) => (
          <div key={row.produces} style={{ ...sectionCardStyle(T.blue), display: "grid", gap: 8 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: T.blue, fontWeight: 800, textTransform: "uppercase" }}>Verification check</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{row.produces}</div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{row.checks}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, padding: "14px 16px", borderRadius: 14, background: "rgba(56,189,248,0.08)", border: `1px solid ${T.blue}33` }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 999, background: T.card, color: T.text, border: `1px solid ${T.blue}33`, fontSize: 12 }}>
          <Bot size={14} color={T.blue} /> AI #1 (does the work)
        </span>
        <ArrowRight size={14} color={T.muted} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 999, background: T.card, color: T.text, border: `1px solid ${T.blue}33`, fontSize: 12 }}>
          <Eye size={14} color={T.blue} /> AI #2 (checks the work)
        </span>
        <ArrowRight size={14} color={T.muted} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 999, background: T.card, color: T.text, border: `1px solid ${T.red}33`, fontSize: 12 }}>
          <UserCheck size={14} color={T.red} /> Human (makes the final call)
        </span>
      </div>
    </section>
  );
}

function RiskMatrix() {
  return (
    <section style={{ marginBottom: 28 }}>
      <SectionHeader
        eyebrow="03 — Risk Matrix"
        title="What could go wrong, and how much does it matter"
        subtitle="Each risk rated Likelihood × Impact → Priority, with rationale for the call."
      />

      <div style={{ display: "grid", gap: 12 }}>
        {riskRows.map((row) => {
          const style = priorityStyles(row.priority);
          return (
            <div key={row.risk} style={{ ...sectionCardStyle(style.color), display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{row.risk}</div>
                <span style={{ background: style.background, color: style.color, padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
                  {row.priorityLabel}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: T.muted }}>
                <span style={{ display: "inline-flex", alignItems: "center" }}>{levelDot(row.likelihood)}{row.likelihood}</span>
                <span style={{ display: "inline-flex", alignItems: "center" }}>{levelDot(row.impact)}{row.impact}</span>
              </div>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7 }}>{row.rationale}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RaciModel() {
  return (
    <section style={{ marginBottom: 28 }}>
      <SectionHeader
        eyebrow="04 — RACI Model"
        title="For each task, who does what?"
        subtitle="Only one Accountable role per task — accountability cannot be shared."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
        {raciLegend.map((item) => (
          <div key={item.letter} style={{ ...sectionCardStyle(T.dim), padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: item.letter === "A" ? T.red : T.text, marginBottom: 4 }}>{item.letter} — {item.label}</div>
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
        {raciRoles.map((role) => (
          <div key={role.name} style={{ ...sectionCardStyle(T.teal), padding: "12px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{role.name}</div>
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, marginTop: 4 }}>{role.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {raciRows.map((row) => (
          <div key={row.task} style={{ ...sectionCardStyle(T.border), display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{row.task}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
              {[row.aiSystem, row.investigator, row.complianceManager, row.auditor].map((value, index) => (
                <div key={`${row.task}-${index}`} style={{ padding: "10px", borderRadius: 10, background: T.dim, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: T.muted, marginBottom: 4 }}>{raciRoleLabels[index]}</div>
                  <RaciCell value={value} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.teal, marginBottom: 6 }}>What to notice</div>
        <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8, color: T.muted, fontSize: 12, lineHeight: 1.6 }}>
          <li>AI is never the Accountable role; it is always Responsible or Consulted/Informed.</li>
          <li>Humans are accountable for real decisions, including escalations and SAR submission.</li>
          <li>The Investigator owns day-to-day decisions while the Compliance Manager and Auditor provide oversight.</li>
        </ul>
      </div>
    </section>
  );
}

function actorStyle(actor: WorkflowStep["actor"]) {
  if (actor === "ai") {
    return { color: T.blue, background: "rgba(56,189,248,0.12)", icon: <Bot size={14} color={T.blue} />, tag: "AI" };
  }
  if (actor === "human") {
    return { color: T.red, background: "rgba(244,63,94,0.12)", icon: <UserCheck size={14} color={T.red} />, tag: "Human checkpoint" };
  }
  return { color: T.muted, background: "rgba(255,255,255,0.04)", icon: <ClipboardList size={14} color={T.muted} />, tag: "System" };
}

function Workflow() {
  return (
    <section>
      <SectionHeader
        eyebrow="05 — Human-in-the-Loop Workflow"
        title="The exact path a case takes"
        subtitle="AI runs several legs of the relay, but it must hand the baton to a human at three checkpoints."
      />

      <div style={{ display: "grid", gap: 10 }}>
        {workflowSteps.map((step) => {
          const style = actorStyle(step.actor);
          const isCheckpoint = Boolean(step.checkpoint);
          return (
            <div key={step.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: isCheckpoint ? T.red : step.actor === "ai" ? T.blue : T.muted, marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "14px 16px", borderRadius: 14, background: style.background, border: `1px solid ${isCheckpoint ? T.red + "55" : T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, color: T.muted, fontWeight: 800, textTransform: "uppercase" }}>Step {step.step}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 999, background: isCheckpoint ? T.red : step.actor === "ai" ? T.blue : T.dim, color: T.text, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                    {isCheckpoint ? <OctagonAlert size={12} /> : style.icon}
                    {isCheckpoint ? `Checkpoint ${step.checkpoint}` : style.tag}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{step.label}</div>
                {step.branch && <div style={{ marginTop: 8, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{step.branch}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: 2.5, color: T.blue, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: "0 0 6px" }}>{title}</h2>
      <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, maxWidth: 760 }}>{subtitle}</div>
    </div>
  );
}

export default function HumanGovernanceModel() {
  return (
    <div style={{ minHeight: "100%", background: T.bg, color: T.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <header style={{ borderBottom: `1px solid ${T.border}`, background: T.surface, padding: "28px 32px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.blue, fontSize: 11, letterSpacing: 2.5, fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>
            <Landmark size={16} />
            WAVE AI Investigator Co-Pilot
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 10px", letterSpacing: -0.5 }}>Human Governance Model</h1>
          <p style={{ margin: 0, maxWidth: 760, color: T.muted, fontSize: 14, lineHeight: 1.7 }}>
            AI accelerates analysis and drafting; it never holds final authority over an outcome that affects a real person, account, or regulatory filing. Accountability always sits with a named human role.
          </p>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, padding: "7px 12px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.muted }}>
              <Scale size={14} color={T.blue} /> Transaction monitoring / SAR investigations
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, padding: "7px 12px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.muted }}>
              <FileWarning size={14} color={T.red} /> 3 mandatory human checkpoints
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, padding: "7px 12px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.muted }}>
              <CircleAlert size={14} color={T.gold} /> AI is never "Accountable"
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 32px 40px" }}>
        <OpportunityMatrix />
        <VerificationLayer />
        <RiskMatrix />
        <RaciModel />
        <Workflow />
      </main>

      <footer style={{ borderTop: `1px solid ${T.border}`, padding: "16px 32px 32px", color: T.muted, fontSize: 11, textAlign: "center" }}>
        WAVE AI Investigator Co-Pilot — Human Governance Model
      </footer>
    </div>
  );
}
