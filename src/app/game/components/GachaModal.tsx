'use client';

import { useState } from 'react';
import type { GameState } from '../types/game';
import {
  GACHA_ITEMS, GACHA_META, GACHA_COST, RARITY_COLOR, RARITY_GLOW, RARITY_LABEL, RARITY_STARS,
  PICKUP_COLOR, PICKUP_GLOW, PITY_CAP, getPickupItemId,
  type GachaType, type PullResult,
} from '../lib/gachaSystem';

interface Props {
  state: GameState;
  onPull: (type: GachaType, isMulti: boolean) => PullResult[];
  onClose: () => void;
}

const GACHA_TYPES: GachaType[] = ['standard', 'pickup'];


const RATES_DISPLAY: Record<GachaType, { label: string; rate: string; color: string; sub?: string }[]> = {
  standard: [
    { label: '★★★ ワールドクラス', rate: '3.00%', color: '#eab308' },
    { label: '★★  プロリーグ',    rate: '18.50%', color: '#3b82f6' },
    { label: '★   ユース',        rate: '78.50%', color: '#6b7280' },
  ],
  pickup: [
    { label: '★★★ ピックアップ', rate: '0.70%',  color: '#ef4444' },
    { label: '★★★ 通常',        rate: '2.30%',  color: '#eab308' },
    { label: '★★  プロリーグ',   rate: '18.50%', color: '#3b82f6' },
    { label: '★   ユース',       rate: '78.50%', color: '#6b7280' },
  ],
};

type Phase = 'idle' | 'pulling' | 'result';

function StarDisplay({ rarity, isPickup }: { rarity: string; isPickup: boolean }) {
  const color = isPickup ? PICKUP_COLOR : RARITY_COLOR[rarity as keyof typeof RARITY_COLOR] ?? '#6b7280';
  const stars = RARITY_STARS[rarity as keyof typeof RARITY_STARS] ?? '★';
  return (
    <span className="font-black" style={{ color, textShadow: isPickup ? PICKUP_GLOW : undefined }}>
      {stars}
    </span>
  );
}

function ItemCard({ result, revealed }: { result: PullResult; revealed: boolean }) {
  const { item, isPickup } = result;
  const color = isPickup ? PICKUP_COLOR : RARITY_COLOR[item.rarity];
  const glow  = isPickup ? PICKUP_GLOW  : RARITY_GLOW[item.rarity];
  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center p-2 text-center transition-all duration-500"
      style={{
        background:  revealed ? `${color}18` : 'var(--bg-surface-elevated)',
        border:      `2px solid ${revealed ? color : 'var(--border-default)'}`,
        boxShadow:   revealed ? glow : 'none',
        minHeight:   '90px',
        opacity:     revealed ? 1 : 0.3,
        transform:   revealed ? 'scale(1)' : 'scale(0.8)',
      }}
    >
      {revealed ? (
        <>
          <div className="text-2xl mb-1">{item.icon}</div>
          <div className="text-[9px] font-black mb-0.5">
            <StarDisplay rarity={item.rarity} isPickup={isPickup} />
          </div>
          {isPickup && (
            <div className="text-[8px] font-black px-1 py-0.5 rounded mb-0.5"
              style={{ background: `${PICKUP_COLOR}25`, color: PICKUP_COLOR }}>
              PICKUP
            </div>
          )}
          <div className="text-[10px] font-bold text-text-primary leading-tight px-1">
            {item.name}
          </div>
        </>
      ) : (
        <div className="text-2xl">❓</div>
      )}
    </div>
  );
}

export default function GachaModal({ state, onPull, onClose }: Props) {
  const [activeType, setActiveType] = useState<GachaType>('standard');
  const [phase, setPhase]           = useState<Phase>('idle');
  const [results, setResults]       = useState<PullResult[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showRates, setShowRates]   = useState(false);

  const meta    = GACHA_META[activeType];
  const cost    = GACHA_COST[activeType];
  const money   = state.money ?? 0;
  const pityKey = activeType === 'standard' ? 'gachaPityStandard' : 'gachaPityPickup';
  const pity    = (state[pityKey as keyof typeof state] as number) ?? 0;

  // 今のピックアップアイテム
  const pickupId   = getPickupItemId(state.position, state.currentSeason);
  const pickupItem = GACHA_ITEMS.find(i => i.id === pickupId);

  const handlePull = (isMulti: boolean) => {
    if (money < (isMulti ? cost.multi : cost.single)) return;
    setPhase('pulling');
    setRevealedCount(0);
    setTimeout(() => {
      const pulled = onPull(activeType, isMulti);
      setResults(pulled);
      setPhase('result');
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setRevealedCount(count);
        if (count >= pulled.length) clearInterval(interval);
      }, isMulti ? 200 : 400);
    }, 700);
  };

  const handleReset = () => { setPhase('idle'); setResults([]); setRevealedCount(0); };

  const hasPickup = results.some(r => r.isPickup);
  const hasStar3  = results.some(r => r.item.rarity === '★3');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget && phase !== 'pulling') onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '92vh', boxShadow: '0 -4px 50px rgba(0,0,0,0.45)' }}
      >
        {/* ── ヘッダー ── */}
        <div className="px-5 pt-5 pb-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-default)' }}>
          <div>
            <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
              🔍 スカウト
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              所持金：<span className="font-black text-text-primary">{money.toLocaleString()}万円</span>
            </p>
          </div>
          {phase !== 'pulling' && (
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary"
              style={{ background: 'var(--bg-surface-elevated)' }}>
              ✕
            </button>
          )}
        </div>

        {/* ── タブ ── */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-default)' }}>
          {GACHA_TYPES.map(t => {
            const m = GACHA_META[t];
            return (
              <button key={t} onClick={() => { setActiveType(t); handleReset(); }}
                className="flex-1 py-2.5 text-xs font-bold transition-all"
                style={{
                  color: activeType === t ? m.color : 'var(--fg-2)',
                  borderBottom: activeType === t ? `2px solid ${m.color}` : '2px solid transparent',
                }}>
                {m.emoji} {m.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4">

          {/* ── IDLE ── */}
          {phase === 'idle' && (
            <>
              {/* ピックアップ表示（ピックアップバナー時） */}
              {activeType === 'pickup' && pickupItem && (
                <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
                  style={{ background: `${PICKUP_COLOR}12`, border: `1.5px solid ${PICKUP_COLOR}40` }}>
                  <div className="text-3xl">{pickupItem.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-black text-text-primary">{pickupItem.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-black"
                        style={{ background: `${PICKUP_COLOR}25`, color: PICKUP_COLOR }}>
                        PICKUP 0.70%
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{pickupItem.flavorText}</p>
                  </div>
                </div>
              )}

              {/* ガチャ説明 */}
              <div className="rounded-xl p-3 mb-4 text-xs"
                style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}>
                <p className="text-text-secondary leading-relaxed">{meta.desc}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-bold" style={{ color: meta.color }}>
                    天井まであと <strong>{PITY_CAP - pity}回</strong>
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${(pity / PITY_CAP) * 100}%`, background: meta.color }} />
                  </div>
                  <span className="text-text-secondary text-[10px]">{pity}/{PITY_CAP}</span>
                </div>
              </div>

              {/* 排出率 */}
              <button onClick={() => setShowRates(v => !v)}
                className="w-full text-xs text-text-secondary hover:text-text-primary mb-3 flex items-center gap-1">
                {showRates ? '▼' : '▶'} 排出率を{showRates ? '閉じる' : '見る'}
              </button>
              {showRates && (
                <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--bg-surface-elevated)' }}>
                  {RATES_DISPLAY[activeType].map((r, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span className="font-bold" style={{ color: r.color }}>{r.label}</span>
                      <span className="text-text-secondary font-mono">{r.rate}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-text-secondary mt-2">
                    ※ {PITY_CAP}連で★★★確定。10連の最終枠は★★以上保証。
                  </p>
                </div>
              )}

              {/* プルボタン */}
              <div className="space-y-3 mb-4">
                {/* 1回 */}
                <button onClick={() => handlePull(false)} disabled={money < cost.single}
                  className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-3"
                  style={{
                    background: money >= cost.single ? meta.color : 'var(--bg-surface-elevated)',
                    color:      money >= cost.single ? '#fff' : 'var(--fg-muted)',
                    opacity:    money >= cost.single ? 1 : 0.5,
                  }}>
                  <span>{meta.emoji} 1回スカウト</span>
                  <span className="text-sm opacity-80">{cost.single}万円</span>
                </button>

                {/* 10連 */}
                <button onClick={() => handlePull(true)} disabled={money < cost.multi}
                  className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 relative"
                  style={{
                    background: money >= cost.multi ? meta.color : 'var(--bg-surface-elevated)',
                    color:      money >= cost.multi ? '#fff' : 'var(--fg-muted)',
                    opacity:    money >= cost.multi ? 1 : 0.5,
                  }}>
                  <span>{meta.emoji} 10連スカウト</span>
                  <span className="text-sm opacity-80">{cost.multi}万円</span>
                  <span className="absolute top-1 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    ★★以上確定
                  </span>
                </button>
              </div>

              {/* 不足警告 */}
              {money < cost.single && (
                <p className="text-xs text-center text-red-400">
                  所持金が不足しています。試合や代表戦で稼いでください。
                </p>
              )}

              {/* GC獲得方法→money獲得方法に変更 */}
              <div className="rounded-lg p-3" style={{ background: 'var(--bg-surface-elevated)' }}>
                <p className="text-xs font-bold text-text-secondary mb-2">💰 万円獲得方法</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-secondary">
                  {[
                    ['💼 週給', `${Math.round(state.currentTeam.salary / 4)}万/週`],
                    ['🏆 試合勝利', '+ボーナス'],
                    ['⭐ CLマッチ', '+収入UP'],
                    ['🌍 WCマッチ', '+収入UP'],
                    ['📜 スポンサー', 'イベント'],
                    ['💹 上位リーグ', '給料UP'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span className="text-yellow-400 font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── PULLING ── */}
          {phase === 'pulling' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-5xl mb-4 animate-bounce">{meta.emoji}</div>
              <p className="text-text-secondary text-sm animate-pulse">スカウト中...</p>
            </div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && (
            <>
              {/* 演出バナー */}
              {hasPickup && (
                <div className="rounded-xl p-3 mb-4 text-center font-black text-sm animate-pulse"
                  style={{ background: `${PICKUP_COLOR}20`, border: `2px solid ${PICKUP_COLOR}`, color: PICKUP_COLOR, boxShadow: PICKUP_GLOW }}>
                  🚨 ピックアップ選手獲得！！！
                </div>
              )}
              {!hasPickup && hasStar3 && (
                <div className="rounded-xl p-3 mb-4 text-center font-black text-sm animate-pulse"
                  style={{ background: '#eab30820', border: '2px solid #eab308', color: '#eab308', boxShadow: '0 0 24px #eab30870' }}>
                  ✨ ワールドクラス選手獲得！！
                </div>
              )}

              {/* カードグリッド */}
              <div className={`grid gap-2 mb-4 ${results.length === 1 ? 'grid-cols-1 max-w-[140px] mx-auto' : 'grid-cols-5'}`}>
                {results.map((r, i) => (
                  <ItemCard key={i} result={r} revealed={i < revealedCount} />
                ))}
              </div>

              {/* 詳細リスト */}
              {revealedCount >= results.length && (
                <div className="space-y-2 mb-4">
                  {results.map((r, i) => {
                    const color = r.isPickup ? PICKUP_COLOR : RARITY_COLOR[r.item.rarity];
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2"
                        style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                        <span className="text-xl">{r.item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-text-primary">{r.item.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                              style={{ background: `${color}25`, color }}>
                              <StarDisplay rarity={r.item.rarity} isPickup={r.isPickup} />
                              {r.isPickup ? ' PICKUP' : ` ${RARITY_LABEL[r.item.rarity]}`}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">{r.item.flavorText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {revealedCount >= results.length && (
                <>
                  <div className="rounded-xl p-3 mb-3 text-center text-xs"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a' }}>
                    🗃️ {results.length}個のアイテムを倉庫に保存しました。<br />
                    <span className="opacity-75">倉庫から好きなタイミングで使用できます。</span>
                  </div>
                  <div className="space-y-2">
                    <button onClick={handleReset}
                      className="w-full py-3 rounded-xl font-bold text-sm"
                      style={{ background: meta.color, color: '#fff' }}>
                      もう一度スカウト
                    </button>
                    <button onClick={onClose}
                      className="w-full py-3 rounded-xl font-bold text-sm"
                      style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-2)' }}>
                      閉じる（倉庫で確認）
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
