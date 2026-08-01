import { useState } from "react";
import { useFavorites } from "../lib/favorites";

const CATEGORIES = [
  "All",
  "AI & Technology",
  "Compliance & Regulation",
  "Financial Crime",
  "Architecture & Systems",
  "Project & Team",
  "Governance & Risk",
];

const TERMS = [
  // ── AI & TECHNOLOGY ──────────────────────────────────────────────────────
  {
    term: "AI",
    full: "Artificial Intelligence",
    cat: "AI & Technology",
    plain: "Computer systems that can perform tasks that normally require human thinking — like reading documents, spotting patterns, or making recommendations.",
    example: "Our system uses AI to read thousands of transactions and flag suspicious ones — a job that would take investigators weeks to do manually.",
  },
  {
    term: "ML",
    full: "Machine Learning",
    cat: "AI & Technology",
    plain: "A type of AI where computers learn patterns from past examples instead of being told specific rules. The more data it sees, the smarter it gets.",
    example: "Our fraud ML model learned from thousands of past fraud cases and can now recognize similar patterns in new transactions automatically.",
  },
  {
    term: "LLM",
    full: "Large Language Model",
    cat: "AI & Technology",
    plain: "A powerful AI that understands and writes human language. It can read case files, summarize them, and even draft reports — like a very fast, always-available writing assistant.",
    example: "The LLM reads all the evidence in a fraud case and drafts the first version of the SAR report in minutes, saving investigators hours.",
  },
  {
    term: "RAG",
    full: "Retrieval-Augmented Generation",
    cat: "AI & Technology",
    plain: "A technique where an AI first searches a knowledge library (like company policies or regulations) before writing its answer — so it gives accurate, grounded responses instead of guessing.",
    example: "When an investigator asks 'Is this transaction pattern suspicious?', the AI searches our policy library first, then generates a response based on real company rules.",
  },
  {
    term: "NLP",
    full: "Natural Language Processing",
    cat: "AI & Technology",
    plain: "The ability of computers to read, understand, and respond to human language — including emails, reports, and spoken words.",
    example: "NLP allows our system to read unstructured emails and extract key information like names, amounts, and dates automatically.",
  },
  {
    term: "API",
    full: "Application Programming Interface",
    cat: "AI & Technology",
    plain: "A bridge that allows two software systems to talk to each other and share information. Like a waiter who takes your order to the kitchen and brings back the food.",
    example: "Our system uses APIs to connect to the bank's core banking platform and pull transaction data in real time.",
  },
  {
    term: "SHAP",
    full: "SHapley Additive exPlanations",
    cat: "AI & Technology",
    plain: "A method that explains WHY an AI made a specific decision — showing which factors contributed most. Makes AI decisions transparent and understandable to humans and regulators.",
    example: "When the AI flags a transaction as high-risk, SHAP shows that the top reasons were: unusual amount, new recipient country, and odd transaction time.",
  },
  {
    term: "LIME",
    full: "Local Interpretable Model-agnostic Explanations",
    cat: "AI & Technology",
    plain: "Another method for explaining AI decisions in plain language. Works alongside SHAP to give investigators a clear reason for every AI recommendation.",
    example: "LIME explains to an investigator: 'This account was flagged because its transaction frequency tripled in the last 7 days compared to its own history.'",
  },
  {
    term: "XAI",
    full: "Explainable Artificial Intelligence",
    cat: "AI & Technology",
    plain: "AI systems designed to explain their decisions in human-readable terms. Regulators require this so banks can prove their AI is fair, unbiased, and accurate.",
    example: "Our XAI layer ensures that every fraud score comes with a plain-English explanation that a regulator or judge can understand.",
  },
  {
    term: "XGBoost",
    full: "Extreme Gradient Boosting",
    cat: "AI & Technology",
    plain: "A highly accurate ML algorithm widely used for detecting fraud. It combines many simple decision patterns to make a very reliable overall prediction.",
    example: "XGBoost analyses 50+ features of a transaction — amount, time, location, history — and produces a fraud probability score in milliseconds.",
  },
  {
    term: "Vector DB",
    full: "Vector Database",
    cat: "AI & Technology",
    plain: "A special type of database that stores information as mathematical patterns so AI can quickly find the most relevant policies, cases, or regulations to answer a question.",
    example: "When an investigator asks about shell company risk, the Vector DB instantly retrieves the 5 most relevant internal policies and past cases.",
  },
  {
    term: "ETL",
    full: "Extract, Transform, Load",
    cat: "AI & Technology",
    plain: "The process of pulling data from source systems, cleaning and converting it into a usable format, and loading it into a central database — like sorting and filing documents before putting them in a cabinet.",
    example: "Every night, ETL pipelines pull transaction data from 12 source systems, clean and standardize it, and load it into our data lake ready for analysis.",
  },
  {
    term: "CI/CD",
    full: "Continuous Integration / Continuous Deployment",
    cat: "AI & Technology",
    plain: "A way of automatically testing and releasing software updates safely and frequently, without disrupting the live system. Like a conveyor belt for software improvements.",
    example: "When a developer improves the fraud model, CI/CD automatically tests it and safely deploys it to production without any downtime.",
  },
  {
    term: "AKS",
    full: "Azure Kubernetes Service",
    cat: "AI & Technology",
    plain: "Microsoft's cloud service for running many software applications at once, scaling up or down based on demand — like a smart traffic controller for software.",
    example: "AKS allows our compliance platform to handle 5,000 transactions per day normally, but instantly scale to 50,000 during peak periods.",
  },
  {
    term: "OPA",
    full: "Open Policy Agent",
    cat: "AI & Technology",
    plain: "A tool that enforces rules automatically across all software systems — ensuring that policies are always applied consistently, without manual checking.",
    example: "OPA ensures that no AI-generated SAR can ever be filed without a human compliance officer's approval — enforced at the system level.",
  },
  {
    term: "MFA",
    full: "Multi-Factor Authentication",
    cat: "AI & Technology",
    plain: "A security method requiring users to prove their identity in two or more ways (e.g. password + phone code) before accessing sensitive systems.",
    example: "When a compliance officer approves a SAR filing, MFA requires them to confirm via both their password and a code sent to their phone.",
  },
  {
    term: "SSO",
    full: "Single Sign-On",
    cat: "AI & Technology",
    plain: "A system that lets a user log in once and access multiple applications without logging in again — like a master key for all office doors.",
    example: "Investigators use SSO to access the case workbench, compliance dashboard, and audit portal with one secure login.",
  },
  {
    term: "RBAC",
    full: "Role-Based Access Control",
    cat: "AI & Technology",
    plain: "A security system where what you can see and do is determined by your job role. An investigator sees cases; an executive sees dashboards; an auditor sees logs.",
    example: "RBAC ensures that junior investigators cannot approve SARs — that action is restricted to licensed Compliance Officers only.",
  },
  {
    term: "ABAC",
    full: "Attribute-Based Access Control",
    cat: "AI & Technology",
    plain: "An advanced version of RBAC where access is also determined by additional factors like your location, department, or the sensitivity level of specific data.",
    example: "ABAC ensures that a compliance officer in the US region can only access US customer cases, not European customer data.",
  },

  // ── COMPLIANCE & REGULATION ──────────────────────────────────────────────
  {
    term: "SAR",
    full: "Suspicious Activity Report",
    cat: "Compliance & Regulation",
    plain: "A formal legal document that a bank must file with FinCEN when it believes a customer is engaged in money laundering, fraud, or other financial crime. Filing is mandatory by law.",
    example: "When an investigator confirms a fraud pattern, they file a SAR with FinCEN, triggering a government investigation.",
  },
  {
    term: "STR",
    full: "Suspicious Transaction Report",
    cat: "Compliance & Regulation",
    plain: "Similar to a SAR but used in international banking contexts. A formal report of a suspicious individual transaction submitted to the relevant financial regulator.",
    example: "Our bank's international branch files STRs with local regulators in each country when suspicious cross-border transactions are detected.",
  },
  {
    term: "AML",
    full: "Anti-Money Laundering",
    cat: "Compliance & Regulation",
    plain: "A set of laws, regulations, and procedures designed to prevent criminals from disguising illegally obtained money as legitimate income. Banks must have robust AML programs.",
    example: "Our AML system monitors all transactions for layering patterns — the technique criminals use to disguise the origin of dirty money.",
  },
  {
    term: "KYC",
    full: "Know Your Customer",
    cat: "Compliance & Regulation",
    plain: "The process banks use to verify the identity of their customers, understand their financial behaviour, and assess their risk level before and during the banking relationship.",
    example: "When a customer opens an account, KYC checks verify their identity, source of funds, and whether they appear on any watchlists.",
  },
  {
    term: "BSA",
    full: "Bank Secrecy Act",
    cat: "Compliance & Regulation",
    plain: "A US federal law that requires banks to assist government agencies in detecting and preventing money laundering. It mandates SAR filings, record-keeping, and compliance programs.",
    example: "The BSA requires our bank to file a SAR within 30 days of detecting suspicious activity — failure to do so can result in heavy fines.",
  },
  {
    term: "FinCEN",
    full: "Financial Crimes Enforcement Network",
    cat: "Compliance & Regulation",
    plain: "A US government agency that collects and analyses financial transaction data to combat money laundering, terrorism financing, and other financial crimes. Banks file SARs directly to FinCEN.",
    example: "Every SAR our bank files goes to FinCEN, which may use it to investigate criminal networks or flag patterns across multiple banks.",
  },
  {
    term: "OCC",
    full: "Office of the Comptroller of the Currency",
    cat: "Compliance & Regulation",
    plain: "The US federal regulator that supervises and examines national banks to ensure they operate safely and comply with applicable laws and regulations.",
    example: "During an OCC examination, our bank must demonstrate that its AI models are fair, explainable, and governed according to model risk management guidelines.",
  },
  {
    term: "CFPB",
    full: "Consumer Financial Protection Bureau",
    cat: "Compliance & Regulation",
    plain: "A US agency that protects consumers from unfair, deceptive, or abusive financial practices. Banks must ensure their AI systems do not discriminate against customers.",
    example: "CFPB scrutinises whether our AI risk scoring treats customers fairly regardless of race, gender, or geography.",
  },
  {
    term: "FINRA",
    full: "Financial Industry Regulatory Authority",
    cat: "Compliance & Regulation",
    plain: "A private organisation that regulates broker-dealers in the US. Oversees securities firms and ensures they comply with financial rules and protect investors.",
    example: "For our brokerage division, FINRA requires that all suspicious trading activity be reported and investigated within defined timeframes.",
  },
  {
    term: "PEP",
    full: "Politically Exposed Person",
    cat: "Compliance & Regulation",
    plain: "An individual who holds (or has held) a prominent public position, such as a government official, senior executive, or military officer. Banks must apply enhanced due diligence to PEPs.",
    example: "When a new customer is identified as a PEP, our system automatically triggers enhanced KYC checks and ongoing transaction monitoring.",
  },
  {
    term: "CDD",
    full: "Customer Due Diligence",
    cat: "Compliance & Regulation",
    plain: "The process of gathering and verifying information about customers to understand who they are, what they do, and what financial risks they pose to the bank.",
    example: "CDD for a high-risk customer includes verifying their source of wealth, business activities, and beneficial ownership structure.",
  },
  {
    term: "EDD",
    full: "Enhanced Due Diligence",
    cat: "Compliance & Regulation",
    plain: "A more thorough version of CDD applied to high-risk customers (like PEPs or customers from high-risk countries), requiring deeper investigation and more frequent review.",
    example: "A customer transferring large sums from a sanctioned country triggers EDD — requiring senior sign-off and quarterly reviews.",
  },
  {
    term: "CTR",
    full: "Currency Transaction Report",
    cat: "Compliance & Regulation",
    plain: "A mandatory report that US banks must file with FinCEN for any cash transaction over $10,000. Required regardless of whether the transaction is suspicious.",
    example: "When a customer deposits $15,000 in cash, our system automatically generates a CTR and files it with FinCEN.",
  },

  // ── FINANCIAL CRIME ──────────────────────────────────────────────────────
  {
    term: "Typology",
    full: "Financial Crime Typology",
    cat: "Financial Crime",
    plain: "A recognised pattern or method used by criminals to commit financial crime — like structuring cash deposits to avoid reporting thresholds. Banks use typologies as templates to detect crime.",
    example: "Smurfing (breaking large cash deposits into smaller ones) is a well-known typology. Our AI monitors for this pattern automatically.",
  },
  {
    term: "Layering",
    full: "Money Laundering Layering",
    cat: "Financial Crime",
    plain: "The second stage of money laundering where criminals move dirty money through multiple accounts or transactions to make it harder to trace back to its criminal origin.",
    example: "A criminal might transfer money through 10 accounts across 5 countries — our graph intelligence identifies this layering network.",
  },
  {
    term: "Structuring",
    full: "Transaction Structuring (Smurfing)",
    cat: "Financial Crime",
    plain: "Breaking up large cash transactions into smaller amounts specifically to avoid the $10,000 reporting threshold. This is itself a federal crime in the US.",
    example: "If a customer makes 5 deposits of $9,500 in one week, our AI flags this as potential structuring and triggers an alert.",
  },
  {
    term: "Mule Account",
    full: "Money Mule Account",
    cat: "Financial Crime",
    plain: "A bank account used (often unknowingly) by a third party to receive and transfer criminal proceeds. The account holder is the 'mule' — a middle person in the crime.",
    example: "Our graph intelligence identifies accounts that receive funds from dozens of unrelated sources within hours — a classic mule account pattern.",
  },
  {
    term: "Synthetic Identity",
    full: "Synthetic Identity Fraud",
    cat: "Financial Crime",
    plain: "A type of fraud where criminals create a fake identity by combining real and fictitious information (like a real Social Security Number with a fake name) to open fraudulent accounts.",
    example: "Our AI detects synthetic identities by spotting mismatches between KYC data, credit bureau records, and transaction behaviour patterns.",
  },
  {
    term: "False Positive",
    full: "False Positive Alert",
    cat: "Financial Crime",
    plain: "When the system flags a transaction as suspicious but it turns out to be completely legitimate. Most banks have a 95–98% false positive rate — meaning almost all alerts are innocent.",
    example: "A customer buying expensive jewellery abroad triggers a fraud alert — but investigation shows it was a planned anniversary gift. That's a false positive.",
  },
  {
    term: "Fraud Ring",
    full: "Organised Fraud Ring",
    cat: "Financial Crime",
    plain: "A coordinated group of criminals working together across multiple accounts and transactions to commit large-scale financial fraud.",
    example: "Our graph intelligence identified 23 accounts that all shared the same IP address and device — exposing a coordinated fraud ring.",
  },

  // ── ARCHITECTURE & SYSTEMS ───────────────────────────────────────────────
  {
    term: "C4 Model",
    full: "Context, Container, Component, Code Model",
    cat: "Architecture & Systems",
    plain: "A framework for drawing software architecture diagrams at four levels of detail — from a bird's-eye view of the whole system down to individual code components. Makes complex systems understandable.",
    example: "We used the C4 model to create four diagrams showing our system from the executive level (System Context) down to the technical level (Components).",
  },
  {
    term: "BPMN",
    full: "Business Process Model and Notation",
    cat: "Architecture & Systems",
    plain: "A standard visual language for drawing business process flows — using shapes like rectangles (tasks), diamonds (decisions), and circles (start/end) to map how work gets done.",
    example: "Our BPMN diagram shows exactly how a transaction flows from initial detection all the way through to SAR filing, including every human approval step.",
  },
  {
    term: "Microservices",
    full: "Microservices Architecture",
    cat: "Architecture & Systems",
    plain: "A way of building software as many small, independent services (each doing one job) rather than one large system. If one part breaks, the rest keeps working.",
    example: "Our fraud detection, case management, and SAR drafting are separate microservices — so if the SAR service is updated, fraud detection keeps running uninterrupted.",
  },
  {
    term: "Kafka",
    full: "Apache Kafka",
    cat: "Architecture & Systems",
    plain: "A high-speed data pipeline that can handle millions of real-time messages per second. Think of it as a super-fast postal service for data between systems.",
    example: "Every transaction from the core banking system is sent through Kafka to our fraud detection engine in under one second.",
  },
  {
    term: "Graph DB",
    full: "Graph Database",
    cat: "Architecture & Systems",
    plain: "A database that stores information as a network of connected nodes — perfect for showing how people, accounts, and transactions relate to each other and spotting hidden criminal networks.",
    example: "Our graph database revealed that two seemingly unrelated accounts both received money from the same 15 shell companies — exposing a fraud network.",
  },
  {
    term: "Lakehouse",
    full: "Data Lakehouse",
    cat: "Architecture & Systems",
    plain: "A modern data storage architecture that combines the flexibility of a data lake (store everything) with the structure of a data warehouse (query and analyse it). Best of both worlds.",
    example: "Our lakehouse stores 3 years of raw transaction data and makes it instantly queryable for fraud investigations and regulatory audits.",
  },
  {
    term: "Zero-Trust",
    full: "Zero-Trust Security Architecture",
    cat: "Architecture & Systems",
    plain: "A security model that trusts no one by default — even inside the company network. Every user and system must prove their identity and permissions every single time.",
    example: "Our zero-trust architecture means that even an internal developer cannot access customer data unless their role explicitly permits it.",
  },
  {
    term: "ELK",
    full: "Elasticsearch, Logstash, Kibana",
    cat: "Architecture & Systems",
    plain: "A popular set of tools for collecting, storing, and searching through system logs and audit records. Used to provide searchable, tamper-proof audit trails.",
    example: "Our ELK stack stores every AI decision and human override, allowing auditors to search 'who approved this SAR and when?' in seconds.",
  },

  // ── PROJECT & TEAM ───────────────────────────────────────────────────────
  {
    term: "CIE",
    full: "Compliance Intelligence Ecosystem",
    cat: "Project & Team",
    plain: "The name of the complete AI-powered platform our team is building — the central system that connects fraud detection, investigation, documentation, governance, and regulatory reporting.",
    example: "CIE is our product. It sits between the bank's source systems and its human decision-makers, making everyone smarter and faster.",
  },
  {
    term: "WAVE AI",
    full: "WAVE AI Compliance Command Center",
    cat: "Project & Team",
    plain: "Our team name and the brand name of our capstone project — an AI-powered compliance intelligence platform combining the Investigator Co-Pilot and Regulatory Readiness Engine.",
    example: "WAVE AI is what we are presenting to the executive panel at the end of the capstone.",
  },
  {
    term: "WIC",
    full: "Women in Cloud",
    cat: "Project & Team",
    plain: "The organisation sponsoring our apprenticeship programme. Women in Cloud is a global nonprofit focused on creating economic access and opportunity for women in technology.",
    example: "WIC partnered with Microsoft to create the AI Innovator Apprenticeship that our team is participating in.",
  },
  {
    term: "ROI",
    full: "Return on Investment",
    cat: "Project & Team",
    plain: "A measure of how much value (money saved, time saved, risk reduced) is gained relative to the cost of an investment. Executives use ROI to justify spending on new systems.",
    example: "Our ROI analysis shows that WAVE AI saves 87% of alert review time — translating to $4.2M saved per year in investigator labour costs.",
  },
  {
    term: "MVP",
    full: "Minimum Viable Product",
    cat: "Project & Team",
    plain: "The simplest version of a product that still delivers real value and can be demonstrated. Build it, show it works, then improve it — rather than trying to build everything at once.",
    example: "Our MVP is a working Investigator Co-Pilot that takes a sample transaction alert and produces an AI-generated case summary and SAR draft.",
  },
  {
    term: "Kanban",
    full: "Kanban Board",
    cat: "Project & Team",
    plain: "A visual project management tool that organises tasks into columns (To Do / In Progress / Done) so everyone on the team can see what's happening at a glance.",
    example: "Our team's Kanban board in Google Sheets shows Lisa is coding the LLM integration, Neha is building slides, and Hanane is designing the governance framework.",
  },

  // ── GOVERNANCE & RISK ────────────────────────────────────────────────────
  {
    term: "RACI",
    full: "Responsible, Accountable, Consulted, Informed",
    cat: "Governance & Risk",
    plain: "A framework that defines exactly who does what in any process: who is Responsible (does the work), Accountable (owns the outcome), Consulted (gives input), and Informed (kept in the loop).",
    example: "For SAR filing: Investigator = Responsible, Compliance Officer = Accountable, Legal = Consulted, CRO = Informed.",
  },
  {
    term: "CRO",
    full: "Chief Risk Officer",
    cat: "Governance & Risk",
    plain: "The senior executive responsible for identifying, assessing, and managing all forms of risk across the organisation — including financial crime risk and AI model risk.",
    example: "The CRO reviews our executive risk cockpit dashboard weekly to understand the bank's current financial crime exposure and AI performance.",
  },
  {
    term: "CCO",
    full: "Chief Compliance Officer",
    cat: "Governance & Risk",
    plain: "The senior executive responsible for ensuring the organisation follows all applicable laws, regulations, and internal policies. Owns the compliance programme.",
    example: "The CCO must sign off on all regulatory exam responses and is ultimately accountable for the bank's AML programme effectiveness.",
  },
  {
    term: "MRM",
    full: "Model Risk Management",
    cat: "Governance & Risk",
    plain: "The process of identifying, measuring, and controlling the risks that come from using AI/ML models to make decisions — including the risk that a model is wrong, biased, or outdated.",
    example: "Our MRM framework requires that every AI model is validated, documented, monitored for drift, and approved by a governance committee before going live.",
  },
  {
    term: "HITL",
    full: "Human-in-the-Loop",
    cat: "Governance & Risk",
    plain: "A design principle where a human must review and approve AI recommendations before they become final decisions. Ensures AI never acts alone on high-stakes choices.",
    example: "Our HITL design means the AI can draft a SAR, but a human compliance officer must review, edit, and approve it before it is ever filed.",
  },
  {
    term: "GRC",
    full: "Governance, Risk, and Compliance",
    cat: "Governance & Risk",
    plain: "An integrated framework covering: how the organisation is governed, how risks are managed, and how regulatory compliance is maintained — all in one coordinated approach.",
    example: "Our platform integrates with GRC tools like ServiceNow to ensure every AI model is logged in the company's official risk register.",
  },
  {
    term: "KPI",
    full: "Key Performance Indicator",
    cat: "Governance & Risk",
    plain: "A measurable value that shows how well something is performing against a target. Executives use KPIs to track whether the system is actually delivering its promised benefits.",
    example: "Our key KPIs are: false positive rate (target <60%), average investigation time (target <45 min), and SAR filing accuracy (target >99%).",
  },
  {
    term: "SLA",
    full: "Service Level Agreement",
    cat: "Governance & Risk",
    plain: "A commitment on how fast or how well a service will perform. In compliance, SLAs define how quickly investigators must review alerts and how long case resolution should take.",
    example: "Our SLA requires all high-priority alerts to be reviewed within 4 hours and all SARs to be filed within 30 days of detection.",
  },
  {
    term: "Audit Trail",
    full: "Immutable Audit Trail",
    cat: "Governance & Risk",
    plain: "A permanent, tamper-proof record of every action taken in the system — who did what, when, and why. Regulators require this to verify the bank's compliance history.",
    example: "Our audit trail records that Investigator A reviewed alert 4721 at 2:14pm, accepted the AI summary, and escalated to SAR at 3:45pm — all permanently stored.",
  },
  {
    term: "Model Drift",
    full: "AI Model Drift",
    cat: "Governance & Risk",
    plain: "When an AI model's accuracy degrades over time because the real world has changed but the model hasn't been updated. Like using last year's map to navigate a city that's added new roads.",
    example: "As criminals adopt new fraud tactics, our fraud model may start missing new patterns — that's model drift. We monitor for it monthly and retrain as needed.",
  },
];

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [onlySaved, setOnlySaved] = useState(false);
  // Saved terms are persisted by the API, so they survive a reload.
  const { isSaved, toggle, saved, error: savedError } = useFavorites("term");
  const [view, setView] = useState("cards"); // cards | table

  const catColors = {
    "AI & Technology":        "#00E5C8",
    "Compliance & Regulation":"#38BDF8",
    "Financial Crime":        "#F43F5E",
    "Architecture & Systems": "#A78BFA",
    "Project & Team":         "#FACC15",
    "Governance & Risk":      "#F97316",
  };

  const filtered = TERMS.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.term.toLowerCase().includes(q) ||
      t.full.toLowerCase().includes(q) ||
      t.plain.toLowerCase().includes(q);
    const matchCat = cat === "All" || t.cat === cat;
    const matchSaved = !onlySaved || isSaved(t.term);
    return matchSearch && matchCat && matchSaved;
  });

  const grouped = CATEGORIES.slice(1).reduce((acc, c) => {
    acc[c] = filtered.filter(t => t.cat === c);
    return acc;
  }, {});

  return (
    <div style={{
      minHeight:"100%",
      background:"#06080F",
      color:"#E2E8F0",
      fontFamily:"'DM Sans','Segoe UI',sans-serif",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background:"#0D1117",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        padding:"28px 40px 24px",
      }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{
                width:36, height:36, borderRadius:8,
                background:"linear-gradient(135deg,#00E5C8,#A78BFA)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18,
              }}>📖</div>
              <span style={{ fontSize:10, letterSpacing:3, color:"#00E5C8", fontWeight:800 }}>
                WAVE AI · REFERENCE DOCUMENT
              </span>
            </div>
            <h1 style={{ margin:0, fontSize:26, fontWeight:800, letterSpacing:-0.5 }}>
              Acronyms & Glossary
            </h1>
            <p style={{ margin:"6px 0 0", color:"#64748B", fontSize:14 }}>
              Plain-English definitions for every term used in the WAVE AI Compliance Command Center project
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{
              background:"rgba(0,229,200,0.08)", border:"1px solid rgba(0,229,200,0.25)",
              borderRadius:10, padding:"8px 16px", textAlign:"center",
            }}>
              <div style={{ fontSize:22, fontWeight:800, color:"#00E5C8" }}>{TERMS.length}</div>
              <div style={{ fontSize:10, color:"#64748B" }}>Total Terms</div>
            </div>
            <div style={{
              background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.25)",
              borderRadius:10, padding:"8px 16px", textAlign:"center",
            }}>
              <div style={{ fontSize:22, fontWeight:800, color:"#A78BFA" }}>6</div>
              <div style={{ fontSize:10, color:"#64748B" }}>Categories</div>
            </div>
            {/* Saved filter — count comes from the API */}
            <button
              onClick={() => setOnlySaved((v) => !v)}
              aria-pressed={onlySaved}
              style={{
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                fontSize: 11, fontWeight: 700,
                background: onlySaved ? "rgba(250,204,21,0.15)" : "transparent",
                border: `1px solid ${onlySaved ? "rgba(250,204,21,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: onlySaved ? "#FACC15" : "#64748B",
              }}
            >
              ★ Saved{saved.length ? ` (${saved.length})` : ""}
            </button>
            {/* View toggle */}
            <div style={{ display:"flex", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, overflow:"hidden" }}>
              {["cards","table"].map(v=>(
                <button key={v} onClick={()=>setView(v)} style={{
                  padding:"8px 14px", cursor:"pointer", fontSize:11, fontWeight:600,
                  background: view===v ? "rgba(0,229,200,0.15)" : "transparent",
                  color: view===v ? "#00E5C8" : "#64748B",
                  border:"none", textTransform:"capitalize",
                }}>{v==="cards"?"Cards":"Table"}</button>
              ))}
            </div>
          </div>
        </div>

        {savedError && (
          <div style={{ marginTop:14, fontSize:11, color:"#F43F5E" }}>{savedError}</div>
        )}

        {/* Search + filter */}
        <div style={{ display:"flex", gap:12, marginTop:20, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#64748B", fontSize:14 }}>🔍</span>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search any term, acronym, or keyword…"
              style={{
                width:"100%", padding:"10px 12px 10px 36px",
                background:"#111827", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:10, color:"#E2E8F0", fontSize:13, outline:"none",
                boxSizing:"border-box",
              }}
            />
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{
                padding:"8px 14px", borderRadius:8, cursor:"pointer",
                fontSize:11, fontWeight:600, transition:"all 0.15s",
                background: cat===c ? `${catColors[c] || "#00E5C8"}18` : "transparent",
                border:`1px solid ${cat===c ? (catColors[c]||"#00E5C8")+"60" : "rgba(255,255,255,0.08)"}`,
                color: cat===c ? (catColors[c]||"#00E5C8") : "#64748B",
              }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:"28px 40px" }}>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", color:"#64748B", padding:"60px 0", fontSize:14 }}>
            No terms match your search. Try a different keyword.
          </div>
        )}

        {view === "table" ? (
          /* ── TABLE VIEW ── */
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                  {["Acronym","Full Name","Category","Plain-English Meaning","Real Example"].map(h=>(
                    <th key={h} style={{
                      padding:"10px 14px", textAlign:"left",
                      fontSize:10, letterSpacing:1.5, fontWeight:800,
                      color:"#64748B", textTransform:"uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t,i)=>(
                  <tr key={i} style={{
                    borderBottom:"1px solid rgba(255,255,255,0.04)",
                    background: i%2===0 ? "rgba(255,255,255,0.01)" : "transparent",
                  }}>
                    <td style={{ padding:"12px 14px", fontWeight:800, color:catColors[t.cat]||"#00E5C8", fontSize:13, whiteSpace:"nowrap" }}>{t.term}</td>
                    <td style={{ padding:"12px 14px", color:"#C8D4E8", fontWeight:600, minWidth:160 }}>{t.full}</td>
                    <td style={{ padding:"12px 14px", whiteSpace:"nowrap" }}>
                      <span style={{
                        fontSize:9, fontWeight:700, letterSpacing:1,
                        padding:"2px 8px", borderRadius:10,
                        color:catColors[t.cat], border:`1px solid ${catColors[t.cat]}40`,
                        background:`${catColors[t.cat]}10`,
                      }}>{t.cat}</span>
                    </td>
                    <td style={{ padding:"12px 14px", color:"#94A3B8", lineHeight:1.6, minWidth:260 }}>{t.plain}</td>
                    <td style={{ padding:"12px 14px", color:"#64748B", lineHeight:1.6, fontStyle:"italic", minWidth:240 }}>{t.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── CARDS VIEW ── */
          <div>
            {(cat === "All" ? CATEGORIES.slice(1) : [cat]).map(c=>{
              const items = cat === "All" ? grouped[c] : filtered;
              if (!items || items.length === 0) return null;
              return (
                <div key={c} style={{ marginBottom:36 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ flex:1, height:1, background:`${catColors[c]}30` }}/>
                    <span style={{
                      fontSize:10, letterSpacing:2.5, fontWeight:800,
                      color:catColors[c], textTransform:"uppercase",
                      padding:"4px 14px", borderRadius:20,
                      background:`${catColors[c]}10`, border:`1px solid ${catColors[c]}30`,
                    }}>{c} — {items.length} terms</span>
                    <div style={{ flex:1, height:1, background:`${catColors[c]}30` }}/>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:12 }}>
                    {items.map((t,i)=>{
                      const key = `${c}-${i}`;
                      const open = expanded === key;
                      return (
                        <div key={key} onClick={()=>setExpanded(open?null:key)} style={{
                          border:`1px solid ${open ? catColors[c]+"60" : "rgba(255,255,255,0.07)"}`,
                          borderRadius:12, padding:"16px 18px", cursor:"pointer",
                          transition:"all 0.2s",
                          background: open ? `${catColors[c]}08` : "#111827",
                        }}>
                          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                                <span style={{
                                  fontSize:16, fontWeight:900, color:catColors[c],
                                  fontFamily:"monospace", letterSpacing:-0.5,
                                }}>{t.term}</span>
                                <span style={{ fontSize:11, color:"#94A3B8", fontWeight:600 }}>{t.full}</span>
                              </div>
                              <p style={{ margin:0, fontSize:12, color:"#94A3B8", lineHeight:1.65 }}>
                                {t.plain}
                              </p>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                              <button
                                onClick={(e)=>{ e.stopPropagation(); toggle(t.term, t.full); }}
                                aria-pressed={isSaved(t.term)}
                                title={isSaved(t.term) ? `Remove ${t.term} from saved terms` : `Save ${t.term}`}
                                style={{
                                  width:24, height:24, borderRadius:7, cursor:"pointer",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  background: isSaved(t.term) ? `${catColors[c]}20` : "transparent",
                                  border:`1px solid ${isSaved(t.term) ? catColors[c]+"70" : "rgba(255,255,255,0.12)"}`,
                                  color: isSaved(t.term) ? catColors[c] : "#64748B",
                                  fontSize:12, lineHeight:1, padding:0,
                                }}
                              >{isSaved(t.term) ? "★" : "☆"}</button>
                              <div style={{
                                width:22, height:22, borderRadius:"50%",
                                border:`1px solid ${catColors[c]}40`,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                color:catColors[c], fontSize:13,
                                transition:"transform 0.2s",
                                transform: open ? "rotate(45deg)" : "none",
                              }}>+</div>
                            </div>
                          </div>

                          {open && (
                            <div style={{
                              marginTop:14, padding:"12px 14px", borderRadius:8,
                              background:`${catColors[c]}10`, border:`1px solid ${catColors[c]}25`,
                            }}>
                              <div style={{ fontSize:9, letterSpacing:2, color:catColors[c], fontWeight:700, marginBottom:6 }}>
                                REAL-WORLD EXAMPLE
                              </div>
                              <p style={{ margin:0, fontSize:12, color:"#CBD5E1", lineHeight:1.7, fontStyle:"italic" }}>
                                "{t.example}"
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        borderTop:"1px solid rgba(255,255,255,0.05)",
        padding:"16px 40px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        color:"#374151", fontSize:11, letterSpacing:0.5,
      }}>
        <span>WAVE AI COMPLIANCE COMMAND CENTER · ACRONYMS & GLOSSARY</span>
        <span>WIC × MICROSOFT AI INNOVATOR APPRENTICESHIP · 2026</span>
      </div>
    </div>
  );
}
