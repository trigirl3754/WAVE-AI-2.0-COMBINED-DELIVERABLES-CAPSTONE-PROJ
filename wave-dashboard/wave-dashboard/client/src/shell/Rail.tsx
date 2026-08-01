import { useEffect, useState, type CSSProperties } from 'react';
import { apiEvents, type TabMeta } from '../lib/api';

type Props = {
  tabs: TabMeta[];
  active: string;
  onSelect: (id: string) => void;
  online: boolean;
  openAlerts: number | null;
  auditEvents: number | null;
  onOpenPalette: () => void;
};

export function Rail({
  tabs,
  active,
  onSelect,
  online,
  openAlerts,
  auditEvents,
  onOpenPalette,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Flash the status dot on every API call, so network activity is visible
  // without a spinner sitting in the layout.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onActivity = () => {
      setBusy(true);
      clearTimeout(timer);
      timer = setTimeout(() => setBusy(false), 500);
    };
    apiEvents.addEventListener('activity', onActivity);
    return () => {
      apiEvents.removeEventListener('activity', onActivity);
      clearTimeout(timer);
    };
  }, []);

  return (
    <nav className={`rail${collapsed ? ' rail--collapsed' : ''}`} aria-label="Workspaces">
      <div className="rail__brand">
        <div className="rail__mark" aria-hidden="true">
          W
        </div>
        {!collapsed && (
          <div>
            <div className="rail__wordmark">WAVE AI</div>
            <div className="rail__tagline">COMPLIANCE CONSOLE</div>
          </div>
        )}
      </div>

      {!collapsed && <div className="rail__section">WORKSPACES</div>}

      <div className="rail__nav">
        <div className="rail__wire" aria-hidden="true" />
        {tabs.map((tab, i) => {
          const isActive = tab.id === active;
          const badge = tab.id === 'compliance' ? openAlerts : null;
          return (
            <button
              key={tab.id}
              className="rail__item"
              style={{ '--accent': tab.accent } as CSSProperties}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelect(tab.id)}
              title={collapsed ? `${tab.label} — ${tab.summary}` : tab.summary}
            >
              <span className="rail__node" aria-hidden="true" />
              {!collapsed && <span className="rail__label">{tab.label}</span>}
              {!collapsed && badge ? <span className="rail__badge">{badge}</span> : null}
              {!collapsed && !badge ? <span className="rail__key">⌥{i + 1}</span> : null}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <div className="rail__foot">
          <div className="rail__status">
            <span
              className={`rail__dot${online ? '' : ' rail__dot--down'}${
                busy ? ' rail__dot--busy' : ''
              }`}
              aria-hidden="true"
            />
            <span>{online ? 'API CONNECTED' : 'API UNREACHABLE'}</span>
          </div>

          <div className="rail__stat">
            <span>Open alerts</span>
            <b>{openAlerts ?? '—'}</b>
          </div>
          <div className="rail__stat">
            <span>Audit events</span>
            <b>{auditEvents ?? '—'}</b>
          </div>

          <button className="rail__collapse" onClick={onOpenPalette}>
            SEARCH ⌘K
          </button>
          <button className="rail__collapse" onClick={() => setCollapsed(true)}>
            COLLAPSE
          </button>
        </div>
      )}

      {collapsed && (
        <button
          className="rail__collapse"
          style={{ margin: '10px 8px' }}
          onClick={() => setCollapsed(false)}
          title="Expand the rail"
        >
          ›
        </button>
      )}
    </nav>
  );
}
