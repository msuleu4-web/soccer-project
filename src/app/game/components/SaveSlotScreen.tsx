'use client';

import { useState } from 'react';
import type { SaveSlot, SaveSlotPreview, SlotId } from '../types/game';
import { LEAGUES } from '../lib/leagueData';
import { getLeagueIcon } from '../lib/gameEngine';

interface Props {
  slots: SaveSlot[];
  onSelect: (slotId: SlotId) => void;
  onDelete: (slotId: SlotId) => void;
}

const SLOT_LABEL: Record<SlotId, string> = {
  slot1: 'スロット 1',
  slot2: 'スロット 2',
  slot3: 'スロット 3',
};

const POS_COLOR: Record<string, string> = {
  FW: '#dc2626', MF: '#16a34a', DF: '#1d4ed8', GK: '#ca8a04',
};

function SlotCard({ slot, onSelect, onDelete }: {
  slot: SaveSlot;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (slot.isEmpty) {
    return (
      <button
        onClick={onSelect}
        className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--bg-surface-elevated)',
          minHeight: '160px',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent-green)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
      >
        <div style={{ fontSize: '36px', opacity: 0.3 }}>+</div>
        <div style={{ fontSize: '13px', color: 'var(--fg-2)', fontWeight: 600 }}>
          {SLOT_LABEL[slot.slotId]}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>新しいゲームを開始</div>
      </button>
    );
  }

  const s = slot as SaveSlotPreview;
  const league = LEAGUES[s.currentLeague];
  const posColor = POS_COLOR[s.position] ?? '#6b7280';

  return (
    <div
      className="rounded-2xl border transition-all relative overflow-hidden"
      style={{ borderColor: 'var(--color-border)', background: 'var(--bg-card)', minHeight: '160px' }}
    >
      {/* ポジション帯 */}
      <div style={{ height: '4px', background: posColor, borderRadius: '16px 16px 0 0' }} />

      <div className="p-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: '11px', color: 'var(--fg-muted)', fontWeight: 600 }}>
            {SLOT_LABEL[s.slotId]}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: `${posColor}18`, color: posColor }}
          >
            {s.position}
          </span>
        </div>

        {/* プレイヤー名 + OVR */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-lg font-black text-text-primary leading-tight">{s.playerName}</p>
            <p className="text-xs text-text-secondary">{s.age}歳 · Season {s.currentSeason}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black" style={{ color: s.ovr >= 85 ? '#fbbf24' : s.ovr >= 70 ? '#a78bfa' : 'var(--fg-1)' }}>
              {s.ovr}
            </div>
            <div className="text-[10px] text-text-secondary">OVR</div>
          </div>
        </div>

        {/* リーグ・チーム */}
        <div className="flex items-center gap-1.5 mb-3">
          <span style={{ fontSize: '12px' }}>{getLeagueIcon(s.currentLeague)}</span>
          <span style={{ fontSize: '11px', color: 'var(--fg-2)' }}>{league.name} / {s.currentTeam}</span>
        </div>

        {/* 通算ゴール */}
        <div className="text-xs text-text-secondary mb-3">通算 {s.totalGoals}ゴール</div>

        {/* ボタン */}
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-white"
              style={{ background: '#dc2626' }}
            >
              削除する
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-2)' }}
            >
              キャンセル
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSelect}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-white"
              style={{ background: 'var(--color-brand-green)' }}
            >
              このデータで遊ぶ
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 rounded-lg text-xs"
              style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-muted)' }}
            >
              🗑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SaveSlotScreen({ slots, onSelect, onDelete }: Props) {
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* ロゴ */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-text-primary mb-1">⚽ 選手育成ゲーム</h1>
        <p className="text-sm text-text-secondary">セーブスロットを選んでください</p>
      </div>

      {/* スロット一覧 */}
      <div className="flex flex-col gap-4">
        {slots.map(slot => (
          <SlotCard
            key={slot.slotId}
            slot={slot}
            onSelect={() => onSelect(slot.slotId)}
            onDelete={() => onDelete(slot.slotId)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-text-secondary mt-6">
        最大3人の選手を同時に育成できます
      </p>
    </div>
  );
}
