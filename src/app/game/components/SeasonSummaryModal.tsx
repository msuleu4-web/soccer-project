'use client';

import type { SeasonSummary } from '../types/game';

interface Props {
  summary: SeasonSummary;
  onClose: () => void;
}

export default function SeasonSummaryModal({ summary, onClose }: Props) {
  const ovrDiff = summary.ovrEnd - summary.ovrStart;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <div
        className="gl-card w-full max-w-sm relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 className="text-xl font-black text-text-primary mb-1 text-center">
          シーズン {summary.season} 終了！
        </h2>
        <p className="text-xs text-text-secondary text-center mb-4">
          {summary.league} / {summary.team}
        </p>

        {/* Season Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">得点</p>
            <p className="text-2xl font-black text-text-primary">{summary.goals}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">アシスト</p>
            <p className="text-2xl font-black text-text-primary">{summary.assists}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">平均評価点</p>
            <p className="text-2xl font-black text-text-primary">{summary.rating.toFixed(1)}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">試合数</p>
            <p className="text-2xl font-black text-text-primary">{summary.matches}</p>
          </div>
        </div>

        {/* OVR Change */}
        <div className="rounded-lg p-3 mb-4 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
          <p className="text-xs text-text-secondary mb-1">総合力 (OVR) の変化</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg font-bold text-text-primary">{summary.ovrStart}</span>
            <span className="text-text-secondary">→</span>
            <span className="text-lg font-bold text-text-primary">{summary.ovrEnd}</span>
            {ovrDiff !== 0 && (
              <span className={`text-sm font-bold ${ovrDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ({ovrDiff > 0 ? '+' : ''}{ovrDiff})
              </span>
            )}
          </div>
        </div>

        {/* Trophies */}
        {summary.trophies.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-text-secondary mb-2 font-semibold uppercase tracking-wide">獲得トロフィー</p>
            <div className="flex flex-col gap-1">
              {summary.trophies.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'rgba(234,179,8,0.1)', borderLeft: '3px solid #eab308' }}
                >
                  🏆 {t}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="gl-btn gl-btn-accent w-full font-bold"
          style={{ minHeight: '48px' }}
        >
          次のシーズンへ →
        </button>
      </div>
    </div>
  );
}
