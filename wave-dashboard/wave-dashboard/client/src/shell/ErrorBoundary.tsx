import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; workspace: string };
type State = { error: Error | null };

/**
 * Keeps one broken workspace from taking the whole dashboard down. Resetting
 * is keyed on the workspace name by the parent, so switching tabs clears it.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.workspace}] render failed`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={{ padding: '48px 32px', maxWidth: 640 }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'var(--red)',
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          WORKSPACE FAILED TO RENDER
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
          {this.props.workspace} couldn't be displayed
        </h2>
        <p style={{ color: 'var(--light)', fontSize: 13, lineHeight: 1.7, margin: '0 0 18px' }}>
          The rest of the dashboard is still working — switch to another workspace, or reload to try
          this one again.
        </p>
        <pre
          style={{
            padding: '12px 14px',
            borderRadius: 9,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            fontSize: 11,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            margin: '0 0 18px',
          }}
        >
          {error.message}
        </pre>
        <button
          onClick={() => this.setState({ error: null })}
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            border: '1px solid rgba(0,229,200,0.45)',
            background: 'rgba(0,229,200,0.12)',
            color: 'var(--teal)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}
