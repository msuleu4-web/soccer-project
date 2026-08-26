import type { GameState } from '../types/game';
import { generateStandings } from './standingsEngine';
import { TEAMS } from './leagueData';

const SAVE_KEY  = 'goal-labo-save-slot1';
const LEGACY_KEY = 'goal-labo-player-game';
const USER_KEY   = 'goal-labo-user-id';

function applyCompat(parsed: GameState): GameState {
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
    purchasedItems:    parsed.purchasedItems    ?? [],
    previousInjury:    parsed.previousInjury    ?? false,
    realEstate:        parsed.realEstate        ?? [],
    vehicles:          parsed.vehicles          ?? [],
    cabaretCount:      parsed.cabaretCount      ?? 0,
    cabaretSeasonCount:parsed.cabaretSeasonCount?? 0,
    cabaretPenaltyLevel:parsed.cabaretPenaltyLevel ?? 0,
    conductScore:      parsed.conductScore      ?? 100,
    isDrugEvent:       parsed.isDrugEvent       ?? false,
    endingId:          parsed.endingId          ?? null,
    clQualified:       parsed.clQualified       ?? false,
    clActive:          parsed.clActive          ?? false,
    clGroupStage:      parsed.clGroupStage      ?? 0,
    clGroupWins:       parsed.clGroupWins       ?? 0,
    clKnockoutRound:   parsed.clKnockoutRound   ?? 0,
    clEliminated:      parsed.clEliminated      ?? false,
    clTrophies:        parsed.clTrophies        ?? 0,
    nationalCaps:      parsed.nationalCaps      ?? 0,
    nationalGoals:     parsed.nationalGoals     ?? 0,
    wcWins:            parsed.wcWins            ?? 0,
    wcActive:          parsed.wcActive          ?? false,
    wcRound:           parsed.wcRound           ?? 0,
    wcGroupWins:       parsed.wcGroupWins       ?? 0,
    wcWinBonus:        parsed.wcWinBonus        ?? false,
    showSeasonReview:  parsed.showSeasonReview  ?? false,
    inventory:         parsed.inventory         ?? [],
    gachaCoins:        parsed.gachaCoins        ?? 0,
    gachaPityStandard: parsed.gachaPityStandard ?? 0,
    gachaPityPickup:   parsed.gachaPityPickup   ?? 0,
    gachaTotalPulls:   parsed.gachaTotalPulls   ?? 0,
    retireAgeBonus:    parsed.retireAgeBonus    ?? 0,
    ballonDorFlag:     parsed.ballonDorFlag     ?? false,
    seasonStartOvr:    parsed.seasonStartOvr    ?? parsed.ovr,
    seasonHatTricks:   parsed.seasonHatTricks   ?? 0,
    money:             parsed.money             ?? 0,
    injury:            parsed.injury            ?? 0,
    fatigue:           parsed.fatigue           ?? 0,
    totalGoals:        parsed.totalGoals        ?? 0,
    totalAssists:      parsed.totalAssists      ?? 0,
    trophies:          parsed.trophies          ?? [],
    awards:            parsed.awards            ?? [],
  };

  const leagueTeamIds = new Set((TEAMS[state.currentLeague] ?? []).map(t => t.id));
  const standingsMatchLeague =
    state.leagueStandings.length > 0 &&
    state.leagueStandings.some(e => leagueTeamIds.has(e.teamId));

  if (!standingsMatchLeague && state.gamePhase !== 'setup') {
    state.leagueStandings = generateStandings(state);
  }
  if (state.gamePhase === 'match_day') {
    state.gamePhase = 'playing';
  }
  if (state.showSeasonSummary && !state.lastSeasonSummary) {
    state.showSeasonSummary = false;
    if (state.gamePhase !== 'transfer' && state.gamePhase !== 'ending') {
      state.gamePhase = 'transfer';
    }
  }
  if ((state.pendingAwards?.length ?? 0) > 0 && state.gamePhase === 'playing' && !state.showSeasonSummary) {
    state.pendingAwards = [];
  }
  return state;
}

// 通常プレイでは絶対に到達できない値を検出してリセットする
// 最大給与(CL想定)×20シーズン×12ヶ月 ≈ 480,000万円 → 1,000,000万以上は不正確定
function isSuspiciousSave(state: GameState): boolean {
  if (state.money > 1_000_000) return true;
  if (state.ovr > 99) return true;
  if (state.age < 17) return true;
  // シーズン1・17歳なのにOVR80超 = 初期値改ざん
  if (state.currentSeason <= 1 && state.age <= 17 && state.ovr >= 80) return true;
  // 試合数に対してゴールが異常 (1試合10点以上の平均)
  if (state.matchesPlayed > 0 && state.totalGoals > state.matchesPlayed * 10) return true;
  return false;
}

export function saveGame(state: GameState): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const state = applyCompat(JSON.parse(raw) as GameState);
    if (isSuspiciousSave(state)) {
      resetGame();
      return null;
    }
    return state;
  } catch { return null; }
}

export function resetGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

// 異なるユーザーがログインしたらセーブをリセットする
// userId が null = 未ログイン（匿名）として扱う
export function checkAndResetForUser(userId: string | null): void {
  try {
    const stored = localStorage.getItem(USER_KEY);
    const current = userId ?? '';
    if (stored !== null && stored !== current) {
      resetGame();
    }
    localStorage.setItem(USER_KEY, current);
  } catch {}
}
