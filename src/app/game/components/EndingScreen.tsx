'use client';

import Link from 'next/link';
import type { GameState } from '../types/game';
import { getCareerRank } from '../lib/gameEngine';
import { LEAGUES } from '../lib/leagueData';
import { getLeagueIcon } from '../lib/gameEngine';

interface Props {
  state: GameState;
  onRestart: () => void;
}

const RANK_COLORS: Record<string, string> = {
  S: 'text-yellow-400 border-yellow-400',
  A: 'text-purple-400 border-purple-400',
  B: 'text-blue-400 border-blue-400',
  C: 'text-green-400 border-green-400',
  D: 'text-gray-400 border-gray-400',
};

export default function EndingScreen({ state, onRestart }: Props) {
  const { rank, description } = getCareerRank(state);
  const rankColor = RANK_COLORS[rank] ?? RANK_COLORS.D;

  const shareText = `Goal Labo 選手育成ゲーム\n${state.playerName} のキャリア\n最終OVR: ${state.ovr} | ${LEAGUES[state.currentLeague].name}\nゴール: ${state.totalGoals} | アシスト: ${state.totalAssists}\n評価: ${rank}ランク\n#GoalLabo`;

  return (
    <div className="gl-card text-center py-6 px-4">
      <h2 className="text-2xl font-black text-text-primary mb-1">キャリア終了</h2>
      <p className="text-text-secondary text-sm mb-4">
        {state.age}歳で{state.playerName}は引退を決意した。
      </p>

      {/* Rank */}
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 mb-4 ${rankColor}`}>
        <span className={`text-4xl font-black ${rankColor.split(' ')[0]}`}>{rank}</span>
      </div>
      <p className="text-sm text-text-secondary mb-6 px-4">{description}</p>

      {/* Career Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-left">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary">通算ゴール</p>
          <p className="text-2xl font-bold text-text-primary">{state.totalGoals}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary">通算アシスト</p>
          <p className="text-2xl font-bold text-text-primary">{state.totalAssists}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary">最終OVR</p>
          <p className="text-2xl font-bold text-text-primary">{state.ovr}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary">シーズン数</p>
          <p className="text-2xl font-bold text-text-primary">{state.currentSeason}</p>
        </div>
      </div>

      {/* Final League */}
      <div className="bg-gray-800/50 rounded-lg p-3 mb-4 text-left">
        <p className="text-xs text-text-secondary mb-1">最終所属チーム</p>
        <p className="font-bold text-text-primary">
          {state.currentTeam.name} ({getLeagueIcon(state.currentLeague)} {LEAGUES[state.currentLeague].name})
        </p>
      </div>

      {/* Trophies */}
      {state.trophies.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mb-4 text-left">
          <p className="text-xs text-yellow-400 font-semibold mb-2">🏆 獲得タイトル</p>
          <ul className="space-y-1">
            {state.trophies.map((t, i) => (
              <li key={i} className="text-xs text-text-secondary">{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Awards */}
      {state.awards.length > 0 && (
        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-3 mb-4 text-left">
          <p className="text-xs text-purple-400 font-semibold mb-2">⭐ 個人賞</p>
          <ul className="space-y-1">
            {state.awards.map((a, i) => (
              <li key={i} className="text-xs text-text-secondary">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onRestart}
          className="gl-btn gl-btn-primary w-full"
          style={{ minHeight: '44px' }}
        >
          もう一度プレイ
        </button>
        <Link
          href="/board"
          className="gl-btn w-full block text-center"
          style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          掲示板で共有する 📢
        </Link>
      </div>
    </div>
  );
}
