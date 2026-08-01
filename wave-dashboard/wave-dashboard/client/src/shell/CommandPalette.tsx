import { useEffect, useMemo, useRef, useState } from 'react';
import type { TabMeta } from '../lib/api';

type Props = {
  tabs: TabMeta[];
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function CommandPalette({ tabs, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tabs;
    return tabs.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q)
    );
  }, [query, tabs]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && matches[cursor]) {
      onSelect(matches[cursor].id);
    }
  }

  return (
    <div
      className="palette__scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Jump to a workspace"
    >
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Jump to a workspace…"
          aria-label="Search workspaces"
        />

        <div className="palette__list">
          {matches.length === 0 ? (
            <div className="palette__empty">
              Nothing matches “{query}”. Try a workspace name or a source file.
            </div>
          ) : (
            matches.map((tab, i) => (
              <button
                key={tab.id}
                className="palette__row"
                data-active={i === cursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => onSelect(tab.id)}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: tab.accent,
                  }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{tab.label}</span>
                  <small>{tab.summary}</small>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9.5,
                    color: 'var(--muted)',
                    flexShrink: 0,
                  }}
                >
                  ⌥{tab.order + 1}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="palette__hint">
          <span>↑↓ MOVE</span>
          <span>↵ OPEN</span>
          <span>ESC CLOSE</span>
        </div>
      </div>
    </div>
  );
}
