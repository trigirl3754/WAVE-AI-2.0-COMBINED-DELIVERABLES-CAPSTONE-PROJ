import { Suspense, useCallback, useEffect, useState } from 'react';
import { api, apiEvents, isReachable, type TabMeta } from './lib/api';
import { useLive, usePolling } from './lib/live';
import { WORKSPACES, FALLBACK_TABS } from './tabs/registry';
import { Rail } from './shell/Rail';
import { CommandPalette } from './shell/CommandPalette';
import { ErrorBoundary } from './shell/ErrorBoundary';

/** Workspace id is kept in the URL hash so tabs are linkable and reloadable. */
function hashTab(tabs: TabMeta[]): string | null {
  const id = window.location.hash.replace(/^#\/?/, '');
  return tabs.some((t) => t.id === id) ? id : null;
}

export default function App() {
  const [tabs, setTabs] = useState<TabMeta[]>(FALLBACK_TABS);
  const [active, setActive] = useState<string>(() => hashTab(FALLBACK_TABS) ?? FALLBACK_TABS[0].id);
  const [online, setOnline] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // The compliance store also feeds the rail's live counters, so the shell
  // keeps a slow poll running regardless of which workspace is open.
  const { alerts, audit } = useLive();
  usePolling(30_000);

  // Workspaces come from the API; FALLBACK_TABS keeps the shell usable if it's down.
  useEffect(() => {
    api
      .tabs()
      .then(({ tabs: served }) => {
        if (!served?.length) return;
        setTabs(served);
        const fromHash = hashTab(served);
        if (fromHash) setActive(fromHash);
      })
      .catch(() => setOnline(false));
  }, []);

  useEffect(() => {
    const onStatus = (e: Event) => setOnline((e as CustomEvent<boolean>).detail);
    apiEvents.addEventListener('status', onStatus);
    setOnline(isReachable());
    return () => apiEvents.removeEventListener('status', onStatus);
  }, []);

  const select = useCallback((id: string) => {
    setActive(id);
    setPaletteOpen(false);
    window.location.hash = `#/${id}`;
    (document.querySelector('.shell__content') as HTMLElement | null)?.scrollTo({ top: 0 });
    api.recordView(id).catch(() => {
      /* usage counters are best-effort */
    });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const id = hashTab(tabs);
      if (id) setActive(id);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [tabs]);

  // ⌘K / Ctrl-K opens the palette; Alt+1..9 jumps straight to a workspace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        const tab = tabs[Number(e.key) - 1];
        if (tab) {
          e.preventDefault();
          select(tab.id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tabs, select]);

  useEffect(() => {
    const meta = tabs.find((t) => t.id === active);
    document.title = meta ? `${meta.label} · WAVE AI` : 'WAVE AI';
  }, [active, tabs]);

  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const Workspace = WORKSPACES[current.id];

  return (
    <div className="shell">
      <Rail
        tabs={tabs}
        active={current.id}
        onSelect={select}
        online={online}
        openAlerts={online ? alerts.length : null}
        auditEvents={online ? audit.length : null}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <main className="shell__content">
        {!online && (
          <div className="banner" role="status">
            <span>
              Can't reach the API. Live data is paused — reference workspaces still work.
            </span>
            <button onClick={() => window.location.reload()}>RETRY</button>
          </div>
        )}

        <div className="shell__pane">
          <ErrorBoundary key={current.id} workspace={current.label}>
            <Suspense fallback={<div className="fallback">Loading {current.label}…</div>}>
              {Workspace ? (
                <Workspace />
              ) : (
                <div className="fallback">
                  No component is registered for “{current.id}”. Add one to
                  client/src/tabs/registry.ts.
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      {paletteOpen && (
        <CommandPalette tabs={tabs} onSelect={select} onClose={() => setPaletteOpen(false)} />
      )}
    </div>
  );
}
