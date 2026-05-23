'use client';

import type { GameState } from '../types/game';
import type { TrainingType } from '../lib/gameEngine';
import { getTrainingSuccessRate } from '../lib/gameEngine';
import { GAME_CONFIG } from '../lib/gameConfig';

interface Props {
  state: GameState;
  onTraining: (type: TrainingType) => void;
  onSkip: () => void;
}

interface TrainingOption {
  type: TrainingType;
  label: string;
  description: string;
  fatigueCost: number;
  icon: string;
}

const TRAINING_OPTIONS: TrainingOption[] = [
  { type: 'shooting',  label: 'シュート練習',   description: 'シュート+1〜3 / パス微増',         fatigueCost: 20, icon: '⚽' },
  { type: 'passing',   label: 'パス練習',        description: 'パス+1〜3 / ドリブル微増',         fatigueCost: 15, icon: '🎯' },
  { type: 'dribbling', label: 'ドリブル特訓',    description: 'ドリブル+1〜3 / スピード微増',     fatigueCost: 20, icon: '🏃' },
  { type: 'physical',  label: 'フィジカル強化',  description: 'スピード+1〜2 / スタミナ+1〜2',    fatigueCost: 28, icon: '💪' },
  { type: 'defense',   label: '守備練習',         description: '守備+1〜3 / スタミナ微増',         fatigueCost: 20, icon: '🛡️' },
  { type: 'rest',      label: '休息',             description: '疲労-30',                          fatigueCost: -30, icon: '😴' },
];

function rateColor(rate: number): string {
  if (rate >= 0.80) return '#22c55e';   // 緑
  if (rate >= 0.60) return '#eab308';   // 黄
  if (rate >= 0.40) return '#f97316';   // オレンジ
  return '#ef4444';                      // 赤
}

function rateLabel(rate: number): string {
  if (rate >= 0.88) return '好調';
  if (rate >= 0.75) return '普通';
  if (rate >= 0.55) return '不調';
  return '危険';
}

export default function TrainingPanel({ state, onTraining, onSkip }: Props) {
  const isInjured   = state.injury > 0;
  const isExhausted = state.fatigue >= 100;
  const streak      = state.trainingStreak ?? { type: '', count: 0 };

  return (
    <div className="gl-card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wide">
          トレーニング
        </h3>
        {streak.count >= 3 && (
          <span className="text-xs font-bold text-orange-400">
            🔥 {streak.count}連続ボーナス！ (+{streak.count >= 5 ? 2 : 1})
          </span>
        )}
      </div>

      {isInjured && (
        <div className="mb-3 p-2 rounded-lg text-xs border"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>
          🤕 怪我中です。休息のみ選択できます。
        </div>
      )}
      {isExhausted && !isInjured && (
        <div className="mb-3 p-2 rounded-lg text-xs border"
          style={{ background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.4)', color: '#ca8a04' }}>
          ⚠️ 疲労が限界です。休息を選んでください。
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {TRAINING_OPTIONS.map(opt => {
          const isDisabled = isInjured
            ? opt.type !== 'rest'
            : isExhausted && opt.type !== 'rest';

          const isHighFatigue =
            !isInjured && !isExhausted &&
            state.fatigue >= GAME_CONFIG.FATIGUE_INJURY_THRESHOLD &&
            opt.type !== 'rest';

          const rate = getTrainingSuccessRate(state.fatigue, state.morale, opt.type);
          const color = rateColor(rate);
          const pct = Math.round(rate * 100);

          return (
            <button
              key={opt.type}
              disabled={isDisabled}
              onClick={() => onTraining(opt.type)}
              className="relative p-3 rounded-lg border text-left transition-all min-h-[72px]"
              style={{
                borderColor: isDisabled
                  ? 'var(--color-border)'
                  : opt.type === 'rest'
                  ? 'rgba(59,130,246,0.5)'
                  : isHighFatigue
                  ? 'rgba(239,68,68,0.5)'
                  : 'var(--color-border)',
                background: isDisabled
                  ? 'var(--bg-surface-elevated)'
                  : opt.type === 'rest'
                  ? 'rgba(59,130,246,0.06)'
                  : isHighFatigue
                  ? 'rgba(239,68,68,0.06)'
                  : 'var(--bg-surface-elevated)',
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {/* アイコン + ラベル */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{opt.icon}</span>
                  <span className="text-xs font-bold text-text-primary">{opt.label}</span>
                </div>
                {/* 成功率バッジ */}
                {opt.type !== 'rest' && !isDisabled && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${color}18`, color }}
                  >
                    {pct}%
                  </span>
                )}
              </div>

              <p className="text-xs text-text-secondary mb-1.5">{opt.description}</p>

              {/* 成功率バー */}
              {opt.type !== 'rest' && !isDisabled && (
                <div className="w-full h-1.5 rounded-full mb-1" style={{ background: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              )}

              {/* 状態ラベル */}
              <div className="flex items-center justify-between">
                {opt.type !== 'rest' && !isDisabled ? (
                  <span className="text-[10px] font-semibold" style={{ color }}>
                    {rateLabel(rate)}
                  </span>
                ) : <span />}
                <span className={`text-[10px] font-semibold ${
                  opt.fatigueCost < 0 ? 'text-blue-400' :
                  opt.fatigueCost >= 20 ? 'text-red-400' : 'text-yellow-500'
                }`}>
                  疲労 {opt.fatigueCost > 0 ? `+${opt.fatigueCost}` : opt.fatigueCost}
                </span>
              </div>

              {isHighFatigue && (
                <span className="text-[10px] text-red-400 block mt-0.5">⚠️ 怪我リスクあり</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onSkip}
        className="mt-3 w-full py-2 text-sm text-text-secondary hover:text-text-primary border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent-green)] transition-colors"
        style={{ minHeight: '44px' }}
      >
        週をスキップ（疲労回復）
      </button>
    </div>
  );
}
