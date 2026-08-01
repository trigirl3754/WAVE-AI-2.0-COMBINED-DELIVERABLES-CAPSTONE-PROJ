import { useEffect, useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
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

const pill = (color, label) => (
  <span style={{
    fontSize:10, letterSpacing:2, fontWeight:700, textTransform:"uppercase",
    padding:"3px 10px", borderRadius:20,
    color, border:`1px solid ${color}40`,
    background:`${color}12`,
  }}>{label}</span>
);

function useViewport() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.innerWidth < 960);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return compact;
}

// ─── DIAGRAM 1: SYSTEM CONTEXT (C4 L1) ───────────────────────────────────────
function SystemContext() {
  const [hover, setHover] = useState(null);
  const compact = useViewport();
  const actors = [
    { id:"src",  label:"Source Systems",         sub:"Core Banking · Payments · KYC/AML\nCards · Lending · CRM · ERP · HR\nEmail · Chat · Call-Center",  color:T.blue,   side:"left",  top:160 },
    { id:"user", label:"Internal Users",          sub:"Investigators · Compliance Officers\nRisk & Audit Teams\nExecutives (CRO · CCO · CIO · CFO)",        color:T.teal,   side:"left",  top:380 },
    { id:"cust", label:"Customers &\nCounterparties", sub:"Generate transactions & KYC data\nconsumed by CIE (indirect)",                                   color:T.muted,  side:"left",  top:580 },
    { id:"reg",  label:"Regulators &\nExternal Bodies", sub:"Receive SAR/STR filings\nRegulatory reports · Audit evidence\nFinCEN · OCC · CFPB · FINRA",    color:T.orange, side:"right", top:280 },
    { id:"gov",  label:"Governance &\nCompliance Bodies", sub:"Model risk oversight\nPolicy approvals · Audit findings",                                    color:T.violet, side:"right", top:500 },
  ];
  const flows = [
    { from:"src",  label:"Transaction streams · KYC data\nAML watchlists · Sanctions · Logs",   color:T.blue   },
    { from:"user", label:"Investigations · Approvals\nCase decisions · Overrides",               color:T.teal   },
    { from:"cust", label:"Transaction initiation\n(indirect via source systems)",                color:T.muted  },
    { from:"reg",  label:"SAR/STR filings · Exam requests\nRegulatory reports · Evidence",      color:T.orange },
    { from:"gov",  label:"Model approvals · Policy directives\nAudit findings",                  color:T.violet },
  ];

  return (
    <div style={{ display:"grid", gap:14 }}>
      <div style={{
        borderRadius:20,
        background:`linear-gradient(135deg,${T.teal}18,${T.violet}18)`,
        border:`2px solid ${T.teal}60`,
        padding:"24px 24px", textAlign:"center",
        boxShadow:`0 0 60px ${T.teal}20`,
      }}>
        <div style={{ fontSize:28, marginBottom:8 }}>⚡</div>
        <div style={{ fontSize:11, letterSpacing:3, color:T.teal, fontWeight:800, marginBottom:6 }}>PRIMARY SYSTEM</div>
        <div style={{ fontSize:16, fontWeight:800, color:T.text, marginBottom:8, lineHeight:1.3 }}>
          Compliance Intelligence Ecosystem (CIE)
        </div>
        <div style={{ fontSize:11, color:T.muted, lineHeight:1.7 }}>
          AI-powered platform for fraud detection, alert prioritization, case acceleration, documentation automation, governance oversight, and human accountability.
        </div>
        <div style={{ marginTop:14, display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center" }}>
          {["FRAUD DETECT","ALERT TRIAGE","CASE MGMT","SAR DRAFT","GOVERNANCE","REG READY"].map((l) => (
            <span key={l} style={{ fontSize:8, color:T.teal, border:`1px solid ${T.teal}30`, borderRadius:10, padding:"2px 7px", letterSpacing:1 }}>{l}</span>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: compact ? "1fr" : "repeat(2, minmax(0,1fr))", gap:12 }}>
        {actors.map((actor) => (
          <div
            key={actor.id}
            onMouseEnter={() => setHover(actor.id)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: hover === actor.id ? `${actor.color}14` : T.card,
              border: `1px solid ${hover === actor.id ? actor.color + "60" : T.border}`,
              borderRadius:14,
              padding:"14px 16px",
              transition:"all 0.2s",
            }}
          >
            <div style={{ fontSize:12, fontWeight:700, color:actor.color, marginBottom:4, whiteSpace:"pre-line" }}>{actor.label}</div>
            <div style={{ fontSize:10, color:T.muted, lineHeight:1.6, whiteSpace:"pre-line" }}>{actor.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center", fontSize:10, color:T.muted }}>
        <span style={{ color:T.blue }}>◆ Source Systems</span>
        <span style={{ color:T.teal }}>◆ Internal Users</span>
        <span style={{ color:T.orange }}>◆ Regulators</span>
        <span style={{ color:T.violet }}>◆ Governance Bodies</span>
      </div>
    </div>
  );
}

// ─── DIAGRAM 2: CONTAINER DIAGRAM (C4 L2) ────────────────────────────────────
function ContainerDiagram() {
  const [sel, setSel] = useState(null);
  const compact = useViewport();
  const containers = [
    { id:"fe",    icon:"🖥️",  label:"Web Frontend",            tech:"React / Next.js",           desc:"Investigator & Compliance Portal. Case & alert workbench, AI summaries, dashboards, governance views. Users: Investigators, Compliance Officers, Risk/Audit, Executives.", color:T.teal,   row:0, col:1 },
    { id:"gw",    icon:"🔀",  label:"API Gateway",              tech:"Azure API Mgmt / Kong",     desc:"Single entry point for UI and integrations. Handles AuthN/AuthZ, rate limiting, request routing, and API versioning.", color:T.blue,   row:1, col:0 },
    { id:"wf",    icon:"⚙️",  label:"Orchestration & Workflow", tech:"Camunda / Temporal",        desc:"Investigation workflows, human-in-the-loop approvals, escalations, SLAs, task routing. Manages the full lifecycle of compliance actions.", color:T.violet, row:1, col:1 },
    { id:"iam",   icon:"🔐",  label:"Identity & Access Mgmt",   tech:"Azure AD / Entra / Okta",   desc:"SSO, RBAC/ABAC enforcement, MFA, conditional access. Controls who can see what data and perform which actions.", color:T.orange, row:1, col:2 },
    { id:"cm",    icon:"📁",  label:"Case Management Service",  tech:"Python/FastAPI or .NET",    desc:"Case lifecycle: create, update, close. Links alerts, transactions, documents, decisions. Stores narratives and evidence references.", color:T.teal,   row:2, col:0 },
    { id:"ar",    icon:"🎯",  label:"Alert & Risk Scoring",     tech:"Python Microservice",       desc:"Aggregates ML model outputs (fraud, AML, graph). Computes composite risk scores. Prioritizes and routes alerts to investigator queues.", color:T.red,    row:2, col:1 },
    { id:"llm",   icon:"🤖",  label:"LLM & RAG Service",        tech:"Azure OpenAI / Claude API", desc:"Case summaries, SAR drafts, policy Q&A. Retrieval-augmented generation over policies, regulations, procedures, and historical cases.", color:T.violet, row:2, col:2 },
    { id:"fraud", icon:"🕵️",  label:"Fraud & Anomaly Models",   tech:"MLflow / Azure ML",         desc:"Real-time and batch scoring of transactions. PyTorch/XGBoost ML models for fraud detection, behavioral anomaly, synthetic identity.", color:T.red,    row:3, col:0 },
    { id:"graph", icon:"🕸️",  label:"Graph Intelligence",       tech:"Neo4j / TigerGraph",        desc:"Entity and relationship graph. Fraud ring detection, network risk scoring, mule account identification, and graph queries for investigators.", color:T.blue,   row:3, col:1 },
    { id:"dp",    icon:"🗄️",  label:"Data Platform",            tech:"Databricks / Snowflake",    desc:"Lakehouse + warehouse. Raw and curated data, feature store for ML models, regulatory and BI reporting. Delta Lake architecture.", color:T.gold,   row:3, col:2 },
    { id:"ing",   icon:"📥",  label:"Integration & Ingestion",  tech:"Kafka / Event Hubs / dbt",  desc:"Streaming and batch ingestion from all source systems. Data quality, normalization, schema enforcement, and lineage tracking.", color:T.blue,   row:4, col:0 },
    { id:"gov",   icon:"🛡️",  label:"Governance & Model Risk",  tech:"MLflow + GRC / ServiceNow", desc:"Model inventory, approvals, performance monitoring. Policy-model-control mappings. Explainability (SHAP/LIME) documentation.", color:T.gold,   row:4, col:1 },
    { id:"audit", icon:"📋",  label:"Audit & Logging Service",  tech:"ELK / OpenSearch / Splunk", desc:"Immutable logs of all user actions, model calls, and data access. Searchable audit trail for regulators and internal audit teams.", color:T.orange, row:4, col:2 },
  ];

  const grid = [[],[],[],[],[]];
  containers.forEach(c=>{ if(!grid[c.row]) grid[c.row]=[]; grid[c.row][c.col]=c; });
  const selC = containers.find(c=>c.id===sel);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns: compact ? "1fr" : "repeat(3, minmax(0, 1fr))", gap:10 }}>
        {containers.map((c) => (
          <div key={c.id} onClick={() => setSel(sel === c.id ? null : c.id)} style={{
            background: sel === c.id ? `${c.color}18` : T.card,
            border: `1px solid ${sel === c.id ? c.color + "80" : T.border}`,
            borderRadius:12,
            padding:"14px 16px",
            cursor:"pointer",
            transition:"all 0.2s",
            minHeight: 90,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:18 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:c.color }}>{c.label}</div>
                <div style={{ fontSize:10, color:T.muted }}>{c.tech}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selC && (
        <div style={{
          marginTop:16, padding:"16px 20px", borderRadius:12,
          background:`${selC.color}10`, border:`1px solid ${selC.color}40`,
        }}>
          <div style={{ fontSize:13, fontWeight:700, color:selC.color, marginBottom:6 }}>
            {selC.icon} {selC.label} — {selC.tech}
          </div>
          <div style={{ fontSize:12, color:T.text, lineHeight:1.7 }}>{selC.desc}</div>
        </div>
      )}
      <div style={{ marginTop:10, fontSize:10, color:T.muted, textAlign:"center" }}>CLICK ANY CONTAINER FOR DETAILS</div>
    </div>
  );
}

// ─── DIAGRAM 3: COMPONENT DIAGRAM (C4 L3) ────────────────────────────────────
function ComponentDiagram() {
  const [flow, setFlow] = useState("alert");
  const flows = {
    alert: {
      label:"A. Alert Generation & Prioritization",
      color:T.red,
      steps:[
        { icon:"📡", label:"Transaction Ingestion",   desc:"Reads events from Kafka/Event Hubs. Normalizes and enriches transactions with KYC, account, and watchlist data." },
        { icon:"🧠", label:"Fraud Scoring",           desc:"Calls ML models (XGBoost, deep nets). Returns base fraud risk score + SHAP explanation features for every transaction." },
        { icon:"🕸️", label:"Graph Risk",              desc:"Queries graph DB: node centrality, known fraud rings, suspicious relationships. Returns network risk score." },
        { icon:"⚖️", label:"Composite Risk Engine",  desc:"Combines: fraud score + graph risk + customer risk + regulatory impact. Outputs: final risk score, priority level, recommended routing." },
        { icon:"🔔", label:"Alert Creation",          desc:"Creates alert records. Links to transactions, customers, accounts. Pushes to Case Management when risk thresholds are met." },
      ],
    },
    investigation: {
      label:"B. Case Investigation & AI Assistance",
      color:T.violet,
      steps:[
        { icon:"📂", label:"Case Aggregator",         desc:"Collects: linked alerts, transactions, KYC data, prior case history, communications, and documents into a unified case object." },
        { icon:"🔄", label:"Evidence Normalizer",     desc:"Converts structured + unstructured data into text snippets, JSON structures, and graph references for LLM consumption." },
        { icon:"✍️", label:"LLM Prompt Builder",      desc:"Builds structured prompts with case facts, policies, risk appetite. Ensures grounding via RAG to prevent hallucination." },
        { icon:"🔍", label:"RAG Retriever",           desc:"Queries vector store for: relevant policies, regulations, similar historical cases, and AML typologies." },
        { icon:"🤖", label:"LLM Inference",           desc:"Generates: case summary, risk narrative, suggested investigative actions, and draft SAR/STR text." },
        { icon:"👤", label:"Investigator Action",     desc:"Allows: accept/modify AI suggestions, add manual notes, approve/decline SAR drafts. Captures justification for every override." },
      ],
    },
    documentation: {
      label:"C. Documentation Automation & Regulatory Reporting",
      color:T.teal,
      steps:[
        { icon:"📋", label:"SAR/STR Template Engine", desc:"Defines schema for regulatory reports. Maps case data fields to FinCEN/regulator-required fields and report formats." },
        { icon:"📝", label:"Narrative Generator",     desc:"Uses LLM to produce: clear structured narratives, typology descriptions, and supporting evidence references." },
        { icon:"✅", label:"Compliance Review",       desc:"Human workflow step: review, edits, and approvals. Logs reviewer identity, role, and timestamp — immutable record." },
        { icon:"📤", label:"Regulatory Export",       desc:"Generates XML/JSON/PDF per regulator format. Integrates with filing channels. Full audit chain of custody preserved." },
      ],
    },
    governance: {
      label:"D. Governance & Human Accountability",
      color:T.gold,
      steps:[
        { icon:"🗂️", label:"Model Registry",          desc:"Stores: model versions, validation results, approval status, owners and reviewers. Tracks full model lifecycle." },
        { icon:"💡", label:"Explainability",           desc:"Computes SHAP/LIME explanations. Exposes human-readable 'why' for each model decision to investigators and auditors." },
        { icon:"🗺️", label:"Policy Mapping",          desc:"Links: controls → models → alerts → regulations. Enables impact analysis when policies or regulations change." },
        { icon:"🔐", label:"RBAC/ABAC Enforcement",   desc:"Checks user role, region, business unit, and case sensitivity. Controls granular access to data and all system actions." },
        { icon:"📜", label:"Audit Trail",             desc:"Logs: every model call, user decision, override and justification. Provides query interface for audit teams and regulators." },
      ],
    },
  };
  const active = flows[flow];

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {Object.entries(flows).map(([k,v])=>(
          <button key={k} onClick={()=>setFlow(k)} style={{
            padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:11,
            fontWeight:600, transition:"all 0.2s",
            background: flow===k ? `${v.color}20` : "transparent",
            border:`1px solid ${flow===k ? v.color+"80" : T.border}`,
            color: flow===k ? v.color : T.muted,
          }}>{v.label.split(". ")[0]}</button>
        ))}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:active.color, marginBottom:16 }}>{active.label}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {active.steps.map((s,i)=>(
          <div key={i} style={{ display:"flex", gap:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:40 }}>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                background:`${active.color}18`,
                border:`1px solid ${active.color}60`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, flexShrink:0,
              }}>{s.icon}</div>
              {i < active.steps.length-1 && (
                <div style={{ width:1, flex:1, minHeight:16, background:`${active.color}30`, margin:"2px 0" }}/>
              )}
            </div>
            <div style={{
              marginLeft:14, marginBottom:i < active.steps.length-1 ? 12 : 0,
              paddingBottom:12,
              borderBottom: i < active.steps.length-1 ? `1px solid ${T.border}` : "none",
              flex:1,
            }}>
              <div style={{ fontSize:13, fontWeight:700, color:active.color, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:12, color:T.muted, lineHeight:1.7 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DIAGRAM 4: END-TO-END WORKFLOW ──────────────────────────────────────────
function E2EWorkflow() {
  const [active, setActive] = useState(null);
  const steps = [
    { id:1, icon:"📥", phase:"INTAKE",       label:"Transaction Intake",        color:T.blue,   owner:"AI",    detail:"5,000+ daily transactions ingested via Kafka/Event Hubs from core banking, payments, cards, and lending systems. Data normalized, enriched with KYC/watchlist data." },
    { id:2, icon:"⚡", phase:"DETECT",       label:"Real-Time Risk Scoring",    color:T.red,    owner:"AI",    detail:"ML models (XGBoost + graph neural nets) score every transaction. SHAP values generated for explainability. Composite risk score computed combining fraud, network, and customer risk." },
    { id:3, icon:"🎯", phase:"PRIORITIZE",   label:"Alert Prioritization",      color:T.orange, owner:"AI",    detail:"AI ranks alerts by risk score, regulatory impact, and investigator queue capacity. False positives filtered via historical pattern learning. Alerts routed to correct team." },
    { id:4, icon:"📂", phase:"INVESTIGATE",  label:"Case Assembly (Co-Pilot)",  color:T.violet, owner:"AI+H",  detail:"Investigator Co-Pilot assembles: all linked transactions, KYC data, prior history, entity graph. RAG retrieves relevant policies. LLM generates case summary and risk narrative." },
    { id:5, icon:"👤", phase:"REVIEW",       label:"Human Investigation",       color:T.teal,   owner:"HUMAN", detail:"Licensed investigator reviews AI-generated case. Can accept, modify, or override any AI suggestion. Every override captured with mandatory justification reason." },
    { id:6, icon:"⚖️", phase:"DECIDE",       label:"Escalation / SAR Decision", color:T.gold,   owner:"HUMAN", detail:"Investigator decides: close alert, request more info, or escalate to SAR filing. Escalation paths: supervisor review, legal, law enforcement referral. All human-authorized." },
    { id:7, icon:"📝", phase:"DOCUMENT",     label:"SAR Auto-Draft",            color:T.violet, owner:"AI+H",  detail:"LLM generates SAR draft from case data, evidence, and typology library. Compliance officer reviews, edits, and approves. Mandatory human sign-off before any filing." },
    { id:8, icon:"✅", phase:"APPROVE",      label:"Compliance Sign-Off",       color:T.orange, owner:"HUMAN", detail:"Only licensed Compliance Officer can authorize SAR submission. Full workflow approval with MFA. Reviewer identity, timestamp, and justification logged immutably." },
    { id:9, icon:"📤", phase:"FILE",         label:"Regulatory Filing",         color:T.blue,   owner:"HUMAN", detail:"SAR/STR filed to FinCEN in required XML/JSON format. Confirmation received and stored. Audit-ready documentation package auto-assembled with chain of custody." },
    { id:10,icon:"🛡️", phase:"AUDIT",        label:"Governance & Audit",        color:T.gold,   owner:"GOV",   detail:"All actions immutably logged: model calls, decisions, overrides, filings. Regulatory readiness score updated. Model drift and bias monitoring triggered. Executive dashboard updated." },
  ];

  const ownerColors = { "AI":T.teal, "AI+H":T.violet, "HUMAN":T.orange, "GOV":T.gold };
  const ownerLabels = { "AI":"AI Automated", "AI+H":"AI Assists / Human Decides", "HUMAN":"Human Authority", "GOV":"Governance Layer" };

  return (
    <div>
      {/* Legend */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {Object.entries(ownerLabels).map(([k,v])=>(
          <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:ownerColors[k] }}/>
            <span style={{ fontSize:10, color:T.muted }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {steps.map((s,i)=>(
          <div key={s.id}>
            <div onClick={()=>setActive(active===s.id?null:s.id)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
              borderRadius:10, cursor:"pointer", transition:"all 0.2s",
              background: active===s.id ? `${s.color}14` : T.card,
              border:`1px solid ${active===s.id ? s.color+"60" : T.border}`,
            }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:`${s.color}18`, border:`1px solid ${s.color}40`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, flexShrink:0,
              }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9, letterSpacing:2, color:T.muted, fontWeight:700 }}>{s.phase}</div>
                <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{s.label}</div>
              </div>
              {pill(ownerColors[s.owner], ownerLabels[s.owner])}
              <div style={{ fontSize:14, color:T.muted, transition:"transform 0.2s", transform:active===s.id?"rotate(90deg)":"none" }}>›</div>
            </div>
            {active===s.id && (
              <div style={{
                margin:"4px 0 4px 48px", padding:"12px 16px", borderRadius:8,
                background:`${s.color}08`, border:`1px solid ${s.color}30`,
                fontSize:12, color:T.muted, lineHeight:1.7,
              }}>{s.detail}</div>
            )}
            {i < steps.length-1 && (
              <div style={{ display:"flex", justifyContent:"center", margin:"2px 0" }}>
                <div style={{ width:1, height:8, background:`${s.color}40` }}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DIAGRAM 5: SWIMLANE DIAGRAM (Transaction → SAR) ─────────────────────────
function SwimlaneDiagram() {
  const compact = useViewport();
  const lanes = [
    {
      id:"source", label:"Source Systems", color:T.blue,
      steps:[
        { col:0, label:"Transaction Event", sub:"5,000+ daily via Kafka" },
        { col:1, label:"KYC / Watchlist", sub:"Sanctions · PEP screens" },
      ]
    },
    {
      id:"ai", label:"AI Engine (Automated)", color:T.teal,
      steps:[
        { col:2, label:"Risk Scoring", sub:"ML + Graph composite" },
        { col:3, label:"Alert Generated", sub:"If score > threshold" },
        { col:4, label:"Case Assembly", sub:"RAG + LLM summary" },
        { col:7, label:"SAR Draft", sub:"LLM first draft" },
      ]
    },
    {
      id:"inv", label:"Investigator (Human)", color:T.orange,
      steps:[
        { col:4, label:"Review Alert", sub:"AI-assisted workbench" },
        { col:5, label:"Investigate", sub:"Accept / modify / override" },
        { col:6, label:"Escalation Decision", sub:"Close / escalate / SAR" },
        { col:8, label:"Review & Edit SAR", sub:"Human edits AI draft" },
      ]
    },
    {
      id:"comp", label:"Compliance Officer (Human)", color:T.violet,
      steps:[
        { col:9, label:"Final SAR Approval", sub:"MFA sign-off required" },
        { col:10, label:"File to FinCEN", sub:"XML/JSON submission" },
      ]
    },
    {
      id:"gov", label:"Governance & Audit", color:T.gold,
      steps:[
        { col:0, label:"Log Ingestion", sub:"All events logged" },
        { col:5, label:"Override Captured", sub:"Justification required" },
        { col:9, label:"Approval Logged", sub:"Immutable audit trail" },
        { col:10, label:"Reg. Evidence Pkg", sub:"Audit-ready export" },
      ]
    },
  ];

  const COLS = 11;
  const COL_W = compact ? 70 : 86;
  const LABEL_W = compact ? 120 : 152;

  return (
    <div style={{ overflowX:"auto", width:"100%" }}>
      <div style={{ minWidth: COLS * COL_W + LABEL_W }}>
        {/* Column headers */}
        <div style={{ display:"flex", marginLeft:LABEL_W, marginBottom:8 }}>
          {Array.from({length:COLS},(_,i)=>(
            <div key={i} style={{
              width:COL_W, textAlign:"center",
              fontSize:9, color:T.muted, letterSpacing:1, fontWeight:700,
            }}>STEP {i+1}</div>
          ))}
        </div>

        {/* Lanes */}
        {lanes.map(lane=>(
          <div key={lane.id} style={{ display:"flex", marginBottom:8, alignItems:"stretch" }}>
            {/* Lane label */}
            <div style={{
              width:LABEL_W, flexShrink:0, padding:"0 12px",
              background:`${lane.color}10`, border:`1px solid ${lane.color}30`,
              borderRadius:"10px 0 0 10px",
              display:"flex", alignItems:"center",
            }}>
              <span style={{ fontSize:11, fontWeight:700, color:lane.color, lineHeight:1.3 }}>{lane.label}</span>
            </div>

            {/* Cells */}
            <div style={{
              display:"grid", gridTemplateColumns:`repeat(${COLS},${COL_W}px)`,
              background:T.card, border:`1px solid ${T.border}`,
              borderLeft:"none", borderRadius:"0 10px 10px 0",
              position:"relative", minHeight:64,
            }}>
              {/* Grid lines */}
              {Array.from({length:COLS-1},(_,i)=>(
                <div key={i} style={{
                  position:"absolute", left:(i+1)*COL_W, top:0, bottom:0,
                  width:1, background:T.border,
                }}/>
              ))}

              {/* Steps */}
              {lane.steps.map((s,si)=>(
                <div key={si} style={{
                  position:"absolute",
                  left: s.col * COL_W + 4,
                  top:8, width:COL_W-8,
                  background:`${lane.color}18`,
                  border:`1px solid ${lane.color}50`,
                  borderRadius:8, padding:"6px 8px", textAlign:"center",
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:lane.color, lineHeight:1.3 }}>{s.label}</div>
                  <div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Flow arrow */}
        <div style={{
          marginLeft:LABEL_W, display:"flex", alignItems:"center", marginTop:8,
        }}>
          <div style={{ flex:1, height:2, background:`linear-gradient(90deg,${T.teal},${T.violet},${T.orange})`, borderRadius:2 }}/>
          <div style={{ fontSize:10, color:T.muted, marginLeft:8 }}>TRANSACTION FLOW →</div>
        </div>
      </div>
    </div>
  );
}

// ─── DIAGRAM 6: BPMN FLOW ────────────────────────────────────────────────────
function BPMNDiagram() {
  const [hover, setHover] = useState(null);
  const nodes = [
    { id:"start",    x:20,  y:180, type:"event",   label:"Transaction\nReceived",    color:T.teal,   shape:"circle" },
    { id:"ingest",   x:120, y:165, type:"task",     label:"Ingest &\nEnrich Data",    color:T.blue,   shape:"rect", owner:"AI" },
    { id:"score",    x:240, y:165, type:"task",     label:"Risk Score\n(ML + Graph)", color:T.red,    shape:"rect", owner:"AI" },
    { id:"gw1",      x:365, y:180, type:"gateway",  label:"Risk\n> Threshold?",       color:T.gold,   shape:"diamond" },
    { id:"close",    x:370, y:280, type:"task",     label:"Auto-Close\nLow Risk",     color:T.muted,  shape:"rect", owner:"AI" },
    { id:"alert",    x:450, y:165, type:"task",     label:"Create &\nRoute Alert",    color:T.orange, shape:"rect", owner:"AI" },
    { id:"assemble", x:560, y:165, type:"task",     label:"Case\nAssembly (LLM)",     color:T.violet, shape:"rect", owner:"AI" },
    { id:"review",   x:670, y:165, type:"task",     label:"Investigator\nReview",     color:T.orange, shape:"rect", owner:"HUMAN" },
    { id:"gw2",      x:785, y:180, type:"gateway",  label:"SAR\nRequired?",           color:T.gold,   shape:"diamond" },
    { id:"nosar",    x:790, y:280, type:"task",     label:"Close Case\n+ Document",   color:T.muted,  shape:"rect", owner:"HUMAN" },
    { id:"draft",    x:880, y:165, type:"task",     label:"LLM SAR\nDraft",           color:T.violet, shape:"rect", owner:"AI" },
    { id:"approve",  x:990, y:165, type:"task",     label:"Compliance\nApproval",     color:T.orange, shape:"rect", owner:"HUMAN" },
    { id:"file",     x:1095,y:165, type:"task",     label:"File SAR\nto FinCEN",      color:T.teal,   shape:"rect", owner:"HUMAN" },
    { id:"audit",    x:1195,y:165, type:"task",     label:"Audit Log\n& Evidence",    color:T.gold,   shape:"rect", owner:"GOV" },
    { id:"end",      x:1310,y:180, type:"event",    label:"Process\nComplete",        color:T.teal,   shape:"circle-end" },
  ];

  const ownerColor = { AI:T.teal, "HUMAN":T.orange, GOV:T.gold };

  return (
    <div style={{ overflowX:"auto", width:"100%" }}>
      <svg viewBox="0 0 1380 340" style={{ display:"block", width:"100%", maxWidth:1380, height:"auto" }}>
        {/* Pool background */}
        <rect x={10} y={10} width={1360} height={310} rx={12}
          fill={T.card} stroke={T.border} strokeWidth={1}/>
        <text x={26} y={165} fill={T.muted} fontSize={10} fontWeight={700}
          writingMode="vertical-lr" textAnchor="middle" letterSpacing={2}>
          COMPLIANCE PROCESS
        </text>

        {/* Connections */}
        {[
          ["start","ingest"], ["ingest","score"], ["score","gw1"],
          ["gw1","alert"], ["gw1","close"],
          ["alert","assemble"], ["assemble","review"], ["review","gw2"],
          ["gw2","draft"], ["gw2","nosar"],
          ["draft","approve"], ["approve","file"], ["file","audit"], ["audit","end"],
        ].map(([from,to],i)=>{
          const f = nodes.find(n=>n.id===from);
          const t = nodes.find(n=>n.id===to);
          if(!f||!t) return null;
          const fx = f.x + (f.shape==="diamond"?20:f.shape==="circle"||f.shape==="circle-end"?16:55);
          const fy = f.y + (f.shape==="diamond"?20:f.shape==="circle"||f.shape==="circle-end"?16:18);
          const tx = t.x + (t.shape==="diamond"?0:t.shape==="circle"||t.shape==="circle-end"?0:0);
          const ty = t.y + (t.shape==="diamond"?20:t.shape==="circle"||t.shape==="circle-end"?16:18);
          const isDown = fy < ty - 10;
          return (
            <g key={i}>
              {isDown
                ? <polyline points={`${fx},${fy} ${fx},${ty} ${tx},${ty}`}
                    fill="none" stroke={T.border} strokeWidth={1.5}
                    markerEnd="url(#arrow)"/>
                : <line x1={fx} y1={fy} x2={tx} y2={ty}
                    stroke={T.border} strokeWidth={1.5}
                    markerEnd="url(#arrow)"/>
              }
            </g>
          );
        })}

        <defs>
          <marker id="arrow" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={T.muted}/>
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map(n=>{
          const oc = n.owner ? ownerColor[n.owner] : n.color;
          if(n.shape==="circle"||n.shape==="circle-end") return (
            <g key={n.id} onMouseEnter={()=>setHover(n.id)} onMouseLeave={()=>setHover(null)}>
              <circle cx={n.x+16} cy={n.y+16} r={14}
                fill={`${n.color}18`}
                stroke={n.shape==="circle-end"?n.color:n.color}
                strokeWidth={n.shape==="circle-end"?3:1.5}/>
              <text x={n.x+16} y={n.y+38} textAnchor="middle" fill={n.color}
                fontSize={8} fontWeight={700} whiteSpace="pre">
                {n.label.split("\n").map((l,li)=>(
                  <tspan key={li} x={n.x+16} dy={li===0?0:10}>{l}</tspan>
                ))}
              </text>
            </g>
          );
          if(n.shape==="diamond") return (
            <g key={n.id} onMouseEnter={()=>setHover(n.id)} onMouseLeave={()=>setHover(null)}>
              <polygon
                points={`${n.x+20},${n.y} ${n.x+40},${n.y+20} ${n.x+20},${n.y+40} ${n.x},${n.y+20}`}
                fill={`${n.color}18`} stroke={n.color} strokeWidth={1.5}/>
              <text x={n.x+20} y={n.y+56} textAnchor="middle" fill={n.color} fontSize={8} fontWeight={700}>
                {n.label.split("\n").map((l,li)=>(
                  <tspan key={li} x={n.x+20} dy={li===0?0:10}>{l}</tspan>
                ))}
              </text>
            </g>
          );
          return (
            <g key={n.id} onMouseEnter={()=>setHover(n.id)} onMouseLeave={()=>setHover(null)}>
              <rect x={n.x} y={n.y} width={100} height={36} rx={6}
                fill={hover===n.id ? `${oc}28` : `${oc}14`}
                stroke={hover===n.id ? oc : `${oc}60`} strokeWidth={1.5}/>
              {n.owner && (
                <rect x={n.x} y={n.y} width={8} height={36} rx={3}
                  fill={oc} opacity={0.7}/>
              )}
              <text x={n.x+54} y={n.y+13} textAnchor="middle" fill={oc}
                fontSize={8.5} fontWeight={700}>
                {n.label.split("\n").map((l,li)=>(
                  <tspan key={li} x={n.x+54} dy={li===0?0:11}>{l}</tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Labels on branches */}
        <text x={400} y={245} fill={T.muted} fontSize={8}>No</text>
        <text x={395} y={160} fill={T.muted} fontSize={8}>Yes</text>
        <text x={808} y={248} fill={T.muted} fontSize={8}>No</text>
        <text x={805} y={160} fill={T.muted} fontSize={8}>Yes</text>
      </svg>

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
        {[["AI Automated",T.teal],["Human Authority",T.orange],["Governance",T.gold],["Gateway",T.gold]].map(([l,c])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, background:c, borderRadius:2 }}/>
            <span style={{ fontSize:10, color:T.muted }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DIAGRAM 7: AI vs HUMAN DECISION BOUNDARY MAP ────────────────────────────
function DecisionBoundary() {
  const [sel, setSel] = useState(null);
  const items = [
    // AI FULLY OWNS
    { zone:"AI", label:"Transaction Risk Scoring",        confidence:"High", risk:"Low",  detail:"Every transaction scored by ML models in <100ms. No human bottleneck. Full SHAP explainability.", color:T.teal },
    { zone:"AI", label:"Alert Prioritization & Routing",  confidence:"High", risk:"Low",  detail:"AI ranks and routes 5,000+ daily alerts. Reduces investigator queue by 70%. Human reviews prioritization logic quarterly.", color:T.teal },
    { zone:"AI", label:"False Positive Filtering",        confidence:"High", risk:"Low",  detail:"Historical pattern matching filters low-risk alerts. Reduces false positives from 98% to <60%. Audited monthly.", color:T.teal },
    { zone:"AI", label:"Case Data Aggregation",           confidence:"High", risk:"Low",  detail:"AI assembles all case artifacts: transactions, KYC, history, documents. Purely data collection — no decision made.", color:T.teal },
    { zone:"AI", label:"SAR First Draft Generation",      confidence:"Med",  risk:"Med",  detail:"LLM produces SAR draft. Mandatory human review and edit before any submission. AI draft is starting point only.", color:T.teal },
    { zone:"AI", label:"Regulatory Change Monitoring",    confidence:"High", risk:"Low",  detail:"Continuously scans regulatory updates. Flags new requirements for human compliance officer review.", color:T.teal },
    // SHARED
    { zone:"SHARED", label:"Investigation Recommendations", confidence:"Med", risk:"Med", detail:"AI suggests next investigative steps. Investigator decides which to follow. Override with justification always available.", color:T.violet },
    { zone:"SHARED", label:"Risk Narrative Generation",    confidence:"Med",  risk:"Med",  detail:"LLM generates risk narrative from case data. Investigator must validate accuracy before it enters case record.", color:T.violet },
    { zone:"SHARED", label:"Compliance Gap Analysis",      confidence:"Med",  risk:"Med",  detail:"AI identifies policy gaps. Compliance officer reviews, prioritizes, and authorizes remediation actions.", color:T.violet },
    { zone:"SHARED", label:"Typology Pattern Detection",   confidence:"Med",  risk:"High", detail:"AI flags emerging fraud typologies. Human expert validates pattern before new detection rule is deployed.", color:T.violet },
    // HUMAN OWNS
    { zone:"HUMAN", label:"SAR Filing Authorization",      confidence:"N/A",  risk:"High", detail:"ONLY licensed Compliance Officer can authorize and submit SARs to FinCEN. No AI override possible.", color:T.orange },
    { zone:"HUMAN", label:"Law Enforcement Referral",      confidence:"N/A",  risk:"High", detail:"Any referral to law enforcement requires senior human authorization with documented justification.", color:T.orange },
    { zone:"HUMAN", label:"Account Restriction / Closure", confidence:"N/A",  risk:"High", detail:"Customer relationship decisions require human judgment. AI may flag — human must authorize.", color:T.orange },
    { zone:"HUMAN", label:"AI Model Override",             confidence:"N/A",  risk:"High", detail:"Investigators can override any AI decision. Override logged immutably with reason. Triggers model review if frequent.", color:T.orange },
    { zone:"HUMAN", label:"Model Retirement / Retraining", confidence:"N/A",  risk:"High", detail:"Governance committee authorizes all model lifecycle decisions. AI cannot modify itself.", color:T.orange },
    { zone:"HUMAN", label:"Regulatory Response Sign-Off",  confidence:"N/A",  risk:"High", detail:"Executive sign-off required on all regulatory communications. No automated regulatory submissions.", color:T.orange },
  ];

  const zones = [
    { id:"AI",     label:"AI Autonomous Zone",    color:T.teal,   desc:"AI acts independently. Full explainability required. Human reviews outputs periodically." },
    { id:"SHARED", label:"Human-AI Collaboration",color:T.violet, desc:"AI recommends. Human decides. Every decision captured with reasoning." },
    { id:"HUMAN",  label:"Human Authority Zone",  color:T.orange, desc:"Humans make ALL decisions. AI may provide information only. No AI authorization." },
  ];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:20 }}>
        {zones.map(z=>(
          <div key={z.id} style={{
            padding:"16px", borderRadius:12,
            background:`${z.color}10`, border:`1px solid ${z.color}40`,
          }}>
            <div style={{ fontSize:11, fontWeight:800, color:z.color, letterSpacing:1, marginBottom:6, textTransform:"uppercase" }}>{z.label}</div>
            <div style={{ fontSize:11, color:T.muted, lineHeight:1.6 }}>{z.desc}</div>
            <div style={{ marginTop:10, fontSize:10, color:z.color, fontWeight:700 }}>
              {items.filter(i=>i.zone===z.id).length} capabilities
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:8 }}>
        {zones.map(z=>(
          <div key={z.id} style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {items.filter(i=>i.zone===z.id).map((item,idx)=>(
              <div key={idx} onClick={()=>setSel(sel===`${z.id}-${idx}` ? null : `${z.id}-${idx}`)} style={{
                padding:"10px 12px", borderRadius:10, cursor:"pointer",
                background: sel===`${z.id}-${idx}` ? `${item.color}18` : T.card,
                border:`1px solid ${sel===`${z.id}-${idx}` ? item.color+"60" : T.border}`,
                transition:"all 0.2s",
              }}>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:item.color, marginTop:4, flexShrink:0 }}/>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{item.label}</div>
                    {sel===`${z.id}-${idx}` && (
                      <div style={{ fontSize:11, color:T.muted, marginTop:6, lineHeight:1.6 }}>{item.detail}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, fontSize:10, color:T.muted, textAlign:"center" }}>CLICK ANY ITEM TO SEE DECISION RATIONALE</div>
    </div>
  );
}

// ─── DIAGRAM 8: SOLUTION ARCHITECTURE ────────────────────────────────────────
function SolutionArchitecture() {
  const layers = [
    {
      id:"users", label:"USER EXPERIENCE LAYER", color:T.teal,
      items:[
        { icon:"🕵️", label:"Investigator Workbench",   sub:"Case dashboard · Risk scoring · Evidence viewer · AI insights · Timeline" },
        { icon:"👔", label:"Compliance Officer Console",sub:"Governance dashboards · Regulatory readiness · Policy intelligence" },
        { icon:"📊", label:"Executive Risk Cockpit",    sub:"Enterprise risk heatmaps · Fraud trends · Compliance KPIs · Forecasting" },
        { icon:"🔍", label:"Audit & Review Portal",    sub:"Model decisions · Override history · Evidence packages · Audit logs" },
      ]
    },
    {
      id:"api",   label:"API GATEWAY & ORCHESTRATION", color:T.blue,
      items:[
        { icon:"🔀", label:"API Gateway",              sub:"AuthN/AuthZ · Rate limiting · Routing · Versioning" },
        { icon:"⚙️", label:"Workflow Orchestration",   sub:"Camunda/Temporal · Human-in-loop · SLA management · Escalations" },
        { icon:"🔐", label:"Identity & Access Mgmt",  sub:"Azure AD · RBAC/ABAC · MFA · Zero-trust" },
      ]
    },
    {
      id:"intel", label:"INTELLIGENCE LAYER (AI + ML)", color:T.violet,
      items:[
        { icon:"🤖", label:"LLM & RAG Service",        sub:"Azure OpenAI / Claude · Vector DB · Case summaries · SAR drafts · Policy Q&A" },
        { icon:"🕵️", label:"Fraud & Anomaly Models",  sub:"XGBoost · Deep nets · MLflow · Behavioral patterns · Synthetic identity" },
        { icon:"🕸️", label:"Graph Intelligence",       sub:"Neo4j · Fraud rings · Mule accounts · Network risk scoring" },
        { icon:"🎯", label:"Alert & Risk Scoring",     sub:"Composite scoring · False positive filtering · Queue routing" },
      ]
    },
    {
      id:"svc",   label:"CORE SERVICES LAYER", color:T.orange,
      items:[
        { icon:"📁", label:"Case Management",          sub:"Lifecycle · Evidence · Decisions · Narratives · Links" },
        { icon:"🛡️", label:"Governance & Model Risk", sub:"MLflow registry · GRC integration · Explainability · Policy mapping" },
        { icon:"📋", label:"Audit & Logging",          sub:"ELK/Splunk · Immutable logs · Audit trail · Compliance evidence" },
        { icon:"📊", label:"Reporting & Analytics",    sub:"Power BI/Tableau · Operational dashboards · Regulatory metrics" },
      ]
    },
    {
      id:"data",  label:"DATA PLATFORM LAYER", color:T.gold,
      items:[
        { icon:"🗄️", label:"Data Lakehouse",           sub:"Delta Lake / Databricks · Raw + curated · Feature store · Lineage" },
        { icon:"📥", label:"Integration & Ingestion",  sub:"Kafka / Event Hubs · dbt · Airflow · ETL pipelines · Data quality" },
        { icon:"🔒", label:"Security & Compliance",    sub:"Encryption · Tokenization · Key mgmt · Immutable logs · PII masking" },
        { icon:"☸️", label:"Infrastructure & DevOps",  sub:"AKS / Kubernetes · CI/CD · Azure Monitor · Blue-green deployment" },
      ]
    },
    {
      id:"src",   label:"SOURCE SYSTEMS", color:T.blue,
      items:[
        { icon:"🏦", label:"Core Banking & Payments",  sub:"Transaction streams · Account data · Payment rails" },
        { icon:"🪪", label:"KYC / AML Systems",        sub:"Watchlists · Sanctions · PEP databases · Identity verification" },
        { icon:"💬", label:"Communications",           sub:"Email · Chat · Call-center transcripts · Document stores" },
        { icon:"🏢", label:"Enterprise Systems",       sub:"CRM · ERP · HR · Access management · Internal logs" },
      ]
    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {layers.map(layer=>(
        <div key={layer.id}>
          <div style={{
            fontSize:9, letterSpacing:2.5, fontWeight:800, color:layer.color,
            textTransform:"uppercase", marginBottom:6, paddingLeft:4,
          }}>{layer.label}</div>
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:8,
          }}>
            {layer.items.map((item,i)=>(
              <div key={i} style={{
                padding:"12px 14px", borderRadius:10,
                background:T.card, border:`1px solid ${T.border}`,
                transition:"border-color 0.2s",
              }}>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:layer.color, marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:10, color:T.muted, lineHeight:1.5 }}>{item.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Down arrows between layers */}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const DIAGRAMS = [
  { id:"sysctx",   label:"System Context",         icon:"🌐", sub:"C4 Level 1",  comp:SystemContext   },
  { id:"container",label:"Container Diagram",      icon:"📦", sub:"C4 Level 2",  comp:ContainerDiagram},
  { id:"component",label:"Component Diagram",      icon:"⚙️", sub:"C4 Level 3",  comp:ComponentDiagram},
  { id:"e2e",      label:"End-to-End Workflow",    icon:"🔄", sub:"Full Flow",   comp:E2EWorkflow     },
  { id:"swimlane", label:"Swimlane Diagram",        icon:"🏊", sub:"Tx → SAR",   comp:SwimlaneDiagram },
  { id:"bpmn",     label:"BPMN Flow",              icon:"📐", sub:"Process Model",comp:BPMNDiagram    },
  { id:"boundary", label:"AI vs Human Boundary",   icon:"⚖️", sub:"Decision Map",comp:DecisionBoundary},
  { id:"arch",     label:"Solution Architecture",  icon:"🏗️", sub:"Full Stack",  comp:SolutionArchitecture},
];

export default function ArchitectureDiagrams() {
  const [active, setActive] = useState("sysctx");
  const compact = useViewport();
  const D = DIAGRAMS.find(d=>d.id===active);
  const Comp = D.comp;

  return (
    <div style={{ minHeight:"100%", background:T.bg, color:T.text, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* Top Header */}
      <div style={{
        padding: compact ? "18px 20px" : "18px 32px", borderBottom:`1px solid ${T.border}`,
        background:T.surface,
        display:"flex", flexDirection: compact ? "column" : "row", alignItems: compact ? "flex-start" : "center", justifyContent:"space-between",
        gap: compact ? 12 : 0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:34, height:34, borderRadius:8,
            background:`linear-gradient(135deg,${T.teal},${T.violet})`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
          }}>⚡</div>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:T.teal, fontWeight:800 }}>WAVE AI · CAPSTONE DELIVERABLE SUITE</div>
            <div style={{ fontSize:16, fontWeight:800, letterSpacing:-0.3 }}>Compliance Intelligence Ecosystem — Architecture Diagrams</div>
          </div>
        </div>
        <div style={{ fontSize:10, color:T.muted, textAlign: compact ? "left" : "right", lineHeight:1.6 }}>
          WIC × Microsoft AI Innovator Apprenticeship · 2026<br/>
          <span style={{ color:T.teal }}>8 Diagrams · All Deliverables Covered</span>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection: compact ? "column" : "row", minHeight:"calc(100vh - 120px)" }}>

        {/* Sidebar */}
        <div style={{
          width: compact ? "100%" : 200, flexShrink:0, borderRight: compact ? "none" : `1px solid ${T.border}`,
          borderBottom: compact ? `1px solid ${T.border}` : "none",
          background:T.surface, padding:"16px 12px",
          overflowY:"auto",
        }}>
          <div style={{ fontSize:9, letterSpacing:2, color:T.muted, fontWeight:700, marginBottom:12, paddingLeft:4 }}>DIAGRAMS</div>
          {DIAGRAMS.map((d,i)=>(
            <button key={d.id} onClick={()=>setActive(d.id)} style={{
              display:"flex", alignItems:"center", gap:10, width:"100%",
              padding:"9px 10px", borderRadius:8, marginBottom:4,
              background: active===d.id ? `${T.teal}14` : "transparent",
              border:`1px solid ${active===d.id ? T.teal+"50" : "transparent"}`,
              color: active===d.id ? T.teal : T.muted,
              cursor:"pointer", textAlign:"left", transition:"all 0.15s",
            }}>
              <span style={{ fontSize:16 }}>{d.icon}</span>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:active===d.id ? T.teal : T.text }}>{d.label}</div>
                <div style={{ fontSize:9, color:T.muted }}>{d.sub}</div>
              </div>
            </button>
          ))}

          <div style={{ marginTop:20, padding:"12px", borderRadius:10, background:`${T.teal}08`, border:`1px solid ${T.teal}20` }}>
            <div style={{ fontSize:9, color:T.teal, fontWeight:700, letterSpacing:1, marginBottom:6 }}>DELIVERABLES COVERED</div>
            {["D1 Innovation Map","D2 Workflow Architecture","D3 Governance Model","D4 Demo Architecture","D5 Prompt Library"].map(d=>(
              <div key={d} style={{ fontSize:9, color:T.muted, marginBottom:3 }}>✓ {d}</div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex:1, overflowY:"auto", padding: compact ? "20px 16px 32px" : "28px 32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <span style={{ fontSize:28 }}>{D.icon}</span>
            <div>
              <div style={{ fontSize:9, letterSpacing:2.5, color:T.teal, fontWeight:700 }}>{D.sub}</div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>{D.label}</h2>
            </div>
          </div>
          <Comp/>
        </div>
      </div>
    </div>
  );
}
