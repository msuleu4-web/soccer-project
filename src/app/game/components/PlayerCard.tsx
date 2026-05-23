'use client';

import type { GameState } from '../types/game';
import { getOvrColor, getOvrBgColor, getLeagueIcon } from '../lib/gameEngine';
import { LEAGUES } from '../lib/leagueData';
import PlayerAvatar from './PlayerAvatar';

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
  const ovrBg = getOvrBgColor(state.ovr);
  const leagueName = LEAGUES[state.currentLeague].name;

  return (
    <div className="gl-card mb-4">
      <div className="flex items-start gap-4">
        {/* キャラクターアバター + OVRバッジ */}
        <div className="relative flex-shrink-0 flex flex-col items-center">
          <PlayerAvatar
            ovr={state.ovr}
            league={state.currentLeague}
            position={state.position}
            size={80}
          />
          {/* OVRバッジ */}
          <div className={`mt-1 px-2.5 py-0.5 rounded-full text-center ${ovrBg} shadow-md`}>
            <span className="text-white text-xs font-black tracking-wide">OVR {state.ovr}</span>
          </div>
        </div>

        {/* 選手情報 */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-black text-text-primary truncate">{state.playerName}</h2>
            <span className="text-lg">{POSITION_ICONS[state.position]}</span>
          </div>

          <span
            className="text-xs px-2 py-0.5 rounded-full inline-block mb-2"
            style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-muted)' }}
          >
            {state.position} / {POSITION_LABELS[state.position]}
          </span>

          <div className="flex flex-col gap-0.5 text-sm">
            <span className="text-text-secondary font-medium">{state.currentTeam.name}</span>
            <span className="text-text-secondary text-xs">
              {getLeagueIcon(state.currentLeague)} {leagueName}
            </span>
            <span className="text-text-secondary text-xs">
              {state.age}歳 &nbsp;·&nbsp; Season {state.currentSeason}
            </span>
          </div>
        </div>
      </div>

      {/* 今シーズン成績 */}
      <div className="mt-4 pt-3 border-t border-[var(--border-default)] grid grid-cols-3 gap-2 text-center">
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
