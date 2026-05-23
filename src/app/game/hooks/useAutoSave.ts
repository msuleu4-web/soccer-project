'use client';

import { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import type { SlotId } from '../types/game';
import { saveGame, saveGameToSupabase } from '../lib/saveManager';

const SUPABASE_DEBOUNCE_MS = 15_000;

export function useAutoSave(state: GameState, slotId: SlotId): void {
  const stateRef = useRef(state);
  const slotRef  = useRef(slotId);
  stateRef.current = state;
  slotRef.current  = slotId;

  // localStorage: 状態変更ごとに即保存
  useEffect(() => {
    if (state.gamePhase !== 'setup') {
      saveGame(state, slotId);
    }
  }, [state, slotId]);

  // Supabase: 15秒デバウンス
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.gamePhase === 'setup') return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveGameToSupabase(stateRef.current, slotRef.current);
    }, SUPABASE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, slotId]);

  // ページ離脱時
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stateRef.current.gamePhase !== 'setup') {
        saveGame(stateRef.current, slotRef.current);
        saveGameToSupabase(stateRef.current, slotRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}
