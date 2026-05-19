'use client';

import { useEffect } from 'react';
import type { GameState } from '../types/game';
import { saveGame } from '../lib/saveManager';

export function useAutoSave(state: GameState): void {
  // Save on every state change
  useEffect(() => {
    if (state.gamePhase !== 'setup') {
      saveGame(state);
    }
  }, [state]);

  // Save on page unload
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
