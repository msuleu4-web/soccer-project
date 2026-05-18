'use client';

import type { MatchEvent } from '@/types/simulator';

const EVENT_ICONS: Record<MatchEvent['type'], string> = {
  goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  save: '🧤',
  chance: '💥',
  substitution: '🔄',
  commentary: '🎙️',
};

export default function MatchTimeline({ events }: { events: MatchEvent[] }) {
  return (
    <div className="gl-card p-5">
      <h3 className="font-bold mb-4">試合経過</h3>
      <div className="space-y-3">
        {events.map((ev, i) => (
          <div
            key={i}
            className={`flex gap-3 p-3 rounded-lg ${
              ev.type === 'goal'
                ? 'bg-[rgba(0,210,106,0.1)] border border-[rgba(0,210,106,0.3)]'
                : 'bg-[var(--bg-surface-elevated)]'
            }`}
          >
            <div className="text-sm font-bold tabular-nums w-12 text-[var(--fg-muted)] pt-0.5">
              {ev.minute}&apos;
            </div>
            <div className="text-xl">{EVENT_ICONS[ev.type]}</div>
            <div className="flex-1 text-sm leading-relaxed">
              {ev.type === 'goal' && ev.scorer && (
                <p className="font-bold mb-0.5">
                  {ev.scorer}{ev.assist && ` (assist: ${ev.assist})`}
                </p>
              )}
              <p>{ev.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
