import { useState, useMemo } from "react";
import { useFavorites } from "../lib/favorites";

// ─── DESIGN TOKENS (matches architecturedgrms.tsx / compliancedashboard.tsx) ──
const T = {
  bg:       "#06080F",
  surface:  "#0D1117",
  card:     "#111827",
  border:   "rgba(255,255,255,0.07)",
  teal:     "#00E5C8",
  violet:   "#A78BFA",
  orange:   "#F97316",
  gold:     "#FACC15",
  red:      "#F43F5E",
  blue:     "#38BDF8",
  text:     "#E2E8F0",
  muted:    "#64748B",
  dim:      "#1E293B",
};

// ─── DATA ──────────────────────────────────────────────────────────────────
type Prompt = {
  id: string;
  title: string;
  body: string;
  flag?: string; // e.g. "Responsible AI screen"
};

type Category = {
  id: string;
  icon: string;
  label: string;
  sub: string;
  color: string;
  intro: string;
  criteria?: string[];
  prompts: Prompt[];
};

const CATEGORIES: Category[] = [
  {
    id: "discovery",
    icon: "🗺️",
    label: "Workflow Discovery",
    sub: "01 · Map the process",
    color: T.blue,
    intro: "Map a process end-to-end before deciding where AI fits — mirrors the System Context, Container, Component, and Swimlane diagrams.",
    prompts: [
      {
        id: "1.1",
        title: "End-to-end process map",
        body: `Map the end-to-end workflow for [process name, e.g. "transaction monitoring to SAR filing"].
For each step, identify: (1) the actor performing it (system, AI, or specific human role),
(2) the input consumed, (3) the output produced, (4) the average time it currently takes,
and (5) any handoff points where work moves between people or systems.
Present it as a numbered sequence, then flag the 3 steps most prone to delay or error.`,
      },
      {
        id: "1.2",
        title: "Swimlane / actor breakdown",
        body: `Given this workflow: [paste steps or describe process], organize it into swimlanes by actor
(e.g. Source Systems, Front-line Staff, Investigator, Compliance Officer, Auditor, Regulator).
For each lane, list only the actions that actor is responsible for, and mark every point
where a handoff to another lane occurs. Highlight any step where it's unclear who owns it.`,
      },
      {
        id: "1.3",
        title: "System context map",
        body: `Identify every external actor that interacts with [system/process name] — upstream data
sources, internal user roles, customers/counterparties, regulators, and oversight bodies.
For each actor, describe what flows in, what flows out, and whether the interaction is
direct or indirect. Output as an actor table (Actor | Inflow | Outflow | Direct/Indirect).`,
      },
      {
        id: "1.4",
        title: "Pain point and bottleneck discovery",
        body: `Based on this workflow description: [paste], identify where volume, complexity, or manual
effort creates the biggest bottleneck. For each bottleneck, estimate current cost (time,
error rate, or headcount) using any figures provided, and note what a 2x or 10x improvement
would require — more people, better tooling, or automation.`,
      },
      {
        id: "1.5",
        title: "Current-state vs. future-state gap",
        body: `Compare the current-state version of [workflow] against this future-state vision: [paste
description or goals]. List the specific steps that would change, the ones that would
disappear, and the new steps that would need to be introduced. Flag anything in the
future state that has no current-state equivalent — these need the most design work.`,
      },
    ],
  },
  {
    id: "opportunity",
    icon: "⚡",
    label: "AI Opportunity Identification",
    sub: "02 · Find where AI belongs",
    color: T.teal,
    intro: "Sort tasks into AI Acts / AI Assists / Human Owns — the three-zone model from the Innovation Map — and quantify the payoff.",
    criteria: [
      "Reversibility — can an AI error be caught and undone before it causes harm?",
      "Decision quality — does AI make the decision more consistent and evidence-based, or just faster?",
      "Oversight capacity — do reviewing humans have real time and authority, or is review a rubber stamp?",
      "Stakeholder impact — who bears the cost if this goes wrong, and did they have a say?",
    ],
    prompts: [
      {
        id: "2.1",
        title: "Three-zone classification",
        body: `Review this list of tasks in [process/workflow]: [paste task list].
Classify each task into exactly one zone:
- AI ACTS: AI can decide and act autonomously, with human review only on exception
- AI ASSISTS: AI recommends or drafts, a human must approve before anything happens
- HUMAN OWNS: a human must decide, with AI providing supporting information only
For each task, give a one-sentence justification citing the risk, reversibility, and
regulatory sensitivity of getting it wrong.`,
      },
      {
        id: "2.2",
        title: "Opportunity scoring",
        body: `For each task classified as AI Acts or AI Assists in [workflow], estimate:
(1) current effort (time/cost per instance), (2) volume (instances per week/month),
(3) expected effort after AI support, and (4) qualitative complexity of building it
(low/medium/high). Rank tasks by (time saved × volume) ÷ build complexity to
surface the highest-ROI starting point.`,
      },
      {
        id: "2.3",
        title: '"Where would AI help most" scan',
        body: `Here is a description of [team/function]'s day-to-day work: [paste]. Identify the parts
of this work that are: repetitive and rules-based, pattern-detection-heavy, or drafting/
summarization-heavy — these are strong AI candidates. Separately identify the parts that
require judgment calls with legal, financial, or reputational consequences — these should
stay human-owned or human-approved regardless of AI capability.`,
      },
      {
        id: "2.4",
        title: "Before/after opportunity matrix",
        body: `For the following AI opportunities: [list], build a before/after matrix showing the
current-state metric, the target future-state metric, and the resulting improvement
(as a percentage or multiple). Then write one strategic recommendation per opportunity
on how to sequence its rollout (pilot first, parallel-run, or full replacement).`,
      },
      {
        id: "2.5",
        title: "Quick-win vs. platform play",
        body: `Given these AI opportunities: [list], separate them into "quick wins" (deployable in
weeks, narrow scope, immediate ROI) versus "platform investments" (require shared
infrastructure, longer build time, but unlock multiple future use cases). Recommend
a sequencing plan that funds the platform play using early wins from the quick wins.`,
      },
      {
        id: "2.6",
        title: "Responsible efficiency & decision-quality screen",
        flag: "Responsible AI screen",
        body: `For each AI opportunity in [list], answer directly — don't hedge:
1. Does this primarily save time, primarily improve decision quality, or both? Explain.
2. What is the worst plausible consequence of an undetected AI error here, and who
   experiences it (customer, employee, institution, regulator)?
3. Is that consequence reversible within a reasonable window, or could it cause lasting harm?
4. Do the humans in the loop have realistic time and authority to catch an error, or does
   volume/speed pressure make review a formality?
5. Final verdict: proceed as designed, proceed with added safeguards (name them), or
   hold as human-owned. Do not default to "proceed" — say so explicitly only if the
   opportunity earns it.
Present as one row per opportunity so weak opportunities are as visible as strong ones.`,
      },
      {
        id: "2.7",
        title: "Efficiency-vs-judgment tradeoff mapping",
        flag: "Responsible AI screen",
        body: `For [process/function], distinguish tasks where the goal is pure throughput (doing the
same judgment faster/cheaper) from tasks where the goal is better judgment (catching things
humans currently miss, or reducing inconsistency between reviewers). Name which of your
current AI opportunities target throughput, which target judgment quality, and flag any
opportunity marketed as a decision-quality improvement that is actually only a speed gain
in disguise.`,
      },
    ],
  },
  {
    id: "governance",
    icon: "🛡️",
    label: "Governance Modeling",
    sub: "03 · Assign accountability",
    color: T.gold,
    intro: "Build the accountability layer — RACI matrices, verification layers, and decision-boundary documentation — that makes an AI system defensible to executives, auditors, and regulators.",
    prompts: [
      {
        id: "3.1",
        title: "RACI matrix generator",
        body: `For each task in [workflow/opportunity list], assign a RACI value (Responsible,
Accountable, Consulted, Informed, or a combination) across these roles: [AI System,
Investigator/Operator, Manager/Officer, Auditor — adjust roles as needed].
Every task must have exactly one Accountable owner, and that owner must be a human
if the task involves external reporting, legal exposure, or customer-impacting decisions.
Output as a table.`,
      },
      {
        id: "3.2",
        title: "Verification layer design",
        body: `For each task where AI produces an output (draft, score, recommendation, or classification)
in [workflow], specify: what exactly the AI produces, what a human must verify before it's
trusted or acted on, and what evidence of that verification gets logged. The goal is that
no AI output reaches a regulator, customer, or executive without a documented human check.`,
      },
      {
        id: "3.3",
        title: "Decision-boundary map",
        body: `Draw the explicit boundary between AI and human decision-making for [system/process].
For each decision point, state: what the AI is allowed to do unsupervised, what requires
a human to approve before it takes effect, what requires a human to decide entirely
without AI involvement, and what the escalation path is when the AI is uncertain
or its confidence score falls below [threshold].`,
      },
      {
        id: "3.4",
        title: "Explainability requirement spec",
        body: `For [AI capability, e.g. "transaction risk scoring"], define what an explainability
output must include so that an auditor or regulator could reconstruct why the AI reached
its conclusion. Specify: which input features must be surfaced, what confidence/uncertainty
must be shown, whether the explanation must be human-readable prose or structured data,
and how it should be stored for audit retrieval.`,
      },
      {
        id: "3.5",
        title: "Model governance lifecycle",
        body: `Draft a model governance lifecycle for [AI system], covering: who approves a model before
production deployment, how often it is reviewed for bias and performance drift, who has
authority to retrain or retire it, and what triggers an emergency override (e.g. detected
bias, regulatory change, or a spike in false negatives). Assign an owner to each stage.`,
      },
      {
        id: "3.6",
        title: "Override and accountability logging",
        body: `Define the logging requirements for human overrides of AI decisions in [system]. For every
override, specify what must be captured: the AI's original output, the human's final
decision, the stated reason, the timestamp, and the identity of the overriding user.
Explain how this log supports both day-to-day quality review and formal audits.`,
      },
    ],
  },
  {
    id: "risk",
    icon: "⚠️",
    label: "Risk Analysis",
    sub: "04 · Surface and prioritize",
    color: T.red,
    intro: "Surface and prioritize risks by likelihood, impact, and priority — specifically for AI-in-the-loop systems.",
    prompts: [
      {
        id: "4.1",
        title: "AI risk matrix",
        body: `Identify the top risks introduced by deploying AI into [workflow/system]. For each risk,
rate likelihood (Low/Medium/High) and impact (Low/Medium/High), derive a priority
(Low/Medium/High), and write a one-sentence rationale. Include at minimum: model bias/
drift, false negatives on high-risk cases, over-reliance/automation bias by staff,
data privacy exposure, and adversarial manipulation of inputs.`,
      },
      {
        id: "4.2",
        title: "Failure mode walkthrough",
        body: `For [AI capability], walk through what happens if it fails silently — i.e., produces a
confident but wrong output with no obvious error. Identify: how would this failure surface
(if at all), who would be affected, what is the worst-case downstream consequence, and
what control would catch it before real-world harm occurs.`,
      },
      {
        id: "4.3",
        title: "Regulatory exposure check",
        body: `Given [AI capability/decision], list the regulations or regulatory bodies that would have
an interest in how this decision is made (e.g. fair lending, AML/BSA, data privacy, model
risk management guidance). For each, note what documentation or control this AI capability
would need to demonstrate compliance if examined.`,
      },
      {
        id: "4.4",
        title: "Bias and fairness review",
        body: `For [AI model/scoring system], identify what protected or sensitive attributes could
plausibly correlate with its inputs (e.g. geography as a proxy for nationality/ethnicity).
Recommend what fairness metrics should be monitored, what cadence they should be reviewed
at, and who is accountable for acting on a detected disparity.`,
      },
      {
        id: "4.5",
        title: "Automation-bias mitigation",
        body: `Staff using [AI-assisted tool] may over-trust its output ("automation bias"). Propose
three concrete design or process interventions that keep human reviewers actively critical
rather than rubber-stamping AI recommendations — e.g. friction points, disagreement
tracking, or periodic blind review.`,
      },
      {
        id: "4.6",
        title: "Risk-to-control mapping",
        body: `For each risk identified in [risk matrix/list], propose a specific control: a technical
safeguard, a process step, or a governance check. State whether the control is preventive
(stops the risk from occurring) or detective (catches it after the fact), and who owns
operating that control day-to-day.`,
      },
    ],
  },
  {
    id: "automation",
    icon: "🏗️",
    label: "Automation Design",
    sub: "05 · Build the pipeline",
    color: T.violet,
    intro: "Turn an approved AI opportunity into a concrete technical design — mirrors the Container/Component diagrams and BPMN flow. A design isn't finished when it works; it's finished when it works and a skeptical reviewer can see how errors get caught.",
    prompts: [
      {
        id: "5.1",
        title: "Solution architecture sketch",
        body: `Design a solution architecture for [AI capability]. Specify: the data inputs required and
their source systems, the processing/model layer, the output format and destination
(dashboard, alert queue, downstream system), and where human review is inserted in the
pipeline. Note any latency requirements (real-time vs. batch).`,
      },
      {
        id: "5.2",
        title: "BPMN-style process flow",
        body: `Translate this workflow: [paste] into a formal process flow with explicit decision gates.
Mark every gateway where the path branches (e.g. "risk score > threshold?"), every task
that is system-automated vs. human-performed, and every point where the process can be
paused, escalated, or terminated.`,
      },
      {
        id: "5.3",
        title: "Alert/case prioritization logic",
        body: `Design the logic for prioritizing [alerts/cases] using [available signals, e.g. risk score,
transaction amount, jurisdiction]. Specify how raw signals combine into a composite score,
what score bands map to what priority levels, and how the design avoids simply reproducing
existing human bias in historical labels used for training.`,
      },
      {
        id: "5.4",
        title: "Draft-generation template design",
        body: `Design a template for AI-generated [draft type, e.g. SAR, policy gap report, case summary].
Specify required sections, what data populates each section automatically, what must be
left as an explicit placeholder for human input, and what disclaimer or status label
must appear on the document until a human approves it.`,
      },
      {
        id: "5.5",
        title: "Human-in-the-loop checkpoint design",
        body: `For the automation pipeline handling [task], specify exactly where a human-in-the-loop
checkpoint is inserted: what the human sees, what actions they can take (approve, edit,
reject, escalate), what happens by default if they take no action within [timeframe],
and how their decision feeds back into system logs or model retraining data.`,
      },
      {
        id: "5.6",
        title: "Dashboard/UX requirements",
        body: `Define the requirements for a dashboard surfacing [AI capability output] to [role, e.g.
investigator/compliance officer]. Specify what must be visible at a glance, what requires
a drill-down click, how risk/priority should be visually encoded, and what audit or
history information must be one click away.`,
      },
      {
        id: "5.7",
        title: "Responsible-design checklist",
        flag: "Responsible AI screen",
        body: `Review this automation design for [capability]: [paste design]. Check it against:
1. Efficiency gain — is the time/cost saving specific and measurable, or vague?
2. Decision-quality gain — does it make the underlying decision more accurate/consistent,
   or purely faster?
3. Failure visibility — if the AI component fails or drifts, would anyone notice before
   it caused harm, and how?
4. Human control — can a human intervene mid-process, not just approve/reject at the end?
5. Proportionality — is the level of automation (full autonomy vs. draft-and-approve vs.
   advisory-only) matched to the stakes of the decision, per the AI Acts/Assists/Human
   Owns framework?
Flag any gap as a named risk with a proposed fix, not just a pass/fail label.`,
      },
    ],
  },
  {
    id: "agent",
    icon: "🤖",
    label: "AI Agent Development",
    sub: "06 · Build and evaluate",
    color: T.orange,
    intro: "Move from design to a working agent — prompting, tool-use, escalation logic, and evaluation.",
    prompts: [
      {
        id: "6.1",
        title: "Agent role and scope definition",
        body: `Define the scope of an AI agent for [task, e.g. "investigation co-pilot"]. Specify: what
the agent is authorized to do without approval, what actions require human sign-off before
execution, what tools/data sources it can access, and an explicit list of actions it must
never take autonomously (e.g. filing a report, closing an account, contacting a customer).`,
      },
      {
        id: "6.2",
        title: "System prompt draft",
        body: `Write a system prompt for an AI agent that performs [task] for [role/team]. Include:
its purpose, the tone/register expected (e.g. concise, professional, non-alarmist), the
exact output format required, explicit instructions to flag uncertainty rather than guess,
and a reminder that its output is a draft/recommendation requiring human approval.`,
      },
      {
        id: "6.3",
        title: "Tool-use specification",
        body: `List the tools/data sources the agent for [task] needs access to (e.g. transaction
database, policy documents, case management system). For each tool, specify: what the
agent may read, whether it may write/update records, and what constraints prevent
over-broad queries (e.g. rate limits, scoped permissions, PII redaction).`,
      },
      {
        id: "6.4",
        title: "Escalation and refusal logic",
        body: `Define the conditions under which the agent for [task] should escalate to a human rather
than complete the task itself — e.g. confidence below [threshold], conflicting signals,
a request outside its defined scope, or detection of a red-flag pattern. Specify what
message the agent gives the human at that escalation point.`,
      },
      {
        id: "6.5",
        title: "Evaluation and test-case design",
        body: `Design an evaluation suite for the [task] agent. Include: 5 "clear-cut" cases it should
handle confidently, 5 "edge cases" that should trigger escalation rather than a confident
answer, and 3 "adversarial" cases designed to test whether the agent can be manipulated
into skipping its own safeguards. Specify pass/fail criteria for each.`,
      },
      {
        id: "6.6",
        title: "Agent-to-human handoff script",
        body: `Write the exact language the [task] agent should use when handing a case to a human
reviewer. It should state what the agent found, its confidence level, why it's escalating
(if applicable), and what specific decision it needs from the human — without pre-framing
the answer in a way that biases the reviewer's judgment.`,
      },
      {
        id: "6.7",
        title: "Continuous improvement loop",
        body: `Design a feedback loop for the [task] agent: how human overrides and corrections get
logged, how often those logs are reviewed for patterns, what threshold of repeated
correction on a given case type triggers a retraining or prompt-revision cycle, and
who owns approving changes to the agent's behavior once identified.`,
      },
    ],
  },
];

const LIFECYCLE = [
  { stage: "1", label: "Workflow Discovery", feeds: "The task list used in stage 2", color: T.blue },
  { stage: "2", label: "AI Opportunity Identification", feeds: "The zone classification used in stages 3–5", color: T.teal },
  { stage: "3", label: "Governance Modeling", feeds: "The RACI/decision boundaries agents reference in stage 6", color: T.gold },
  { stage: "4", label: "Risk Analysis", feeds: "Controls that constrain the automation design in stage 5", color: T.red },
  { stage: "5", label: "Automation Design", feeds: "The architecture the agent in stage 6 is built against", color: T.violet },
  { stage: "6", label: "AI Agent Development", feeds: "The final deployable capability, monitored via stage 3–4 loops", color: T.orange },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────
function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

// ─── PROMPT CARD ───────────────────────────────────────────────────────────
function PromptCard({
  prompt,
  color,
  isSaved,
  onToggleSave,
}: {
  prompt: Prompt;
  color: string;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access is blocked outside a secure context — say so instead
      // of silently doing nothing.
      setCopied(false);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2600);
    }
  };

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "18px 20px",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 1 }}>{prompt.id}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{prompt.title}</span>
          {prompt.flag && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: T.gold,
                border: `1px solid ${withAlpha(T.gold, "40")}`,
                background: withAlpha(T.gold, "12"),
                borderRadius: 20,
                padding: "2px 9px",
                textTransform: "uppercase",
              }}
            >
              ⚖ {prompt.flag}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={onToggleSave}
            aria-pressed={isSaved}
            title={isSaved ? `Remove ${prompt.id} from saved prompts` : `Save ${prompt.id}`}
            style={{
              fontSize: 11,
              lineHeight: 1,
              color: isSaved ? T.gold : T.muted,
              background: isSaved ? withAlpha(T.gold, "16") : "transparent",
              border: `1px solid ${isSaved ? withAlpha(T.gold, "55") : T.border}`,
              borderRadius: 8,
              padding: "7px 10px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {isSaved ? "★" : "☆"}
          </button>
          <button
            onClick={handleCopy}
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: copyFailed ? T.red : copied ? T.teal : T.muted,
              background: copied ? withAlpha(T.teal, "14") : "transparent",
              border: `1px solid ${copyFailed ? withAlpha(T.red, "50") : copied ? withAlpha(T.teal, "50") : T.border}`,
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {copyFailed ? "Copy blocked" : copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          fontFamily: "'JetBrains Mono','SF Mono',Consolas,monospace",
          fontSize: 12.5,
          lineHeight: 1.65,
          color: "#B7C3D9",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        {prompt.body}
      </pre>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function PromptLibrary() {
  const [active, setActive] = useState("discovery");
  const [query, setQuery] = useState("");
  const [showLifecycle, setShowLifecycle] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  // Saved prompts are persisted by the API, so they survive a reload.
  const { isSaved, toggle, saved, error: savedError } = useFavorites("prompt");

  const cat = CATEGORIES.find((c) => c.id === active)!;

  const filteredPrompts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cat.prompts.filter((p) => {
      const matchQuery =
        !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q) || p.id.includes(q);
      return matchQuery && (!onlySaved || isSaved(p.id));
    });
  }, [cat, query, onlySaved, isSaved]);

  const totalPrompts = CATEGORIES.reduce((sum, c) => sum + c.prompts.length, 0);

  return (
    <div style={{ minHeight:"100%", background: T.bg, color: T.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {/* Top Header */}
      <div
        style={{
          padding: "18px 32px",
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `linear-gradient(135deg,${T.teal},${T.violet})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: T.teal, fontWeight: 800 }}>
              WAVE AI · CAPSTONE DELIVERABLE SUITE
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>Prompt Library</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: T.muted, textAlign: "right", lineHeight: 1.6 }}>
          WIC × Microsoft AI Innovator Apprenticeship · 2026
          <br />
          <span style={{ color: T.teal }}>
            {totalPrompts} Prompts · {CATEGORIES.length} Categories
          </span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100% - 71px)" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 230,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            background: T.surface,
            padding: "16px 12px",
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: 2, color: T.muted, fontWeight: 700, marginBottom: 12, paddingLeft: 4 }}>
            CATEGORIES
          </div>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActive(c.id);
                setQuery("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 10px",
                borderRadius: 8,
                marginBottom: 4,
                background: active === c.id ? withAlpha(c.color, "14") : "transparent",
                border: `1px solid ${active === c.id ? withAlpha(c.color, "50") : "transparent"}`,
                color: active === c.id ? c.color : T.muted,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: active === c.id ? c.color : T.text }}>{c.label}</div>
                <div style={{ fontSize: 9, color: T.muted }}>{c.sub}</div>
              </div>
            </button>
          ))}

          <button
            onClick={() => setShowLifecycle((s) => !s)}
            style={{
              marginTop: 20,
              width: "100%",
              textAlign: "left",
              padding: "12px",
              borderRadius: 10,
              background: withAlpha(T.teal, "08"),
              border: `1px solid ${withAlpha(T.teal, "20")}`,
              cursor: "pointer",
              color: T.teal,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
              {showLifecycle ? "▾" : "▸"} LIFECYCLE MAP
            </div>
            <div style={{ fontSize: 9, color: T.muted }}>How the 6 stages chain together</div>
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {showLifecycle ? (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 9, letterSpacing: 2.5, color: T.teal, fontWeight: 700, marginBottom: 4 }}>
                  ACROSS THE LIBRARY
                </div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Using this library across the WAVE AI lifecycle</h2>
              </div>
              {LIFECYCLE.map((l, i) => (
                <div key={l.stage} style={{ display: "flex", gap: 16, marginBottom: 4 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: withAlpha(l.color, "14"),
                        border: `1px solid ${withAlpha(l.color, "50")}`,
                        color: l.color,
                        fontSize: 11,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {l.stage}
                    </div>
                    {i < LIFECYCLE.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 26, background: T.border, margin: "4px 0" }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 22 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: l.color, marginBottom: 3 }}>{l.label}</div>
                    <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>Feeds → {l.feeds}</div>
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: 8,
                  background: withAlpha(T.gold, "08"),
                  border: `1px solid ${withAlpha(T.gold, "25")}`,
                  borderRadius: 14,
                  padding: "20px 22px",
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: T.gold, fontWeight: 800, marginBottom: 8 }}>
                  ⚖ THE THROUGH-LINE: EFFICIENCY AND JUDGMENT, NOT EFFICIENCY INSTEAD OF JUDGMENT
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#C8D4E8", lineHeight: 1.7 }}>
                  Two prompts exist specifically to stop a fast, cheap automation from sliding through on
                  efficiency alone: <strong style={{ color: T.teal }}>2.6</strong> (Responsible efficiency &
                  decision-quality screen) and <strong style={{ color: T.violet }}>5.7</strong>{" "}
                  (Responsible-design checklist). Run every candidate opportunity through 2.6 before it's
                  approved, and every finished design through 5.7 before it ships. The bar for "this is a good
                  use of AI" should never be speed by itself — it should be speed, plus a clear answer for who
                  catches it when it's wrong, plus evidence that the resulting decision is at least as good as
                  — ideally better than — the one it replaces.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 2.5, color: cat.color, fontWeight: 700 }}>{cat.sub}</div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{cat.label}</h2>
                </div>
              </div>
              <p style={{ margin: "10px 0 18px", fontSize: 13, color: T.muted, lineHeight: 1.7, maxWidth: 760 }}>
                {cat.intro}
              </p>

              {cat.criteria && (
                <div
                  style={{
                    background: withAlpha(cat.color, "08"),
                    border: `1px solid ${withAlpha(cat.color, "25")}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 10, letterSpacing: 1.5, color: cat.color, fontWeight: 800, marginBottom: 10 }}>
                    ⚖ EVERY OPPORTUNITY MUST CLEAR THESE FOUR QUESTIONS
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                    {cat.criteria.map((c) => (
                      <div key={c} style={{ fontSize: 12, color: "#C8D4E8", lineHeight: 1.6 }}>
                        • {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${cat.label.toLowerCase()} prompts…`}
                style={{
                  width: "100%",
                  maxWidth: 420,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "9px 14px",
                  color: T.text,
                  fontSize: 12.5,
                  marginBottom: 20,
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <button
                  onClick={() => setOnlySaved((v) => !v)}
                  aria-pressed={onlySaved}
                  style={{
                    padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                    fontSize: 11, fontWeight: 700,
                    background: onlySaved ? withAlpha(T.gold, "16") : "transparent",
                    border: `1px solid ${onlySaved ? withAlpha(T.gold, "55") : T.border}`,
                    color: onlySaved ? T.gold : T.muted,
                  }}
                >
                  ★ Saved{saved.length ? ` (${saved.length})` : ""}
                </button>
                {savedError && <span style={{ fontSize: 11, color: T.red }}>{savedError}</span>}
              </div>

              {filteredPrompts.length === 0 ? (
                <div style={{ fontSize: 13, color: T.muted, padding: "20px 0" }}>
                  {onlySaved
                    ? "No saved prompts in this category yet. Use the ☆ button on a prompt to save it."
                    : `No prompts match "${query}" in this category.`}
                </div>
              ) : (
                filteredPrompts.map((p) => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    color={cat.color}
                    isSaved={isSaved(p.id)}
                    onToggleSave={() => toggle(p.id, p.title)}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: T.muted,
          fontSize: 10,
          letterSpacing: 1,
        }}
      >
        <span>WAVE AI COMPLIANCE COMMAND CENTER · DELIVERABLE 5 OF 5</span>
        <span>WIC × MICROSOFT AI INNOVATOR APPRENTICESHIP · 2026</span>
      </div>
    </div>
  );
}
