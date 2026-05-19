'use client';

import type { GameEvent } from '../types/game';

interface Props {
  event: GameEvent;
  onChoice: (index: number) => void;
}

function formatEffect(effect: Record<string, number | undefined>): string {
  const parts: string[] = [];
  if (effect.shooting)  parts.push(`シュート${effect.shooting > 0 ? '+' : ''}${effect.shooting}`);
  if (effect.passing)   parts.push(`パス${effect.passing > 0 ? '+' : ''}${effect.passing}`);
  if (effect.dribbling) parts.push(`ドリブル${effect.dribbling > 0 ? '+' : ''}${effect.dribbling}`);
  if (effect.speed)     parts.push(`スピード${effect.speed > 0 ? '+' : ''}${effect.speed}`);
  if (effect.stamina)   parts.push(`スタミナ${effect.stamina > 0 ? '+' : ''}${effect.stamina}`);
  if (effect.defense)   parts.push(`DF${effect.defense > 0 ? '+' : ''}${effect.defense}`);
  if (effect.morale)    parts.push(`モラル${effect.morale > 0 ? '+' : ''}${effect.morale}`);
  if (effect.money)     parts.push(`${effect.money > 0 ? '+' : ''}${effect.money}万円`);
  if (effect.injury)    parts.push(`怪我${effect.injury > 0 ? '+' : ''}${effect.injury}`);
  return parts.length > 0 ? parts.join(' / ') : '効果なし';
}

export default function EventModal({ event, onChoice }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="gl-card max-w-md w-full animate-slide-up">
        <div className="mb-1">
          <span className="text-xs text-[var(--color-accent)] font-semibold uppercase tracking-wide">
            イベント発生！
          </span>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-3">{event.title}</h2>
        <p className="text-text-secondary text-sm mb-4 leading-relaxed">{event.description}</p>

        <div className="space-y-2">
          {event.choices.map((choice, idx) => {
            const effectStr = formatEffect(choice.effect as Record<string, number | undefined>);
            return (
              <button
                key={idx}
                onClick={() => onChoice(idx)}
                className="w-full text-left p-3 rounded-lg border border-gray-600 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
                style={{ minHeight: '44px' }}
              >
                <p className="text-sm font-semibold text-text-primary">{choice.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{effectStr}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
