# WAVE AI — Compliance Dashboard

Published link: https://claude.ai/artifact/E84xmV7E9YRiC1BN51aDej

Six workspaces behind one navigation rail, backed by a real API. Each of the
original artifact files became a tab.

| Tab | Source file | Data |
| --- | --- | --- |
| Compliance Ops | `compliancedashboard.tsx` | Live — API |
| Architecture | `architecturedgrms.tsx` | Static |
| Human Governance | `HumanGovernanceModel.tsx` | Static |
| Innovation Map | `aiinnovationmap.tsx` | Static |
| Prompt Library | `WAVE-AI-Prompt-Library.tsx` | Saved prompts — API |
| Glossary | `acronymsglossary.tsx` | Saved terms — API |

## Getting started

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**. That starts two processes: the API on
port 4000 and the Vite dev server on 5173, which proxies `/api` to the API.
Ctrl-C stops both.

For a production build, served entirely by the Node process on port 4000:

```bash
npm run build
npm start          # http://localhost:4000
```

Other scripts: `npm run dev:api` and `npm run dev:web` run the halves
separately; `npm run typecheck` runs `tsc --noEmit`.

## How it's put together

```
server/                 API — Node's http module, no dependencies
  index.mjs             HTTP server, static file serving, SPA fallback
  routes.mjs            All /api endpoints
  seed.mjs              Tab registry, transaction dataset, reference lists
  lib/scoring.mjs       Risk scoring with an explainable factor breakdown
  lib/caseFile.mjs      Evidence bundle, case summary, SAR draft generation
  lib/store.mjs         In-memory state, flushed to data/state.json
  lib/router.mjs        Small path-param router
client/src/
  App.tsx               Shell: rail, routing, keyboard shortcuts
  shell/                Rail, command palette, error boundary
  lib/api.ts            Typed API client
  lib/live.ts           Subscribable store for backend-owned data
  lib/favorites.ts      Saved-items hook, used by two tabs
  tabs/                 The six workspaces
  tabs/registry.ts      Workspace id → component
```

**The backend owns the data.** Risk scores, case files, SAR drafts and the audit
trail are all produced server-side, so two browsers looking at the same
transaction see the same score, and every decision is logged where it can be
exported. The client holds no source-of-truth data.

**State persists** to `server/data/state.json` (atomic write, debounced). It
survives a restart. `POST /api/reset` reloads the seed dataset — handy when
demoing.

**The rail is API-driven.** Tabs come from `GET /api/tabs`. Adding a workspace
means one entry in `server/seed.mjs` and one line in
`client/src/tabs/registry.ts`. If the API is unreachable the shell falls back to
a built-in tab list, shows a banner, and the four static workspaces keep working.

### Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl-K` | Open the workspace palette |
| `Alt` + `1`–`6` | Jump to a workspace |
| `↑` `↓` `↵` `Esc` | Navigate the palette |

The active workspace is kept in the URL hash, so tabs are linkable and survive a
reload.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Status, uptime, record counts |
| `GET` | `/api/tabs` | Workspace registry driving the nav rail |
| `GET` | `/api/reference` | Currencies, channels, watchlist, SAR threshold |
| `GET` | `/api/metrics` | Dashboard KPIs and typology mix |
| `GET` | `/api/transactions` | Filter by `status`, `minRisk`, `q`, `sort=risk` |
| `POST` | `/api/transactions` | Score and record a transaction |
| `GET` | `/api/transactions/:id` | One transaction |
| `GET` | `/api/transactions/:id/case` | Evidence, summary, SAR draft |
| `PATCH` | `/api/transactions/:id` | Record a decision (justification required) |
| `GET` | `/api/alerts` | Open transactions at or above threshold |
| `GET` | `/api/audit` | Audit trail, newest first |
| `POST` | `/api/audit` | Append an entry |
| `GET` | `/api/audit.csv` | Audit trail as a CSV download |
| `GET` | `/api/favorites` | Saved prompts and terms |
| `POST` | `/api/favorites` | Save an item |
| `DELETE` | `/api/favorites/:key` | Unsave an item |
| `POST` | `/api/usage/:tabId` | Increment a workspace view counter |
| `POST` | `/api/reset` | Reload the seed dataset |

Validation failures return `422` with a `fields` object, so the intake form can
mark individual inputs. Unknown ids return `404`; wrong verbs return `405`.

### Risk scoring

Amount band (threshold avoidance between 9,000 and 10,000 scores higher than the
band above it), channel weighting, and jurisdiction watchlist. Each factor comes
back with its point contribution so the UI can show why a score landed where it
did, rather than presenting a number with no reasoning.

The seeded transactions carry pre-set scores representing model output that
includes signals the rule engine can't see. Where those exceed what the rules
explain, the case file shows the difference as a model overlay instead of
printing arithmetic that doesn't add up.

## Notes

- `tsconfig.json` runs with `strict: false`. The six workspace components were
  authored as standalone artifacts with loosely typed props and compile
  unchanged; `client/src/lib` is fully typed.
- Components were edited only where necessary: `100vh` roots became `100%` so
  they nest inside the shell, two clashing `App` exports were renamed, and the
  compliance tab's hardcoded dataset was replaced with API calls.
- No database engine, and the API has no npm dependencies — it runs on a clean
  Node 18+ install. Swapping `lib/store.mjs` for a real database is the natural
  next step if this outgrows a JSON file.
