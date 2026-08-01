import { useState } from "react";

const innovations = [
  {
    id: 1,
    zone: "AI ACTS",
    color: "#00E5C8",
    bgColor: "rgba(0,229,200,0.08)",
    borderColor: "rgba(0,229,200,0.4)",
    icon: "⚡",
    title: "Automated Intelligence",
    subtitle: "AI makes decisions autonomously",
    items: [
      { label: "Transaction Risk Scoring", desc: "Real-time ML scoring of every transaction as it flows through the system" },
      { label: "Alert Prioritization", desc: "AI ranks 5,000+ daily alerts by risk level, cutting investigator queue by 70%" },
      { label: "False Positive Filtering", desc: "Historical pattern learning reduces false positives from 98% to under 60%" },
      { label: "SAR Auto-Drafting", desc: "LLM generates first-draft Suspicious Activity Reports from case data" },
      { label: "Anomaly Detection", desc: "Graph-based detection of fraud rings, mule accounts, and synthetic identities" },
      { label: "Regulatory Change Scanning", desc: "Continuously monitors new regulations and maps gaps to existing controls" },
    ],
  },
  {
    id: 2,
    zone: "AI ASSISTS",
    color: "#A78BFA",
    bgColor: "rgba(167,139,250,0.08)",
    borderColor: "rgba(167,139,250,0.4)",
    icon: "🤝",
    title: "Human-AI Collaboration",
    subtitle: "AI recommends — humans decide",
    items: [
      { label: "Case Investigation Co-Pilot", desc: "AI summarizes evidence, extracts entities, and suggests next steps — investigator approves" },
      { label: "Policy Gap Analysis", desc: "AI identifies compliance gaps and recommends remediation — officer reviews and signs off" },
      { label: "Risk Scoring Explanation", desc: "AI generates human-readable rationale for every risk score — auditors can interrogate" },
      { label: "Timeline Visualization", desc: "AI builds visual case timelines — investigator validates accuracy before submission" },
      { label: "Compliance Readiness Score", desc: "Real-time dashboard scoring — compliance officer reviews and takes action" },
      { label: "Document Intelligence", desc: "AI parses regulatory PDFs and maps to internal policies — human confirms mappings" },
    ],
  },
  {
    id: 3,
    zone: "HUMAN OWNS",
    color: "#F97316",
    bgColor: "rgba(249,115,22,0.08)",
    borderColor: "rgba(249,115,22,0.4)",
    icon: "👤",
    title: "Human Authority",
    subtitle: "Humans make all final decisions",
    items: [
      { label: "SAR Filing Approval", desc: "Only licensed compliance officers can authorize and submit SARs to FinCEN" },
      { label: "Case Escalation to Law Enforcement", desc: "Human judgment required before any referral to external authorities" },
      { label: "Model Override & Justification", desc: "Investigators can override AI decisions — every override is logged with reason" },
      { label: "Regulatory Response Sign-Off", desc: "Executive sign-off required on all regulatory communications and submissions" },
      { label: "AI Model Governance", desc: "Humans own model retraining decisions, bias reviews, and retirement of models" },
      { label: "Customer Relationship Decisions", desc: "Account closures, restrictions, and PEP designations require human authorization" },
    ],
  },
  {
    id: 4,
    zone: "GOVERNANCE LAYER",
    color: "#FACC15",
    bgColor: "rgba(250,204,21,0.08)",
    borderColor: "rgba(250,204,21,0.4)",
    icon: "🛡️",
    title: "Governance & Oversight",
    subtitle: "Cross-cutting accountability framework",
    items: [
      { label: "Immutable Audit Logs", desc: "Every AI action, human override, and approval is timestamped and tamper-proof" },
      { label: "Explainability Dashboards", desc: "Model decisions are traceable, interpretable, and justifiable to regulators" },
      { label: "RACI Accountability Matrix", desc: "Clear ownership of every decision: Responsible, Accountable, Consulted, Informed" },
      { label: "Bias & Drift Monitoring", desc: "Continuous monitoring of model fairness and performance degradation" },
      { label: "Role-Based Access Control", desc: "Zero-trust: every user sees only what their role permits" },
      { label: "Regulatory Evidence Packaging", desc: "Auto-assembled audit-ready documentation with complete chain of custody" },
    ],
  },
];

const opportunities = [
  { area: "Alert Review Time", before: "4–6 hours/alert", after: "45 min/alert", saving: "87% reduction", color: "#00E5C8" },
  { area: "False Positive Rate", before: "95–98%", after: "<60%", saving: "38pts improvement", color: "#A78BFA" },
  { area: "SAR Drafting", before: "3–5 hours", after: "20 min", saving: "93% faster", color: "#F97316" },
  { area: "Regulatory Audit Prep", before: "4–6 weeks", after: "Real-time", saving: "100% continuous", color: "#FACC15" },
  { area: "Investigator Capacity", before: "150 alerts/month", after: "600 alerts/month", saving: "4x throughput", color: "#00E5C8" },
  { area: "Compliance Score Visibility", before: "Quarterly reports", after: "Live dashboard", saving: "Always current", color: "#A78BFA" },
];

export default function AIInnovationMap() {
  const [activeZone, setActiveZone] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [tab, setTab] = useState("map");

  return (
    <div style={{
      minHeight:"100%",
      background: "#080C14",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#E8EDF5",
      padding: "0",
      overflowX: "hidden",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "28px 48px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "linear-gradient(135deg, #00E5C8, #A78BFA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>⚡</div>
            <span style={{ fontSize: 12, letterSpacing: 3, color: "#00E5C8", fontWeight: 700, textTransform: "uppercase" }}>
              WAVE AI · Capstone Deliverable 1
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
            AI Innovation Map
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6B7A99", fontSize: 14 }}>
            Future-State AI Transformation Strategy · Banking & Financial Crime Compliance
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["map", "opportunities"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: tab === t ? "1px solid rgba(0,229,200,0.5)" : "1px solid rgba(255,255,255,0.1)",
              background: tab === t ? "rgba(0,229,200,0.1)" : "transparent",
              color: tab === t ? "#00E5C8" : "#6B7A99",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize", letterSpacing: 0.5,
              transition: "all 0.2s",
            }}>
              {t === "map" ? "Innovation Map" : "ROI Opportunities"}
            </button>
          ))}
        </div>
      </div>

      {tab === "map" && (
        <div style={{ padding: "40px 48px" }}>
          {/* Mission Statement */}
          <div style={{
            background: "rgba(0,229,200,0.05)",
            border: "1px solid rgba(0,229,200,0.2)",
            borderRadius: 12,
            padding: "20px 28px",
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}>
            <div style={{ fontSize: 32 }}>🎯</div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: "#00E5C8", fontWeight: 700, marginBottom: 4 }}>CORE MISSION</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#C8D4E8" }}>
                Design a single AI intelligence layer that continuously monitors financial activity, detects anomalies, prioritizes risk, accelerates investigations, automates documentation, and ensures governance + regulatory readiness —{" "}
                <strong style={{ color: "#00E5C8" }}>while keeping humans in the loop for all consequential decisions.</strong>
              </p>
            </div>
          </div>

          {/* 4-Zone Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 40,
          }}>
            {innovations.map(zone => (
              <div
                key={zone.id}
                onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                style={{
                  background: activeZone === zone.id ? zone.bgColor : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeZone === zone.id ? zone.borderColor : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16,
                  padding: "24px 28px",
                  cursor: "pointer",
                  transition: "all 0.25s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Zone Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>{zone.icon}</span>
                      <span style={{
                        fontSize: 10, letterSpacing: 2.5, fontWeight: 800,
                        color: zone.color, textTransform: "uppercase",
                        background: `rgba(${zone.color === "#00E5C8" ? "0,229,200" : zone.color === "#A78BFA" ? "167,139,250" : zone.color === "#F97316" ? "249,115,22" : "250,204,21"},0.12)`,
                        padding: "3px 10px", borderRadius: 20,
                      }}>
                        {zone.zone}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{zone.title}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7A99" }}>{zone.subtitle}</p>
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    border: `1px solid ${zone.borderColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: zone.color, fontSize: 14, transition: "transform 0.2s",
                    transform: activeZone === zone.id ? "rotate(45deg)" : "none",
                  }}>+</div>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {zone.items.map((item, i) => (
                    <div
                      key={i}
                      onClick={e => { e.stopPropagation(); setActiveItem(activeItem === `${zone.id}-${i}` ? null : `${zone.id}-${i}`); }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: activeItem === `${zone.id}-${i}` ? zone.bgColor : "rgba(255,255,255,0.03)",
                        border: `1px solid ${activeItem === `${zone.id}-${i}` ? zone.borderColor : "rgba(255,255,255,0.05)"}`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: zone.color, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#C8D4E8" }}>{item.label}</span>
                      </div>
                      {activeItem === `${zone.id}-${i}` && (
                        <p style={{ margin: "8px 0 0 14px", fontSize: 12, color: "#8896B0", lineHeight: 1.6 }}>
                          {item.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Count badge */}
                <div style={{
                  position: "absolute", top: 20, right: 60,
                  background: zone.bgColor,
                  border: `1px solid ${zone.borderColor}`,
                  borderRadius: 20,
                  padding: "2px 10px",
                  fontSize: 11, fontWeight: 700, color: zone.color,
                }}>
                  {zone.items.length} capabilities
                </div>
              </div>
            ))}
          </div>

          {/* Instruction */}
          <div style={{
            textAlign: "center",
            color: "#3D4F70",
            fontSize: 12,
            letterSpacing: 1,
          }}>
            CLICK ANY ZONE TO EXPAND · CLICK ANY CAPABILITY TO SEE DETAILS
          </div>

          {/* Flow Diagram */}
          <div style={{
            marginTop: 40,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "28px 36px",
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#6B7A99", fontWeight: 700, marginBottom: 20, textTransform: "uppercase" }}>
              End-to-End Intelligence Flow
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
              {[
                { label: "Transaction\nIntake", color: "#00E5C8", icon: "📥" },
                { label: "AI Risk\nScoring", color: "#00E5C8", icon: "⚡" },
                { label: "Alert\nPrioritization", color: "#00E5C8", icon: "🎯" },
                { label: "Co-Pilot\nInvestigation", color: "#A78BFA", icon: "🤝" },
                { label: "Human\nReview", color: "#F97316", icon: "👤" },
                { label: "SAR\nApproval", color: "#F97316", icon: "✅" },
                { label: "Audit &\nReporting", color: "#FACC15", icon: "🛡️" },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? "1" : "0" }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 8, minWidth: 80,
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `rgba(${step.color === "#00E5C8" ? "0,229,200" : step.color === "#A78BFA" ? "167,139,250" : step.color === "#F97316" ? "249,115,22" : "250,204,21"},0.12)`,
                      border: `1px solid ${step.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                    }}>{step.icon}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 600, color: "#8896B0",
                      textAlign: "center", lineHeight: 1.4,
                      whiteSpace: "pre-line",
                    }}>{step.label}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{
                      flex: 1, height: 1,
                      background: "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                      margin: "0 4px", marginBottom: 20,
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "opportunities" && (
        <div style={{ padding: "40px 48px" }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>AI Opportunity Matrix</h2>
            <p style={{ color: "#6B7A99", margin: 0, fontSize: 14 }}>
              Measurable business value from AI-enabled compliance transformation
            </p>
          </div>

          {/* ROI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
            {opportunities.map((opp, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "22px 24px",
                transition: "border-color 0.2s",
              }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: opp.color, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
                  {opp.area}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#3D4F70", marginBottom: 4 }}>BEFORE AI</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#8896B0" }}>{opp.before}</div>
                  </div>
                  <div style={{ color: "#3D4F70", fontSize: 20, alignSelf: "center" }}>→</div>
                  <div>
                    <div style={{ fontSize: 10, color: "#3D4F70", marginBottom: 4 }}>AFTER AI</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#C8D4E8" }}>{opp.after}</div>
                  </div>
                </div>
                <div style={{
                  background: `rgba(${opp.color === "#00E5C8" ? "0,229,200" : opp.color === "#A78BFA" ? "167,139,250" : opp.color === "#F97316" ? "249,115,22" : "250,204,21"},0.1)`,
                  border: `1px solid ${opp.color}30`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: opp.color,
                  textAlign: "center",
                }}>
                  {opp.saving}
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Recommendations */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "28px 32px",
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#6B7A99", fontWeight: 700, marginBottom: 20, textTransform: "uppercase" }}>
              Strategic Recommendations
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "🚀", title: "Start with the Investigator Co-Pilot", desc: "Highest immediate ROI. Reduces investigator workload by 4x. Demoable in weeks, not months.", color: "#00E5C8" },
                { icon: "🏗️", title: "Build the Governance Layer in Parallel", desc: "Regulators will not approve AI that cannot explain itself. Build explainability and audit trails from day one.", color: "#A78BFA" },
                { icon: "📊", title: "Use Public AML Datasets for Demo", desc: "FinCEN public data + Kaggle AML datasets provide realistic transaction patterns at zero cost.", color: "#F97316" },
                { icon: "🎯", title: "Expand to Regulatory Readiness Engine", desc: "Phase 2 expansion. Once Co-Pilot is running, overlay the real-time compliance scoring dashboard.", color: "#FACC15" },
              ].map((rec, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14,
                  padding: "16px 20px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 12,
                }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{rec.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: rec.color, marginBottom: 6 }}>{rec.title}</div>
                    <div style={{ fontSize: 12, color: "#6B7A99", lineHeight: 1.6 }}>{rec.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Question */}
          <div style={{
            marginTop: 28,
            background: "linear-gradient(135deg, rgba(0,229,200,0.06), rgba(167,139,250,0.06))",
            border: "1px solid rgba(0,229,200,0.2)",
            borderRadius: 14,
            padding: "22px 28px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{ fontSize: 28 }}>❓</div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: "#00E5C8", fontWeight: 700, marginBottom: 6 }}>FINAL EXECUTIVE TEST QUESTION</div>
              <p style={{ margin: 0, fontSize: 14, color: "#C8D4E8", lineHeight: 1.7, fontStyle: "italic" }}>
                "If this AI compliance system were deployed tomorrow at a global bank — would <strong style={{ color: "#00E5C8" }}>executives trust it</strong>, would <strong style={{ color: "#A78BFA" }}>regulators approve it</strong>, and would <strong style={{ color: "#F97316" }}>investigators actually use it</strong>?"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#3D4F70",
        fontSize: 11,
        letterSpacing: 1,
      }}>
        <span>WAVE AI COMPLIANCE COMMAND CENTER · DELIVERABLE 1 OF 5</span>
        <span>WIC × MICROSOFT AI INNOVATOR APPRENTICESHIP · 2026</span>
      </div>
    </div>
  );
}
