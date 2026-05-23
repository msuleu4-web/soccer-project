import type { GameState, SaveSlot, SaveSlotPreview, EmptySaveSlot } from '../types/game';
import { SLOT_IDS, type SlotId } from '../types/game';
import { generateStandings } from './standingsEngine';
import { TEAMS } from './leagueData';
import { createClient } from '../../../lib/supabase/client';

// ── キー定義 ──────────────────────────────────────────
const SLOT_KEY    = (id: SlotId) => `goal-labo-save-${id}`;
const CURRENT_KEY = 'goal-labo-current-slot';
const LEGACY_KEY  = 'goal-labo-player-game'; // 旧データ後方互換

// ── 後方互換・フィールド補完 ──────────────────────────
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

  // 順位表がリーグと一致しているか検証
  const leagueTeamIds = new Set((TEAMS[state.currentLeague] ?? []).map(t => t.id));
  const standingsMatchLeague =
    state.leagueStandings.length > 0 &&
    state.leagueStandings.some(e => leagueTeamIds.has(e.teamId));

  if (!standingsMatchLeague && state.gamePhase !== 'setup') {
    state.leagueStandings = generateStandings(state);
  }
  // match_dayのままlastMatchResultなしで保存されたデータをリカバリー
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

// ── 現在アクティブなスロット ──────────────────────────
export function getCurrentSlotId(): SlotId {
  try {
    const v = localStorage.getItem(CURRENT_KEY);
    if (v && (SLOT_IDS as readonly string[]).includes(v)) return v as SlotId;
  } catch {}
  return 'slot1';
}

export function setCurrentSlotId(slotId: SlotId): void {
  try { localStorage.setItem(CURRENT_KEY, slotId); } catch {}
}

// ── localStorage（同期・即時） ────────────────────────
export function saveGame(state: GameState, slotId: SlotId): void {
  try { localStorage.setItem(SLOT_KEY(slotId), JSON.stringify(state)); } catch {}
}

export function loadGame(slotId: SlotId): GameState | null {
  try {
    const raw = localStorage.getItem(SLOT_KEY(slotId))
      ?? (slotId === 'slot1' ? localStorage.getItem(LEGACY_KEY) : null);
    if (!raw) return null;
    return applyCompat(JSON.parse(raw) as GameState);
  } catch { return null; }
}

export function resetGame(slotId: SlotId): void {
  try {
    localStorage.removeItem(SLOT_KEY(slotId));
    if (slotId === 'slot1') localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

/** ローカルの全スロットプレビューを取得 */
export function getAllSlotPreviews(): SaveSlot[] {
  return SLOT_IDS.map(slotId => {
    const state = loadGame(slotId);
    if (!state || state.gamePhase === 'setup' || !state.playerName) {
      return { slotId, isEmpty: true } as EmptySaveSlot;
    }
    return {
      slotId,
      isEmpty: false,
      playerName:    state.playerName,
      position:      state.position,
      ovr:           state.ovr,
      age:           state.age,
      currentSeason: state.currentSeason,
      currentLeague: state.currentLeague,
      currentTeam:   state.currentTeam.name,
      totalGoals:    state.totalGoals,
      updatedAt:     new Date().toISOString(),
    } as SaveSlotPreview;
  });
}

// ── Supabase（非同期・永続化） ────────────────────────
export async function saveGameToSupabase(state: GameState, slotId: SlotId): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('game_saves').upsert(
      { user_id: user.id, slot_id: slotId, state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,slot_id' }
    );
  } catch {}
}

export async function loadGameFromSupabase(slotId: SlotId): Promise<GameState | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('game_saves').select('state')
      .eq('user_id', user.id).eq('slot_id', slotId).single();
    if (error || !data) return null;
    return applyCompat(data.state as GameState);
  } catch { return null; }
}

export async function loadAllSlotsFromSupabase(): Promise<SaveSlot[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return SLOT_IDS.map(s => ({ slotId: s, isEmpty: true } as EmptySaveSlot));

    const { data, error } = await supabase
      .from('game_saves').select('slot_id, state, updated_at')
      .eq('user_id', user.id);

    if (error || !data) return SLOT_IDS.map(s => ({ slotId: s, isEmpty: true } as EmptySaveSlot));

    return SLOT_IDS.map(slotId => {
      const row = data.find(d => d.slot_id === slotId);
      if (!row) return { slotId, isEmpty: true } as EmptySaveSlot;
      const state = applyCompat(row.state as GameState);
      if (!state || state.gamePhase === 'setup' || !state.playerName) {
        return { slotId, isEmpty: true } as EmptySaveSlot;
      }
      return {
        slotId, isEmpty: false,
        playerName:    state.playerName,
        position:      state.position,
        ovr:           state.ovr,
        age:           state.age,
        currentSeason: state.currentSeason,
        currentLeague: state.currentLeague,
        currentTeam:   state.currentTeam.name,
        totalGoals:    state.totalGoals,
        updatedAt:     row.updated_at ?? new Date().toISOString(),
      } as SaveSlotPreview;
    });
  } catch {
    return SLOT_IDS.map(s => ({ slotId: s, isEmpty: true } as EmptySaveSlot));
  }
}

export async function resetGameFromSupabase(slotId: SlotId): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('game_saves').delete()
      .eq('user_id', user.id).eq('slot_id', slotId);
  } catch {}
}
