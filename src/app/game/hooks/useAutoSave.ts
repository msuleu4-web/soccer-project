'use client';

import { useEffect } from 'react';
import type { GameState } from '../types/game';
import { saveGame } from '../lib/saveManager';

export function useAutoSave(state: GameState): void {
  // 状態変更ごとに自動保存
  useEffect(() => {
    if (state.gamePhase !== 'setup') {
      saveGame(state);
    }
  }, [state]);

  // ページ離脱時に保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.gamePhase !== 'setup') {
        saveGame(state);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);
}
