'use client';

import { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import { saveGame } from '../lib/saveManager';

export function useAutoSave(state: GameState): void {
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state.gamePhase !== 'setup') {
      saveGame(state);
    }
  }, [state]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stateRef.current.gamePhase !== 'setup') {
        saveGame(stateRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}
