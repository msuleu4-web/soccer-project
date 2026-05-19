'use client';

import type { GameState, PlayerStats } from '../types/game';
import { STAT_MAX } from '../lib/gameConfig';

interface Props {
  state: GameState;
}

const STAT_LABELS: Record<keyof PlayerStats, string> = {
  shooting:  'シュート',
  passing:   'パス',
  dribbling: 'ドリブル',
  speed:     'スピード',
  stamina:   'スタミナ',
  defense:   'DF',
};

function getBarColor(value: number, max: number): string {
  const pct = value / max;
  if (value > 99)  return '#FFD700'; // 金色：限界突破
  if (pct >= 0.85) return '#a855f7'; // 紫
  if (pct >= 0.70) return '#3b82f6'; // 青
  if (pct >= 0.50) return '#22c55e'; // 緑
  return '#9ca3af';                  // グレー
}

export default function StatsPanel({ state }: Props) {
  const { stats, position } = state;
  const statKeys = Object.keys(stats) as (keyof PlayerStats)[];
  const maxes = STAT_MAX[position];

  return (
    <div className="gl-card mb-4">
      <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wide">能力値</h3>
      <div className="space-y-2.5">
        {statKeys.map(key => {
          const val = stats[key];
          const max = maxes[key];
          const pct = Math.min(100, (val / max) * 100);
          const isSuper = val > 99;

          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-text-secondary w-16 text-right flex-shrink-0">
                {STAT_LABELS[key]}
              </span>

              <div className="flex-1 relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-elevated)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: getBarColor(val, max),
                    boxShadow: isSuper ? '0 0 6px rgba(255,215,0,0.7)' : undefined,
                  }}
                />
              </div>

              <div className="flex items-center gap-1 w-16 justify-end flex-shrink-0">
                <span className={`text-xs font-bold ${isSuper ? 'text-yellow-400' : 'text-text-primary'}`}>
                  {val}
                </span>
                <span className="text-xs text-text-secondary">/{max}</span>
                {isSuper && <span className="text-xs">✨</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[var(--color-border)] flex-wrap">
        {[
          { color: '#FFD700', label: '限界突破' },
          { color: '#a855f7', label: '超一流' },
          { color: '#3b82f6', label: '一流' },
          { color: '#22c55e', label: '標準' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
