'use client';

import type { GameState } from '../types/game';
import { LEAGUES, LEAGUE_ORDER } from '../lib/leagueData';
import { GAME_CONFIG } from '../lib/gameConfig';
import { getLeagueIcon } from '../lib/gameEngine';

interface Props {
  state: GameState;
}

export default function LeagueProgress({ state }: Props) {
  const currentIdx = LEAGUE_ORDER.indexOf(state.currentLeague);
  const nextLeagueId = LEAGUE_ORDER[currentIdx + 1] ?? null;
  const nextLeague = nextLeagueId ? LEAGUES[nextLeagueId] : null;
  const nextThreshold = nextLeagueId ? GAME_CONFIG.TRANSFER_THRESHOLDS[nextLeagueId] : null;

  const progressToNext = nextThreshold
    ? Math.min(100, Math.round((state.ovr / nextThreshold) * 100))
    : 100;

  return (
    <div className="gl-card mb-4">
      <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wide">
        リーグ進捗
      </h3>

      {/* Current League */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{getLeagueIcon(state.currentLeague)}</span>
        <div>
          <p className="text-sm font-bold text-text-primary">{LEAGUES[state.currentLeague].name}</p>
          <p className="text-xs text-text-secondary">Season {state.currentSeason}</p>
        </div>
      </div>

      {/* League Path */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {LEAGUE_ORDER.map((lid, idx) => (
          <div key={lid} className="flex items-center gap-1">
            <div className={`
              flex flex-col items-center px-1.5 py-1 rounded text-xs
              ${lid === state.currentLeague
                ? 'bg-[var(--color-accent)] text-black font-bold'
                : idx < currentIdx
                ? 'bg-green-800 text-green-300'
                : 'bg-gray-700 text-gray-400'}
            `}>
              <span>{getLeagueIcon(lid)}</span>
            </div>
            {idx < LEAGUE_ORDER.length - 1 && (
              <span className="text-gray-600 text-xs">›</span>
            )}
          </div>
        ))}
      </div>

      {/* Next League Progress */}
      {nextLeague && nextThreshold ? (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-secondary">
              次のステップ: {getLeagueIcon(nextLeagueId!)} {nextLeague.name}
            </span>
            <span className="text-text-secondary">
              必要OVR: <span className={state.ovr >= nextThreshold ? 'text-green-400 font-bold' : 'text-text-primary font-bold'}>
                {nextThreshold}
              </span>
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressToNext >= 100 ? 'bg-green-400' : 'bg-[var(--color-accent)]'
              }`}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-text-secondary">
            <span>OVR {state.ovr}</span>
            <span>{progressToNext}%</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <span className="text-yellow-400 font-bold text-sm">👑 最高リーグ到達！</span>
        </div>
      )}
    </div>
  );
}
