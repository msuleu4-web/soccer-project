'use client';

import Link from 'next/link';
import type { GameState } from '../types/game';
import { LEAGUES } from '../lib/leagueData';
import { getLeagueIcon } from '../lib/gameEngine';
import PlayerAvatar from './PlayerAvatar';
import { determineEnding, ENDING_RARITY_COLOR, ENDING_RARITY_LABEL, ENDING_CATEGORY_LABEL } from '../lib/endingSystem';

interface Props {
  state: GameState;
  onRestart: () => void;
}

export default function EndingScreen({ state, onRestart }: Props) {
  const ending = determineEnding(state);
  const rarityColor = ENDING_RARITY_COLOR[ending.rarity];

  const shareText = `Goal Labo 選手育成ゲーム\n${state.playerName} のキャリア\n${ending.emoji} ${ending.title}\nゴール: ${state.totalGoals} | 最終OVR: ${state.ovr}\n#GoalLabo`;

  const conductColor =
    (state.conductScore ?? 100) >= 80 ? '#22c55e' :
    (state.conductScore ?? 100) >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="gl-card text-center py-6 px-4 max-w-lg mx-auto">
      {/* エンディングヘッダー */}
      <div
        className="rounded-2xl px-5 py-4 mb-5 border-2"
        style={{ borderColor: rarityColor, background: `${rarityColor}10` }}
      >
        <div className="text-4xl mb-2">{ending.emoji}</div>
        <div
          className="text-xs font-black tracking-widest uppercase mb-1"
          style={{ color: rarityColor }}
        >
          {ENDING_RARITY_LABEL[ending.rarity]} — {ENDING_CATEGORY_LABEL[ending.category]}
        </div>
        <h2 className="text-xl font-black text-text-primary mb-0.5">{ending.title}</h2>
        <p className="text-sm font-semibold" style={{ color: rarityColor }}>{ending.subtitle}</p>
      </div>

      {/* キャラクター */}
      <div className="flex justify-center mb-4">
        <PlayerAvatar
          ovr={state.ovr}
          league={state.currentLeague}
          position={state.position}
          size={100}
        />
      </div>

      {/* ストーリーテキスト */}
      <div
        className="rounded-xl p-4 mb-5 text-left text-sm leading-relaxed"
        style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-2)', borderLeft: `4px solid ${rarityColor}` }}
      >
        {ending.story}
      </div>

      {/* キャリアスタッツ */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-left">
        {[
          { label: '通算ゴール',   value: state.totalGoals },
          { label: '通算アシスト', value: state.totalAssists },
          { label: '最終OVR',      value: state.ovr },
          { label: '引退年齢',     value: `${state.age}歳` },
          { label: 'シーズン数',   value: state.currentSeason },
          { label: 'ファン数',     value: (state.fans ?? 0).toLocaleString() },
        ].map(item => (
          <div key={item.label} className="gl-card rounded-lg p-3">
            <p className="text-xs text-text-secondary">{item.label}</p>
            <p className="text-xl font-bold text-text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 資産・ライフスタイル */}
      <div className="gl-card rounded-lg p-3 mb-4 text-left">
        <p className="text-xs text-text-secondary mb-2">ライフスタイル記録</p>
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <span className="text-text-secondary">素行スコア</span>
          <span className="font-bold" style={{ color: conductColor }}>{state.conductScore ?? 100}/100</span>
          <span className="text-text-secondary">🏠 所有不動産</span>
          <span className="font-bold text-text-primary">{(state.realEstate ?? []).length}件</span>
          <span className="text-text-secondary">🚗 所有車両</span>
          <span className="font-bold text-text-primary">{(state.vehicles ?? []).length}台</span>
          <span className="text-text-secondary">🍸 キャバクラ</span>
          <span className="font-bold" style={{ color: (state.cabaretCount ?? 0) > 20 ? '#ef4444' : 'var(--fg-1)' }}>
            {state.cabaretCount ?? 0}回
          </span>
        </div>
      </div>

      {/* 最終リーグ */}
      <div className="gl-card rounded-lg p-3 mb-4 text-left">
        <p className="text-xs text-text-secondary mb-1">最終所属</p>
        <p className="font-bold text-text-primary">
          {state.currentTeam.name} ({getLeagueIcon(state.currentLeague)} {LEAGUES[state.currentLeague].name})
        </p>
      </div>

      {/* トロフィー */}
      {state.trophies.length > 0 && (
        <div className="rounded-lg p-3 mb-4 text-left border" style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.4)' }}>
          <p className="text-xs text-yellow-400 font-semibold mb-2">🏆 獲得タイトル</p>
          <ul className="space-y-1">
            {state.trophies.map((t, i) => (
              <li key={i} className="text-xs text-text-secondary">{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 個人賞 */}
      {state.awards.length > 0 && (
        <div className="rounded-lg p-3 mb-5 text-left border" style={{ background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.4)' }}>
          <p className="text-xs text-purple-400 font-semibold mb-2">⭐ 個人賞</p>
          <ul className="space-y-1">
            {state.awards.map((a, i) => (
              <li key={i} className="text-xs text-text-secondary">{a}</li>
            ))}
          </ul>
        </div>
      )}

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
