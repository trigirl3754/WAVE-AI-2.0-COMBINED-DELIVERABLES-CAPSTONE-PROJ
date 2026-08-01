import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { TabMeta } from '../lib/api';

/**
 * Maps the workspace ids the API serves (/api/tabs) to the components that
 * render them. Each is code-split so the initial load stays small.
 *
 * Adding a workspace: add an entry to TABS in server/seed.mjs and a matching
 * line here.
 */
export const WORKSPACES: Record<string, LazyExoticComponent<ComponentType>> = {
  compliance: lazy(() => import('./ComplianceTab')),
  architecture: lazy(() => import('./ArchitectureTab')),
  governance: lazy(() => import('./GovernanceTab')),
  innovation: lazy(() => import('./InnovationTab')),
  prompts: lazy(() => import('./PromptsTab')),
  glossary: lazy(() => import('./GlossaryTab')),
};

/**
 * Used until /api/tabs responds (and if it never does) so the dashboard is
 * navigable even with the API down.
 */
export const FALLBACK_TABS: TabMeta[] = [
  { id: 'compliance',   label: 'Compliance Ops',   short: 'Ops',     icon: '◈', accent: '#00E5C8', summary: 'Transaction triage, alerts, cases and audit trail.', source: 'compliancedashboard.tsx',   live: true,  order: 0, views: 0 },
  { id: 'architecture', label: 'Architecture',     short: 'Arch',    icon: '◇', accent: '#A78BFA', summary: 'C4 views, BPMN and swimlane flows.',                 source: 'architecturedgrms.tsx',      live: false, order: 1, views: 0 },
  { id: 'governance',   label: 'Human Governance', short: 'Gov',     icon: '◉', accent: '#38BDF8', summary: 'Where AI acts, assists or stops.',                   source: 'HumanGovernanceModel.tsx',   live: false, order: 2, views: 0 },
  { id: 'innovation',   label: 'Innovation Map',   short: 'Map',     icon: '◎', accent: '#F97316', summary: 'Opportunity zones across the AML value chain.',      source: 'aiinnovationmap.tsx',        live: false, order: 3, views: 0 },
  { id: 'prompts',      label: 'Prompt Library',   short: 'Prompts', icon: '◐', accent: '#FACC15', summary: 'Reusable prompts for analysts.',                     source: 'WAVE-AI-Prompt-Library.tsx', live: true,  order: 4, views: 0 },
  { id: 'glossary',     label: 'Glossary',         short: 'Terms',   icon: '◑', accent: '#F43F5E', summary: 'Plain-English definitions for every acronym.',       source: 'acronymsglossary.tsx',       live: true,  order: 5, views: 0 },
];
