'use client';

import type { GameState } from '../types/game';
import { getOvrColor, getOvrBgColor, getLeagueIcon } from '../lib/gameEngine';
import { LEAGUES } from '../lib/leagueData';

interface Props {
  state: GameState;
}

const POSITION_ICONS: Record<string, string> = {
  FW: '⚽',
  MF: '🎯',
  DF: '🛡️',
  GK: '🥅',
};

const POSITION_LABELS: Record<string, string> = {
  FW: 'フォワード',
  MF: 'ミッドフィールダー',
  DF: 'ディフェンダー',
  GK: 'ゴールキーパー',
};

export default function PlayerCard({ state }: Props) {
  const ovrColor = getOvrColor(state.ovr);
  const ovrBg = getOvrBgColor(state.ovr);
  const leagueName = LEAGUES[state.currentLeague].name;

  return (
    <div className="gl-card mb-4">
      <div className="flex items-center gap-4">
        {/* OVR Circle */}
        <div className={`w-16 h-16 rounded-full ${ovrBg} flex flex-col items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-semibold leading-tight">OVR</span>
          <span className={`text-white text-2xl font-black leading-tight`}>{state.ovr}</span>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-text-primary truncate">{state.playerName}</h2>
            <span className="text-lg">{POSITION_ICONS[state.position]}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-muted)' }}>
              {state.position} / {POSITION_LABELS[state.position]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-text-secondary text-sm">{state.currentTeam.name}</span>
            <span className="text-text-secondary text-xs">•</span>
            <span className="text-text-secondary text-xs">
              {getLeagueIcon(state.currentLeague)} {leagueName}
            </span>
          </div>
        </div>
      </div>

      {/* Season Stats */}
      <div className="mt-3 pt-3 border-t border-[var(--border-default)] grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-text-secondary">今季ゴール</p>
          <p className="text-lg font-bold text-text-primary">{state.seasonGoals}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">今季アシスト</p>
          <p className="text-lg font-bold text-text-primary">{state.seasonAssists}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">評価点</p>
          <p className="text-lg font-bold text-text-primary">
            {state.matchesPlayed > 0 ? state.seasonRating.toFixed(1) : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
