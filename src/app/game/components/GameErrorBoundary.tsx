'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class GameErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[GameErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="gl-card mt-4 p-6 text-center space-y-4">
          <p className="text-2xl">⚠️</p>
          <p className="text-text-primary font-bold">ゲームの読み込みに失敗しました</p>
          <p className="text-text-secondary text-sm font-mono break-all">
            {this.state.error.message}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="gl-btn gl-btn-accent"
          >
            ページを再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
