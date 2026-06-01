'use client';

import type { GameState } from '../types/game';
import { LEAGUES } from '../lib/leagueData';
import { getLeagueIcon } from '../lib/gameEngine';

interface Props {
  state: GameState;
}

export default function GameHeader({ state }: Props) {
  const league = LEAGUES[state.currentLeague];

  return (
    <div className="gl-card mb-4 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-text-primary">
            {getLeagueIcon(state.currentLeague)} {league.name}
          </span>
          <span className="text-text-secondary">
            Week <span className="font-bold text-text-primary">{state.currentWeek}</span> / 38
          </span>
          <span className="text-text-secondary">
            Season <span className="font-bold text-text-primary">{state.currentSeason}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-text-secondary flex items-center gap-1">
            {state.money < 0 ? '🚨' : '💰'}
            <span className={`font-bold ${state.money < 0 ? 'text-red-400' : 'text-text-primary'}`}>
              {state.money.toLocaleString()}万円
            </span>
            <span className="text-xs text-green-500 font-semibold">
              +{Math.round(state.currentTeam.salary / 4)}万/週
            </span>
            {state.money < 0 && (
              <span className="text-xs text-red-400 font-semibold">借金中</span>
            )}
          </span>
          <span className="text-text-secondary">
            👥 <span className="font-bold text-text-primary">{(state.fans ?? 0).toLocaleString()}人</span>
          </span>
          <span className="text-text-secondary">
            年齢: <span className="font-bold text-text-primary">{state.age}歳</span>
          </span>
        </div>
      </div>
      <div className="mt-2 flex gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span>疲労</span>
          <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${state.fatigue}%`,
                background: state.fatigue >= 80 ? '#ef4444' : state.fatigue >= 50 ? '#eab308' : '#22c55e',
              }}
            />
          </div>
          <span>{state.fatigue}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span>モラル</span>
          <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${state.morale}%`, background: '#3b82f6' }}
            />
          </div>
          <span>{state.morale}%</span>
        </div>
        {state.injury > 0 && (
          <span className="text-xs text-red-400 font-semibold">🤕 怪我中 ({state.injury})</span>
        )}
        {state.money < 0 && (
          <span className="text-xs text-red-400">
            💸 借金中：毎週モラル-{Math.min(10, Math.floor(Math.abs(state.money) / 50) + 3)}
          </span>
        )}
      </div>
    </div>
  );
}
