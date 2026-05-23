'use client';

import { useState, useMemo } from 'react';
import type { GameState, InventoryItem } from '../types/game';
import {
  GACHA_ITEMS, RARITY_COLOR, RARITY_GLOW, RARITY_LABEL, RARITY_STARS,
  PICKUP_COLOR, type GachaItem,
} from '../lib/gachaSystem';

interface Props {
  state: GameState;
  onUse:     (uid: string) => void;
  onDiscard: (uid: string) => void;
  onClose:   () => void;
}

type SortKey = 'rarity' | 'date';
type FilterKey = 'all' | '★3' | '★2' | '★1';

const RARITY_ORDER: Record<string, number> = { '★3': 3, '★2': 2, '★1': 1 };

function itemDetails(itemId: string): GachaItem | undefined {
  return GACHA_ITEMS.find(i => i.id === itemId);
}

function EffectText({ item }: { item: GachaItem }) {
  const e = item.effect;
  const parts: string[] = [];
  if (e.allStats)   parts.push(`全スタット+${e.allStats}`);
  if (e.shooting)   parts.push(`シュート+${e.shooting}`);
  if (e.passing)    parts.push(`パス+${e.passing}`);
  if (e.dribbling)  parts.push(`ドリブル+${e.dribbling}`);
  if (e.speed)      parts.push(`スピード+${e.speed}`);
  if (e.stamina)    parts.push(`スタミナ+${e.stamina}`);
  if (e.defense)    parts.push(`守備+${e.defense}`);
  if (e.morale)     parts.push(`モラル+${e.morale}`);
  if (e.fatigue)    parts.push(`疲労${e.fatigue}`);
  if (e.injury)     parts.push(`怪我${e.injury}`);
  if (e.fans)       parts.push(`ファン+${e.fans.toLocaleString()}`);
  if (e.gachaCoins) parts.push(`+${e.gachaCoins}万円`);
  if (e.ageReduce)  parts.push(`年齢-${e.ageReduce}`);
  if (e.retireAgeBonus) parts.push(`引退延長+${e.retireAgeBonus}年`);
  if (e.ballonDorFlag)  parts.push('バロンドールフラグ');
  if (e.clQualified)    parts.push('CL出場権');
  if (e.skillRandom)    parts.push('スキル解放(ランダム)');
  if (e.conductScore)   parts.push(`素行+${e.conductScore}`);
  if (e.cabaretPenaltyReduce) parts.push(`ペナルティLv-${e.cabaretPenaltyReduce}`);
  return (
    <p className="text-xs font-semibold" style={{ color: 'var(--fg-2)' }}>
      {parts.join(' / ') || '効果なし'}
    </p>
  );
}

export default function InventoryModal({ state, onUse, onDiscard, onClose }: Props) {
  const [sort,   setSort]   = useState<SortKey>('rarity');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [confirmDiscard, setConfirmDiscard] = useState<string | null>(null);

  const inventory = state.inventory ?? [];

  const sorted = useMemo(() => {
    const filtered = filter === 'all'
      ? inventory
      : inventory.filter(inv => {
          const d = itemDetails(inv.itemId);
          return d?.rarity === filter;
        });

    return [...filtered].sort((a, b) => {
      const da = itemDetails(a.itemId);
      const db = itemDetails(b.itemId);
      if (sort === 'rarity') {
        const ra = RARITY_ORDER[da?.rarity ?? '★1'] ?? 0;
        const rb = RARITY_ORDER[db?.rarity ?? '★1'] ?? 0;
        if (rb !== ra) return rb - ra;
      }
      return new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime();
    });
  }, [inventory, sort, filter]);

  // ★3 count for badge
  const star3Count = inventory.filter(inv => itemDetails(inv.itemId)?.rarity === '★3').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '92vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.35)' }}
      >
        {/* ── ヘッダー ── */}
        <div className="px-5 pt-5 pb-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-default)' }}>
          <div>
            <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
              🗃️ アイテム倉庫
              {star3Count > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                  style={{ background: '#eab30825', color: '#eab308' }}>
                  ★3 × {star3Count}
                </span>
              )}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              所持 <span className="font-bold text-text-primary">{inventory.length}</span> 個
              （Supabase 自動保存）
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary"
            style={{ background: 'var(--bg-surface-elevated)' }}>
            ✕
          </button>
        </div>

        {/* ── フィルター / ソート ── */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap border-b"
          style={{ borderColor: 'var(--border-default)' }}>
          {(['all','★3','★2','★1'] as FilterKey[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
              style={{
                background: filter === f
                  ? (f === 'all' ? 'var(--color-brand-green)' : RARITY_COLOR[f] ?? 'var(--color-brand-green)')
                  : 'var(--bg-surface-elevated)',
                color: filter === f ? '#fff' : 'var(--fg-2)',
              }}>
              {f === 'all' ? '全て' : `${RARITY_STARS[f as keyof typeof RARITY_STARS] ?? f} ${RARITY_LABEL[f as keyof typeof RARITY_LABEL] ?? f}`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[10px] text-text-secondary">並替:</span>
            {(['rarity','date'] as SortKey[]).map(s => (
              <button key={s} onClick={() => setSort(s)}
                className="text-[10px] px-2 py-1 rounded font-semibold transition-all"
                style={{
                  background: sort === s ? 'var(--color-accent-green)' : 'var(--bg-surface-elevated)',
                  color:      sort === s ? '#fff' : 'var(--fg-muted)',
                }}>
                {s === 'rarity' ? 'レア順' : '取得順'}
              </button>
            ))}
          </div>
        </div>

        {/* ── リスト ── */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {sorted.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-text-secondary text-sm">
                {filter !== 'all' ? 'このレアリティのアイテムはありません' : 'スカウトでアイテムを集めよう！'}
              </p>
            </div>
          )}

          {sorted.map(inv => {
            const item = itemDetails(inv.itemId);
            if (!item) return null;
            const color = RARITY_COLOR[item.rarity];
            const glow  = RARITY_GLOW[item.rarity];
            const stars = RARITY_STARS[item.rarity];
            const date  = new Date(inv.obtainedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });

            return (
              <div key={inv.uid}
                className="rounded-xl p-3 border transition-all"
                style={{
                  background:  `${color}0a`,
                  borderColor: color,
                  boxShadow:   item.rarity === '★3' ? glow : 'none',
                }}>
                <div className="flex items-start gap-3">
                  {/* アイコン */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${color}20` }}>
                    {item.icon}
                  </div>

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-sm font-black text-text-primary">{item.name}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: `${color}20`, color }}>
                        {stars} {RARITY_LABEL[item.rarity]}
                      </span>
                    </div>
                    <EffectText item={item} />
                    <p className="text-[10px] text-text-secondary mt-0.5">{date} 取得</p>
                  </div>

                  {/* アクション */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onUse(inv.uid)}
                      className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                      style={{ background: color, color: '#fff', boxShadow: item.rarity === '★3' ? glow : 'none' }}
                    >
                      使う
                    </button>
                    <button
                      onClick={() => setConfirmDiscard(inv.uid)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-muted)' }}
                    >
                      捨てる
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t text-center" style={{ borderColor: 'var(--border-default)' }}>
          <p className="text-[10px] text-text-secondary">
            ※ アイテムはゲームセーブと同時にSupabaseに保存されます
          </p>
        </div>
      </div>

      {/* ── 捨てる確認ダイアログ ── */}
      {confirmDiscard && (
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 text-center mx-4 max-w-xs w-full"
            style={{ background: 'var(--bg-card)', border: '2px solid var(--border-default)' }}>
            {(() => {
              const item = itemDetails(inventory.find(i => i.uid === confirmDiscard)?.itemId ?? '');
              return (
                <>
                  <p className="text-3xl mb-2">{item?.icon ?? '📦'}</p>
                  <p className="text-sm font-bold text-text-primary mb-1">{item?.name}</p>
                  <p className="text-xs text-text-secondary mb-4">本当に捨てますか？この操作は取り消せません。</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onDiscard(confirmDiscard); setConfirmDiscard(null); }}
                      className="flex-1 py-2 rounded-xl text-xs font-black"
                      style={{ background: '#ef4444', color: '#fff' }}>
                      捨てる
                    </button>
                    <button
                      onClick={() => setConfirmDiscard(null)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-2)' }}>
                      キャンセル
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
