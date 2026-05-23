'use client';

import type { SeasonSummary, PlayerStats } from '../types/game';
import PlayerAvatar from './PlayerAvatar';

interface Props {
  summary: SeasonSummary;
  onClose: () => void;
}

function getStage(ovr: number) {
  if (ovr >= 95) return 6;
  if (ovr >= 85) return 5;
  if (ovr >= 75) return 4;
  if (ovr >= 65) return 3;
  if (ovr >= 55) return 2;
  return 1;
}

const STAGE_LABEL = ['', 'ルーキー', 'アマチュア', 'セミプロ', 'プロ選手', 'スター', 'レジェンド'];
const STAGE_COLOR = ['', '#9ca3af', '#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#fbbf24'];

export default function SeasonSummaryModal({ summary, onClose }: Props) {
  const ovrDiff    = summary.ovrEnd - summary.ovrStart;
  const stageStart = getStage(summary.ovrStart);
  const stageEnd   = getStage(summary.ovrEnd);
  const levelUp    = stageEnd > stageStart;
  const leagueId   = summary.leagueId ?? null;
  const position   = summary.position ?? null;
  const hasAvatar  = leagueId !== null && position !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)' }}
    >
      <div
        className="gl-card w-full max-w-sm relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 className="text-xl font-black text-text-primary mb-0.5 text-center">
          シーズン {summary.season} 終了！
        </h2>
        <p className="text-xs text-text-secondary text-center mb-4">
          {summary.league} / {summary.team}
        </p>

        {/* ── キャラクター成長ビジュアル ── */}
        {hasAvatar && (<div className="flex items-end justify-center gap-4 mb-5">
          {/* シーズン前 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-secondary">シーズン前</span>
            <div className="opacity-55">
              <PlayerAvatar
                ovr={summary.ovrStart}
                league={leagueId!}
                position={position!}
                size={60}
                showLabel={false}
              />
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${STAGE_COLOR[stageStart]}22`,
                color: STAGE_COLOR[stageStart],
                border: `1px solid ${STAGE_COLOR[stageStart]}55`,
              }}
            >
              {STAGE_LABEL[stageStart]}
            </span>
          </div>

          {/* 矢印 + OVR変化 */}
          <div className="flex flex-col items-center gap-1 pb-4">
            {levelUp && (
              <span className="text-yellow-400 text-sm font-black animate-bounce">LEVEL UP!</span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-text-secondary text-lg font-bold">{summary.ovrStart}</span>
              <span className="text-2xl">→</span>
              <span className="text-text-primary text-xl font-black">{summary.ovrEnd}</span>
            </div>
            {ovrDiff !== 0 && (
              <span className={`text-sm font-bold ${ovrDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ({ovrDiff > 0 ? '+' : ''}{ovrDiff})
              </span>
            )}
          </div>

          {/* シーズン後 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-secondary">シーズン後</span>
            <PlayerAvatar
              ovr={summary.ovrEnd}
              league={leagueId!}
              position={position!}
              size={60}
              showLabel={false}
            />
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${STAGE_COLOR[stageEnd]}22`,
                color: STAGE_COLOR[stageEnd],
                border: `1px solid ${STAGE_COLOR[stageEnd]}55`,
              }}
            >
              {STAGE_LABEL[stageEnd]}
            </span>
          </div>
        </div>)}

        {/* ── シーズン成績 ── */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">得点</p>
            <p className="text-2xl font-black text-text-primary">{summary.goals}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">アシスト</p>
            <p className="text-2xl font-black text-text-primary">{summary.assists}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">平均評価点</p>
            <p className="text-2xl font-black text-text-primary">{summary.rating.toFixed(1)}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface-elevated)' }}>
            <p className="text-xs text-text-secondary">試合数</p>
            <p className="text-2xl font-black text-text-primary">{summary.matches}</p>
          </div>
        </div>

        {/* ── 獲得トロフィー ── */}
        {summary.trophies.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-text-secondary mb-2 font-semibold uppercase tracking-wide">
              獲得トロフィー
            </p>
            <div className="flex flex-col gap-1">
              {summary.trophies.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'rgba(234,179,8,0.1)', borderLeft: '3px solid #eab308' }}
                >
                  🏆 {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 加齢スタット減少 ── */}
        {summary.agingDecay && Object.keys(summary.agingDecay).length > 0 && (
          <div className="mb-4 rounded-xl p-3 border" style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <p className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1.5">
              📉 加齢によるスタット低下
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(summary.agingDecay) as [keyof PlayerStats, number][]).map(([key, val]) => {
                const label: Record<keyof PlayerStats, string> = {
                  shooting: 'シュート', passing: 'パス', dribbling: 'ドリブル',
                  speed: 'スピード', stamina: 'スタミナ', defense: '守備',
                };
                return (
                  <span key={key} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                    {label[key]} -{val}
                  </span>
                );
              })}
            </div>
            <p className="text-[10px] text-text-secondary mt-1.5">
              ピーク年齢(27歳)を過ぎると毎シーズン能力が低下します。
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="gl-btn gl-btn-accent w-full font-bold"
          style={{ minHeight: '48px' }}
        >
          次のシーズンへ →
        </button>
      </div>
    </div>
  );
}
