'use client';

import type { GameState } from '../types/game';
import type { TrainingType } from '../lib/gameEngine';
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
  mainStat: string;
}

const TRAINING_OPTIONS: TrainingOption[] = [
  {
    type: 'shooting',
    label: 'シュート練習',
    description: 'シュート+3〜5 / パス+1',
    fatigueCost: 15,
    icon: '⚽',
    mainStat: 'shooting',
  },
  {
    type: 'passing',
    label: 'パス練習',
    description: 'パス+3〜5 / ドリブル+1',
    fatigueCost: 10,
    icon: '🎯',
    mainStat: 'passing',
  },
  {
    type: 'dribbling',
    label: 'ドリブル特訓',
    description: 'ドリブル+3〜5 / スピード+1',
    fatigueCost: 15,
    icon: '🏃',
    mainStat: 'dribbling',
  },
  {
    type: 'physical',
    label: 'フィジカル強化',
    description: 'スピード+2〜4 / スタミナ+2〜4',
    fatigueCost: 20,
    icon: '💪',
    mainStat: 'speed',
  },
  {
    type: 'defense',
    label: '守備練習',
    description: 'DF+3〜5 / スタミナ+1',
    fatigueCost: 15,
    icon: '🛡️',
    mainStat: 'defense',
  },
  {
    type: 'rest',
    label: '休息',
    description: '疲労-30',
    fatigueCost: -30,
    icon: '😴',
    mainStat: '',
  },
];

export default function TrainingPanel({ state, onTraining, onSkip }: Props) {
  const isInjured = state.injury > 0;
  const isExhausted = state.fatigue >= 100;
  const streak = state.trainingStreak ?? { type: '', count: 0 };

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
        <div className="mb-3 p-2 rounded-lg text-xs border" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--color-danger, #ef4444)' }}>
          🤕 怪我中です。休息のみ選択できます。
        </div>
      )}

      {isExhausted && !isInjured && (
        <div className="mb-3 p-2 rounded-lg text-xs border" style={{ background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.4)', color: '#ca8a04' }}>
          ⚠️ 疲労が限界です。休息を選んでください。
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {TRAINING_OPTIONS.map(opt => {
          const isDisabled = isInjured
            ? opt.type !== 'rest'
            : isExhausted && opt.type !== 'rest';

          const isHighFatigue =
            !isInjured &&
            !isExhausted &&
            state.fatigue >= GAME_CONFIG.FATIGUE_INJURY_THRESHOLD &&
            opt.type !== 'rest';

          return (
            <button
              key={opt.type}
              disabled={isDisabled}
              onClick={() => onTraining(opt.type)}
              className={`
                relative p-3 rounded-lg border text-left transition-all
                min-h-[60px] group
                ${isDisabled
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer'
                }
              `}
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
                  ? 'rgba(59,130,246,0.08)'
                  : isHighFatigue
                  ? 'rgba(239,68,68,0.08)'
                  : 'var(--bg-surface-elevated)',
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base">{opt.icon}</span>
                <span className="text-xs font-bold text-text-primary">{opt.label}</span>
              </div>
              <p className="text-xs text-text-secondary">{opt.description}</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs text-text-secondary">疲労:</span>
                <span className={`text-xs font-semibold ${
                  opt.fatigueCost < 0 ? 'text-green-400' :
                  opt.fatigueCost >= 20 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {opt.fatigueCost > 0 ? `+${opt.fatigueCost}` : opt.fatigueCost}
                </span>
              </div>
              {isHighFatigue && (
                <span className="text-xs text-red-400 mt-1 block">⚠️ 怪我リスクあり</span>
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
