'use client';

import { useState, useEffect } from 'react';
import type { SeasonAward } from '../types/game';
import { RARITY_COLOR, RARITY_LABEL } from '../lib/awardsSystem';

interface Props {
  awards: SeasonAward[];
  playerName: string;
  onClose: () => void;
}

export default function AwardsCeremonyModal({ awards, playerName, onClose }: Props) {
  const [shown, setShown] = useState(0);
  const [spotlightOn, setSpotlightOn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSpotlightOn(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (shown >= awards.length) return;
    const delay = shown === 0 ? 800 : 1200;
    const t = setTimeout(() => setShown(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [shown, awards.length]);

  const currentAward = shown > 0 ? awards[shown - 1] : null;
  const rarityColor = currentAward ? RARITY_COLOR[currentAward.rarity] : '#FFD700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      {/* スポットライト演出 */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: spotlightOn ? 1 : 0,
          background: `radial-gradient(ellipse at 50% 40%, rgba(255,215,0,0.08) 0%, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-md text-center">
        {/* タイトル */}
        <div className="mb-6">
          <p className="text-yellow-400 text-xs tracking-widest uppercase mb-1">
            ★ Season {awards[0]?.season} Awards Ceremony ★
          </p>
          <h2 className="text-2xl font-black text-white">
            {playerName} 選手、受賞おめでとうございます！
          </h2>
        </div>

        {/* 現在表示中のアワード */}
        <div className="relative min-h-[220px] flex items-center justify-center">
          {shown === 0 && (
            <div className="animate-pulse text-5xl">🎊</div>
          )}

          {awards.map((award, idx) => (
            <div
              key={award.id}
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700"
              style={{
                opacity: idx === shown - 1 ? 1 : 0,
                transform: idx === shown - 1 ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
                pointerEvents: idx === shown - 1 ? 'auto' : 'none',
              }}
            >
              {/* アイコン */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4"
                style={{
                  background: `radial-gradient(circle, ${RARITY_COLOR[award.rarity]}33, transparent)`,
                  border: `3px solid ${RARITY_COLOR[award.rarity]}`,
                  boxShadow: `0 0 30px ${RARITY_COLOR[award.rarity]}66`,
                }}
              >
                {award.icon}
              </div>

              {/* レアリティバッジ */}
              <span
                className="text-xs font-bold px-3 py-0.5 rounded-full mb-2"
                style={{
                  background: `${RARITY_COLOR[award.rarity]}22`,
                  color: RARITY_COLOR[award.rarity],
                  border: `1px solid ${RARITY_COLOR[award.rarity]}66`,
                }}
              >
                {RARITY_LABEL[award.rarity]}
              </span>

              {/* 賞名 */}
              <h3
                className="text-2xl font-black mb-1"
                style={{ color: RARITY_COLOR[award.rarity] }}
              >
                {award.name}
              </h3>

              <p className="text-sm text-white/60 mb-1">{award.league}</p>
              <p className="text-sm text-white/80 max-w-xs">{award.description}</p>
            </div>
          ))}
        </div>

        {/* 受賞一覧 (小) */}
        {awards.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
            {awards.map((a, idx) => (
              <div
                key={a.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-300"
                style={{
                  background: idx < shown ? `${RARITY_COLOR[a.rarity]}22` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${idx < shown ? RARITY_COLOR[a.rarity] + '66' : 'rgba(255,255,255,0.1)'}`,
                  opacity: idx < shown ? 1 : 0.3,
                }}
              >
                <span>{a.icon}</span>
                <span style={{ color: idx < shown ? RARITY_COLOR[a.rarity] : '#ffffff' }}>{a.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* ナビゲーション */}
        <div className="flex gap-3 justify-center mt-4">
          {shown < awards.length ? (
            <button
              onClick={() => setShown(v => v + 1)}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white border border-yellow-400/50 hover:border-yellow-400 transition-colors"
              style={{ background: 'rgba(255,215,0,0.1)' }}
            >
              次の賞へ → ({shown}/{awards.length})
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-lg text-sm font-black transition-all"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
              }}
            >
              🎊 シーズンまとめへ →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
