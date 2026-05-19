import type { GameState } from '../types/game';
import { generateStandings } from './standingsEngine';

const SAVE_KEY = 'goal-labo-player-game';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // SSRまたはプライベートモードではlocalStorageが利用不可の場合がある
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // 後方互換性: 新フィールドが未設定の場合に補完
    const state: GameState = {
      ...parsed,
      achievements:      parsed.achievements      ?? [],
      fans:              parsed.fans              ?? 0,
      trainingStreak:    parsed.trainingStreak    ?? { type: '', count: 0 },
      lastSeasonSummary: parsed.lastSeasonSummary ?? null,
      showSeasonSummary: parsed.showSeasonSummary ?? false,
      skills:            parsed.skills            ?? [],
      leagueStandings:   parsed.leagueStandings   ?? [],
      seasonAwards:      parsed.seasonAwards      ?? [],
      pendingAwards:     parsed.pendingAwards     ?? [],
    };

    // 既存セーブに順位表がない場合は自動生成
    if (state.leagueStandings.length === 0 && state.gamePhase !== 'setup') {
      state.leagueStandings = generateStandings(state);
    }

    // スタック状態の修復:
    // showSeasonSummary=true & lastSeasonSummary=null → 詰まり解除
    if (state.showSeasonSummary && !state.lastSeasonSummary) {
      state.showSeasonSummary = false;
      if (state.gamePhase !== 'transfer' && state.gamePhase !== 'ending') {
        state.gamePhase = 'transfer';
      }
    }
    // pendingAwards が残ったままゲームが進んでいる場合もクリア
    if ((state.pendingAwards?.length ?? 0) > 0 && state.gamePhase === 'playing' && !state.showSeasonSummary) {
      state.pendingAwards = [];
    }

    return state;
  } catch {
    return null;
  }
}

export function resetGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // 無視
  }
}
