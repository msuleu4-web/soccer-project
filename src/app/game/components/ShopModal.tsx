'use client';

import { useState } from 'react';
import type { GameState, PlayerStats } from '../types/game';
import { SHOP_ITEMS, CATEGORY_LABEL, CATEGORY_ICON, RARITY_LABEL, RARITY_COLOR, type ItemCategory, type ShopItem } from '../lib/shopItems';

interface Props {
  state: GameState;
  onBuy: (item: ShopItem) => void;
  onClose: () => void;
}

const CATEGORIES: ItemCategory[] = ['equipment', 'recovery', 'training', 'special', 'realestate', 'vehicle', 'entertainment'];

function EffectBadge({ effect }: { effect: ShopItem['effect'] }) {
  const parts: string[] = [];
  const statLabel: Partial<Record<keyof PlayerStats, string>> = {
    shooting: 'シュート', passing: 'パス', dribbling: 'ドリブル',
    speed: 'スピード', stamina: 'スタミナ', defense: '守備',
  };
  (Object.keys(statLabel) as (keyof PlayerStats)[]).forEach(k => {
    const v = effect[k];
    if (v !== undefined && v !== 0) parts.push(`${statLabel[k]}${v > 0 ? '+' : ''}${v}`);
  });
  if (effect.morale)  parts.push(`モラル${effect.morale > 0 ? '+' : ''}${effect.morale}`);
  if (effect.fatigue) parts.push(`疲労${effect.fatigue > 0 ? '+' : ''}${effect.fatigue}`);
  if (effect.injury && effect.injury < 0) parts.push(`怪我${effect.injury}`);
  if (effect.fans)    parts.push(`ファン+${effect.fans.toLocaleString()}`);

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {parts.map((p, i) => {
        const isPositive = p.includes('+') && !p.includes('疲労+') && !p.includes('怪我+');
        const isNegative = p.includes('疲労-') || p.includes('怪我-');
        return (
          <span
            key={i}
            className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
            style={{
              background: isNegative ? 'rgba(34,197,94,0.12)' : isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.10)',
              color: isNegative ? '#16a34a' : isPositive ? '#15803d' : '#dc2626',
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
}

export default function ShopModal({ state, onBuy, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('equipment');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [recentBuy, setRecentBuy] = useState<string | null>(null);

  const purchased = state.purchasedItems ?? [];

  const filtered = SHOP_ITEMS.filter(item => {
    if (item.category !== activeCategory) return false;
    if (item.forPosition && !item.forPosition.includes(state.position)) return false;
    return true;
  });

  const canBuy = (item: ShopItem): { ok: boolean; reason?: string } => {
    if (!item.consumable && purchased.includes(item.id)) return { ok: false, reason: '購入済み' };
    if (state.money < item.price) return { ok: false, reason: '資金不足' };
    if (item.requireOvr && state.ovr < item.requireOvr) return { ok: false, reason: `OVR ${item.requireOvr}以上必要` };
    return { ok: true };
  };

  const handleBuy = (item: ShopItem) => {
    const check = canBuy(item);
    if (!check.ok) return;
    setBuyingId(item.id);
    setTimeout(() => {
      onBuy(item);
      setRecentBuy(item.id);
      setBuyingId(null);
      setTimeout(() => setRecentBuy(null), 1800);
    }, 320);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '90vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.25)' }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div>
            <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
              🛒 ショップ
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              所持金：<span className="font-bold text-text-primary">{state.money.toLocaleString()}万円</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[var(--bg-surface-elevated)] transition-all"
          >
            ✕
          </button>
        </div>

        {/* カテゴリタブ */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-default)' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-1 py-2.5 text-xs font-semibold transition-all"
              style={{
                color: activeCategory === cat ? 'var(--color-accent-green)' : 'var(--fg-2)',
                borderBottom: activeCategory === cat ? '2px solid var(--color-accent-green)' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {CATEGORY_ICON[cat]} {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        {/* アイテムリスト */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-8">
              このポジションで利用できるアイテムはありません
            </p>
          )}
          {filtered.map(item => {
            const { ok, reason } = canBuy(item);
            const isBuying = buyingId === item.id;
            const justBought = recentBuy === item.id;
            const alreadyBought = !item.consumable && purchased.includes(item.id);

            return (
              <div
                key={item.id}
                className="rounded-xl p-4 border transition-all"
                style={{
                  borderColor: alreadyBought ? 'var(--border-default)' : RARITY_COLOR[item.rarity],
                  background: alreadyBought ? 'var(--bg-surface-elevated)' : `${RARITY_COLOR[item.rarity]}08`,
                  boxShadow: !alreadyBought && item.rarity !== 'common' ? `0 0 8px ${RARITY_COLOR[item.rarity]}30` : undefined,
                  opacity: alreadyBought ? 0.6 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'var(--bg-surface-elevated)' }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-text-primary">{item.name}</span>
                          {item.rarity !== 'common' && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-black tracking-wide"
                              style={{ background: `${RARITY_COLOR[item.rarity]}20`, color: RARITY_COLOR[item.rarity] }}
                            >
                              {RARITY_LABEL[item.rarity].toUpperCase()}
                            </span>
                          )}
                          {item.consumable && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(251,191,36,0.15)', color: '#b45309' }}>
                              消耗品
                            </span>
                          )}
                          {alreadyBought && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                              ✓ 購入済
                            </span>
                          )}
                          {item.requireOvr && state.ovr < item.requireOvr && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                              OVR{item.requireOvr}〜
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{item.description}</p>
                        <EffectBadge effect={item.effect} />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-black" style={{ color: ok ? 'var(--color-accent-green)' : 'var(--fg-muted)' }}>
                          {item.price}万円
                        </div>
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!ok || isBuying}
                          className="mt-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: justBought ? 'rgba(34,197,94,0.15)' : ok && !isBuying ? 'var(--color-brand-green)' : 'var(--bg-surface-elevated)',
                            color: justBought ? '#16a34a' : ok && !isBuying ? '#fff' : 'var(--fg-muted)',
                            cursor: ok && !isBuying ? 'pointer' : 'not-allowed',
                            minWidth: '64px',
                          }}
                        >
                          {justBought ? '✓ 購入！' : isBuying ? '...' : reason ?? '購入する'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div className="px-5 py-3 border-t text-center" style={{ borderColor: 'var(--border-default)' }}>
          <p className="text-xs text-text-secondary">
            ※ 消耗品以外のアイテムは一度のみ購入可能です
          </p>
        </div>
      </div>
    </div>
  );
}
