/**
 * Seed data for the WAVE dashboard.
 *
 * `tabs` drives the navigation rail in the client — the frontend renders
 * whatever this list says, so adding a workspace is a one-line change here
 * plus a matching entry in client/src/tabs/registry.tsx.
 */

export const TABS = [
  {
    id: 'compliance',
    label: 'Compliance Ops',
    short: 'Ops',
    icon: '◈',
    accent: '#00E5C8',
    summary: 'Live transaction triage, alert queue, case investigation and audit trail.',
    source: 'compliancedashboard.tsx',
    live: true,
  },
  {
    id: 'architecture',
    label: 'Architecture',
    short: 'Arch',
    icon: '◇',
    accent: '#A78BFA',
    summary: 'C4 context, container and component views, BPMN and swimlane flows.',
    source: 'architecturedgrms.tsx',
    live: false,
  },
  {
    id: 'governance',
    label: 'Human Governance',
    short: 'Gov',
    icon: '◉',
    accent: '#38BDF8',
    summary: 'Where AI acts, assists or stops. RACI, risk matrix and escalation paths.',
    source: 'HumanGovernanceModel.tsx',
    live: false,
  },
  {
    id: 'innovation',
    label: 'Innovation Map',
    short: 'Map',
    icon: '◎',
    accent: '#F97316',
    summary: 'Opportunity zones across the AML value chain, scored by impact.',
    source: 'aiinnovationmap.tsx',
    live: false,
  },
  {
    id: 'prompts',
    label: 'Prompt Library',
    short: 'Prompts',
    icon: '◐',
    accent: '#FACC15',
    summary: 'Reusable prompts for analysts, with responsible-AI screens.',
    source: 'WAVE-AI-Prompt-Library.tsx',
    live: true,
  },
  {
    id: 'glossary',
    label: 'Glossary',
    short: 'Terms',
    icon: '◑',
    accent: '#F43F5E',
    summary: 'Plain-English definitions for every acronym in the programme.',
    source: 'acronymsglossary.tsx',
    live: true,
  },
];

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'EG', name: 'Egypt' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IT', name: 'Italy' },
  { code: 'RU', name: 'Russia' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'BY', name: 'Belarus' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'IR', name: 'Iran' },
  { code: 'KP', name: 'North Korea' },
  { code: 'SY', name: 'Syria' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'CU', name: 'Cuba' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'LY', name: 'Libya' },
  { code: 'SD', name: 'Sudan' },
  { code: 'YE', name: 'Yemen' },
  { code: 'SO', name: 'Somalia' },
  { code: 'IQ', name: 'Iraq' },
];

export const HIGH_RISK_COUNTRIES = COUNTRIES.filter(({ code }) =>
  ['RU', 'NG', 'BY', 'UA', 'IR', 'KP', 'SY', 'MM', 'CU', 'VE', 'LY', 'SD', 'YE', 'SO', 'IQ'].includes(code)
).map(({ code, name }) => ({ code, name }));

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CNY',
  'AED',
  'BRL',
  'INR',
  'NGN',
  'JPY',
  'CHF',
  'CAD',
  'AUD',
  'ZAR',
  'RUB',
  'MXN',
];

export const CHANNELS = ['ONLINE', 'WIRE', 'CASH', 'ATM', 'MOBILE'];

const T = [
  ['TXN-001', 'Carlos Mendez', 'C001', 9500, 'USD', 'ONLINE', 'Mexico', 0.94, 'Structuring', 'OPEN'],
  ['TXN-002', 'Aisha Bello', 'C002', 47200, 'EUR', 'WIRE', 'Nigeria', 0.88, 'Layering', 'OPEN'],
  ['TXN-003', 'Wei Zhang', 'C003', 3200, 'CNY', 'ONLINE', 'China', 0.41, 'Low Risk', 'CLOSED'],
  ['TXN-004', 'Boris Petrov', 'C004', 82000, 'USD', 'CASH', 'Russia', 0.97, 'Money Laundering', 'OPEN'],
  ['TXN-005', 'Fatima Al-Rashid', 'C005', 15600, 'AED', 'ONLINE', 'UAE', 0.73, 'Shell Company', 'OPEN'],
  ['TXN-006', 'Marcus Johnson', 'C006', 1200, 'USD', 'ATM', 'USA', 0.18, 'Low Risk', 'CLOSED'],
  ['TXN-007', 'Sofia Rossi', 'C007', 28900, 'EUR', 'WIRE', 'Italy', 0.66, 'Unusual Pattern', 'OPEN'],
  ['TXN-008', 'Dmitri Volkov', 'C008', 95000, 'USD', 'ONLINE', 'Ukraine', 0.99, 'Fraud Ring', 'OPEN'],
  ['TXN-009', 'Priya Sharma', 'C009', 4500, 'INR', 'MOBILE', 'India', 0.29, 'Low Risk', 'CLOSED'],
  ['TXN-010', 'Ahmed Hassan', 'C010', 61000, 'USD', 'WIRE', 'Egypt', 0.85, 'Sanctions Risk', 'OPEN'],
  ['TXN-011', 'Li Wei', 'C011', 9800, 'USD', 'ONLINE', 'Hong Kong', 0.91, 'Structuring', 'OPEN'],
  ['TXN-012', 'Maria Santos', 'C012', 6700, 'BRL', 'MOBILE', 'Brazil', 0.52, 'Moderate Risk', 'OPEN'],
  ['TXN-013', 'Ivan Petrov', 'C013', 120000, 'USD', 'WIRE', 'Belarus', 0.98, 'High-Value Fraud', 'OPEN'],
  ['TXN-014', 'Grace Okafor', 'C014', 8900, 'NGN', 'ONLINE', 'Nigeria', 0.77, 'Mule Account', 'OPEN'],
  ['TXN-015', 'John Smith', 'C015', 550, 'USD', 'ATM', 'USA', 0.09, 'Low Risk', 'CLOSED'],
];

export const SEED = {
  transactions: T.map(
    ([id, customer, customerId, amount, currency, channel, location, riskScore, type, status]) => ({
      id,
      customer,
      customerId,
      amount,
      currency,
      channel,
      location,
      riskScore,
      type,
      status,
      origin: 'seed',
      createdAt: null,
      decision: null,
      justification: null,
    })
  ),
};
