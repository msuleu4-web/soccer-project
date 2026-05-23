'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Position, PlayerStats, TransferOffer, SeasonSummary, SaveSlot } from '../types/game';
import { SLOT_IDS, type SlotId } from '../types/game';
import { GAME_CONFIG, STAT_MAX } from '../lib/gameConfig';
import { calculateOVR, applyTraining, simulateMatch, generateTransferOffers, shouldMatchOccur, generateHighlights } from '../lib/gameEngine';
import type { TrainingType, TrainingOutcome } from '../lib/gameEngine';
import { getRandomEvent } from '../lib/eventSystem';
import { TEAMS, LEAGUES } from '../lib/leagueData';
import {
  saveGame as saveGameFn, loadGame as loadGameFn, resetGame as resetGameFn,
  saveGameToSupabase, loadGameFromSupabase, resetGameFromSupabase,
  getAllSlotPreviews, loadAllSlotsFromSupabase,
  getCurrentSlotId, setCurrentSlotId,
} from '../lib/saveManager';
import { checkAchievements, ACHIEVEMENTS } from '../lib/achievements';
import { checkSeasonAwards } from '../lib/awardsSystem';
import { checkNewSkills, SKILLS } from '../lib/skills';
import type { ShopItem } from '../lib/shopItems';
import { generateStandings, updateStandings } from '../lib/standingsEngine';
import { determineEnding } from '../lib/endingSystem';
import {
  pullSingle, pullMulti, applyGachaItem, calcMatchGC, calcSeasonGC,
  GACHA_ITEMS, GACHA_COST,
  type GachaType, type PullResult,
} from '../lib/gachaSystem';
import {
  isTeamInTop3, isEuropeanLeague,
  isCLGroupWeek, isCLR16Week, isCLQFWeek, isCLSFWeek, isCLFinalWeek,
  isNationalWeek, isWCYear, qualifiesForWC,
  simulateIntlMatch,
} from '../lib/internationalSystem';

// キャバクラ訪問回数からペナルティレベルを計算
function calcCabaretPenalty(count: number): number {
  if (count < 5)  return 0;
  if (count < 15) return 1;
  if (count < 30) return 2;
  if (count < 50) return 3;
  if (count < 75) return 4;
  return 5;
}

// ペナルティレベルに応じたスタット減少量（1週ごと）
function cabaretStatDecay(level: number): Partial<PlayerStats> {
  if (level <= 1) return {};
  if (level === 2) return { stamina: -2, speed: -1 };
  if (level === 3) return { stamina: -5, speed: -3, shooting: -2, dribbling: -2 };
  if (level === 4) return { stamina: -10, speed: -6, shooting: -5, dribbling: -5, passing: -3 };
  return { stamina: -18, speed: -10, shooting: -8, dribbling: -8, passing: -6, defense: -4 };
}

// 引退年齢の上限計算（基準35、最大45）
function calcMaxRetirementAge(s: GameState): number {
  let bonus = 0;
  if ((s.conductScore ?? 100) >= 80 && (s.cabaretCount ?? 0) <= 5) bonus += 3;
  else if ((s.conductScore ?? 100) >= 60) bonus += 1;
  if ((s.realEstate ?? []).length >= 1) bonus += 1;
  if ((s.realEstate ?? []).length >= 3) bonus += 1;
  if (s.injury === 0 && s.fatigue <= 40) bonus += 2;
  if ((s.skills ?? []).includes('iron_body')) bonus += 2;
  bonus += Math.min(10, s.retireAgeBonus ?? 0); // ガチャボーナス（最大+10）
  return Math.min(45, GAME_CONFIG.RETIREMENT_AGE + bonus);
}

// 加齢によるスタット減少（ピーク年齢27歳以降）
function calcAgingDecay(stats: import('../types/game').PlayerStats, newAge: number, position: Position): Partial<import('../types/game').PlayerStats> {
  if (newAge <= 27) return {};
  const ypp = newAge - 27; // years past peak

  const decay: Partial<import('../types/game').PlayerStats> = {};
  const d = (key: keyof import('../types/game').PlayerStats, amount: number) => {
    const v = Math.max(0, Math.min(stats[key], Math.round(amount)));
    if (v > 0) decay[key] = v;
  };

  // スピード・スタミナは最も早く衰える（GK/DFは半減）
  const physMult = (position === 'GK' || position === 'DF') ? 0.5 : 1;
  d('speed',   ypp * 2 * physMult);
  d('stamina', ypp * 1.5 * physMult);

  // 技術系は30歳以降から衰える
  if (ypp >= 3) {
    d('shooting',  (ypp - 2) * 1.5);
    d('dribbling', (ypp - 2) * 1.2);
    d('passing',   (ypp - 2) * 0.8);
  }

  // DF/GKの守備は33歳から
  if ((position === 'DF' || position === 'GK') && ypp >= 6) {
    d('defense', (ypp - 5) * 1.0);
  } else if (position !== 'DF' && position !== 'GK' && ypp >= 4) {
    d('defense', (ypp - 3) * 0.5);
  }

  return decay;
}

function buildInitialState(name: string, position: Position, startTeam?: import('../types/game').Team): GameState {
  const stats = { ...GAME_CONFIG.INITIAL_STATS[position] };
  const team = startTeam ?? TEAMS.regional[0];
  const initialOvr = calculateOVR(stats, position);
  return {
    playerName: name,
    position,
    age: 17,
    stats,
    ovr: initialOvr,
    currentWeek: 1,
    currentSeason: 1,
    currentLeague: 'regional',
    currentTeam: team,
    seasonGoals: 0,
    seasonAssists: 0,
    seasonHatTricks: 0,
    seasonRating: 0,
    matchesPlayed: 0,
    morale: 70,
    money: 0,
    injury: 0,
    fatigue: 0,
    totalGoals: 0,
    totalAssists: 0,
    trophies: [],
    awards: [],
    gamePhase: 'playing',
    isNewGame: false,
    previousInjury: false,
    seasonStartOvr: initialOvr,
    achievements: [],
    fans: 0,
    trainingStreak: { type: '', count: 0 },
    lastSeasonSummary: null,
    showSeasonSummary: false,
    skills: [],
    leagueStandings: [],
    seasonAwards: [],
    pendingAwards: [],
    purchasedItems: [],
    realEstate: [],
    vehicles: [],
    cabaretCount: 0,
    cabaretSeasonCount: 0,
    cabaretPenaltyLevel: 0,
    conductScore: 100,
    isDrugEvent: false,
    endingId: null,
    clQualified: false,
    clActive: false,
    clGroupStage: 0,
    clGroupWins: 0,
    clKnockoutRound: 0,
    clEliminated: false,
    clTrophies: 0,
    nationalCaps: 0,
    nationalGoals: 0,
    wcWins: 0,
    wcActive: false,
    wcRound: 0,
    wcGroupWins: 0,
    wcWinBonus: false,
    showSeasonReview: false,
    inventory: [],
    gachaCoins: 0,
    gachaPityStandard: 0,
    gachaPityPickup: 0,
    gachaTotalPulls: 0,
    retireAgeBonus: 0,
    ballonDorFlag: false,
  };
}

export interface GameActions {
  trainingFeedback: TrainingFeedback | null;
  currentSlotId: SlotId | null;
  allSlots: SaveSlot[];
  selectSlot: (slotId: SlotId) => Promise<void>;
  returnToSlotSelect: () => void;
  startNewGame: (name: string, position: Position, teamId?: string) => void;
  selectTraining: (type: TrainingType) => void;
  skipWeek: () => void;
  acceptTransfer: (offer: TransferOffer) => void;
  declineTransfer: () => void;
  resolveEvent: (choiceIndex: number) => void;
  advanceMatch: () => void;
  startNewSeason: () => void;
  continueFromMatch: () => void;
  restartGame: () => void;
  dismissTransfer: () => void;
  dismissSeasonSummary: () => void;
  dismissSeasonReview: () => void;
  dismissPendingAwards: () => void;
  buyItem: (item: ShopItem) => void;
  pullGacha: (type: GachaType, isMulti: boolean) => PullResult[];
  lastGachaResults: PullResult[];
  useInventoryItem: (uid: string) => void;
  discardInventoryItem: (uid: string) => void;
}

export interface TrainingFeedback {
  outcome: TrainingOutcome;
  message: string;
}

export interface GameStateExtended {
  state: GameState;
  pendingEvent: ReturnType<typeof getRandomEvent>;
  pendingTransferOffers: TransferOffer[];
  lastMatchResult: ReturnType<typeof simulateMatch> | null;
  highlights: string[];
  notification: string | null;
  newUnlocks: string[];
  trainingFeedback: TrainingFeedback | null;
  currentSlotId: SlotId | null;
  allSlots: SaveSlot[];
}

export function useGameState(): GameStateExtended & GameActions {
  // useState の遅延初期化で loadGame() をレンダーごとに呼ばないようにする
  // ── スロット管理 ──────────────────────────────────────
  const activeSlotRef = useRef<SlotId>('slot1');
  const [currentSlotId, setCurrentSlotIdState] = useState<SlotId | null>(null);
  const [allSlots, setAllSlots] = useState<SaveSlot[]>(
    SLOT_IDS.map(s => ({ slotId: s, isEmpty: true }))
  );

  // スロット対応の saveGame ラッパー（ref を使うので常に最新スロットに書き込む）
  const saveGame = useCallback((s: GameState) => saveGameFn(s, activeSlotRef.current), []);
  const loadGame  = useCallback((slotId: SlotId) => loadGameFn(slotId), []);
  const resetGame = useCallback((slotId: SlotId) => resetGameFn(slotId), []);

  const EMPTY_STATE: GameState = {
    playerName: '',
    position: 'FW',
    age: 17,
    stats: GAME_CONFIG.INITIAL_STATS.FW,
    ovr: calculateOVR(GAME_CONFIG.INITIAL_STATS.FW, 'FW'),
    currentWeek: 1,
    currentSeason: 1,
    currentLeague: 'regional',
    currentTeam: TEAMS.regional[0],
    seasonGoals: 0,
    seasonAssists: 0,
    seasonHatTricks: 0,
    seasonRating: 0,
    matchesPlayed: 0,
    morale: 70,
    money: 0,
    injury: 0,
    fatigue: 0,
    totalGoals: 0,
    totalAssists: 0,
    trophies: [],
    awards: [],
    gamePhase: 'setup',
    isNewGame: true,
    previousInjury: false,
    achievements: [],
    fans: 0,
    trainingStreak: { type: '', count: 0 },
    lastSeasonSummary: null,
    showSeasonSummary: false,
    skills: [],
    leagueStandings: [],
    seasonAwards: [],
    pendingAwards: [],
    purchasedItems: [],
    realEstate: [],
    vehicles: [],
    cabaretCount: 0,
    cabaretSeasonCount: 0,
    cabaretPenaltyLevel: 0,
    conductScore: 100,
    isDrugEvent: false,
    endingId: null,
    clQualified: false,
    clActive: false,
    clGroupStage: 0,
    clGroupWins: 0,
    clKnockoutRound: 0,
    clEliminated: false,
    clTrophies: 0,
    nationalCaps: 0,
    nationalGoals: 0,
    wcWins: 0,
    wcActive: false,
    wcRound: 0,
    wcGroupWins: 0,
    wcWinBonus: false,
    showSeasonReview: false,
    inventory: [],
    gachaCoins: 0,
    gachaPityStandard: 0,
    gachaPityPickup: 0,
    gachaTotalPulls: 0,
    retireAgeBonus: 0,
    ballonDorFlag: false,
  };

  const [state, setState] = useState<GameState>(() => {
    // 初期表示はスロット選択画面を出すのでsetupに戻す
    // （実際のロードはselectSlotで行う）
    return EMPTY_STATE;
  });

  // 起動時: スロットプレビュー読み込み
  // ※ 自動ロードは Supabase のみ使用（localStorageは他ユーザーのデータが混入するため参照しない）
  useEffect(() => {
    setAllSlots(getAllSlotPreviews());
    loadAllSlotsFromSupabase().then(slots => setAllSlots(slots));

    if (typeof window === 'undefined') return;
    const lastSlot = getCurrentSlotId();

    // Supabase のデータがある場合のみ自動ロード
    loadGameFromSupabase(lastSlot).then(cloudState => {
      if (cloudState && cloudState.gamePhase !== 'setup' && cloudState.playerName) {
        activeSlotRef.current = lastSlot;
        setCurrentSlotIdState(lastSlot);
        setState(cloudState);
        saveGameFn(cloudState, lastSlot); // ローカルにも同期
      }
      // Supabase にデータなし → スロット選択画面のまま (EMPTY_STATE)
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pendingEvent, setPendingEvent] = useState<ReturnType<typeof getRandomEvent>>(null);
  const [pendingTransferOffers, setPendingTransferOffers] = useState<TransferOffer[]>([]);
  const [lastMatchResult, setLastMatchResult] = useState<ReturnType<typeof simulateMatch> | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [trainingFeedback, setTrainingFeedback] = useState<TrainingFeedback | null>(null);

  const update = useCallback((updater: (prev: GameState) => GameState) => {
    setState(prev => {
      const next = updater(prev);
      saveGame(next);
      return next;
    });
  }, []);

  const selectSlot = useCallback(async (slotId: SlotId) => {
    activeSlotRef.current = slotId;
    setCurrentSlotId(slotId);
    setCurrentSlotIdState(slotId);

    const cloudState = await loadGameFromSupabase(slotId);
    if (cloudState && cloudState.gamePhase !== 'setup' && cloudState.playerName) {
      // Supabase にデータあり → 使用してローカルにも同期
      setState(cloudState);
      saveGameFn(cloudState, slotId);
    } else {
      // Supabase にデータなし = 新規ユーザー → 必ず EMPTY_STATE
      // localStorage は他ユーザーのデータが残っている可能性があるため参照しない
      setState(EMPTY_STATE);
      resetGameFn(slotId); // 万が一残っているローカルデータもクリア
    }
    setPendingEvent(null);
    setPendingTransferOffers([]);
    setLastMatchResult(null);
    setHighlights([]);
    setNotification(null);
    setNewUnlocks([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const returnToSlotSelect = useCallback(() => {
    setCurrentSlotIdState(null);
    setAllSlots(getAllSlotPreviews());
    loadAllSlotsFromSupabase().then(slots => setAllSlots(slots));
  }, []);

  const startNewGame = useCallback((name: string, position: Position, teamId?: string) => {
    resetGame(activeSlotRef.current);
    resetGameFromSupabase(activeSlotRef.current);
    const selectedTeam = teamId ? TEAMS.regional.find(t => t.id === teamId) : undefined;
    const newState = buildInitialState(name, position, selectedTeam);
    newState.leagueStandings = generateStandings(newState);
    setState(newState);
    saveGame(newState);
    setPendingEvent(null);
    setPendingTransferOffers([]);
    setLastMatchResult(null);
    setHighlights([]);
    setNewUnlocks([]);
  }, []);

  const advanceWeek = useCallback((currentState: GameState): GameState => {
    const nextWeek = currentState.currentWeek + 1;
    const maxWeeks = 38;

    // 引退チェック（動的引退年齢）
    const maxAge = calcMaxRetirementAge(currentState);
    if (currentState.age >= maxAge) {
      const ending = determineEnding(currentState);
      return { ...currentState, gamePhase: 'ending', endingId: ending.id };
    }

    // シーズン終了
    if (nextWeek > maxWeeks) {
      // ovrStart: シーズン開始時のOVRを保持（なければ現在値）
      const ovrStart = currentState.seasonStartOvr ?? currentState.ovr;

      // 加齢スタット減少を計算（新しい年齢ベース）
      const newAge = currentState.age + 1;
      const agingDecay = calcAgingDecay(currentState.stats, newAge, currentState.position);
      const hasDecay = Object.keys(agingDecay).length > 0;

      // スタット減少を適用
      const decayedStats = { ...currentState.stats };
      if (hasDecay) {
        (Object.keys(agingDecay) as (keyof import('../types/game').PlayerStats)[]).forEach(k => {
          decayedStats[k] = Math.max(0, decayedStats[k] - (agingDecay[k] ?? 0));
        });
      }

      // ── CL出場権判定 ──────────────────────────────────
      const wonCLQual =
        isEuropeanLeague(currentState.currentLeague) &&
        isTeamInTop3(currentState.leagueStandings);

      // ── シーズン終了: 年齢加算・スタット減少・シーズン成績リセット ──
      const nextSeason = currentState.currentSeason + 1;
      const newState: GameState = {
        ...currentState,
        age: newAge,
        stats: decayedStats,
        ovr: calculateOVR(decayedStats, currentState.position),
        currentWeek: 1,
        currentSeason: nextSeason,
        seasonGoals: 0,
        seasonAssists: 0,
        seasonHatTricks: 0,
        seasonRating: 0,
        matchesPlayed: 0,
        fatigue: Math.max(0, currentState.fatigue - 20),
        cabaretSeasonCount: 0,
        // CL引き継ぎ
        clQualified: wonCLQual,
        clActive: wonCLQual,
        clGroupStage: 0,
        clGroupWins: 0,
        clKnockoutRound: 0,
        clEliminated: false,
        // WC: 資格があれば wcActive=true にして次シーズン初週でトリガー
        wcActive: isWCYear(nextSeason) && qualifiesForWC(currentState),
        wcRound: 0,
        wcGroupWins: 0,
      };

      // シーズン個人賞チェック（awardsSystemで一括管理）
      const newSeasonAwards = checkSeasonAwards(currentState);
      if (newSeasonAwards.length > 0) {
        newState.seasonAwards = [...(newState.seasonAwards ?? []), ...newSeasonAwards];
        newState.pendingAwards = newSeasonAwards;
        // 後方互換: awards にも名前を追加
        newState.awards = [
          ...newState.awards,
          ...newSeasonAwards.map(a => `${a.name} (Season ${a.season})`),
        ];
      }

      // バロンドール legacy check（awardsSystem と二重にならないよう確認）
      // currentState の値（シーズンリセット前）を使う
      if (
        currentState.ovr >= GAME_CONFIG.BALLON_DOR_OVR &&
        currentState.seasonRating >= GAME_CONFIG.BALLON_DOR_RATING &&
        !(newState.seasonAwards ?? []).some(a => a.id === 'ballon_dor_award')
      ) {
        const bdAward = {
          id: 'ballon_dor_award',
          name: 'バロンドール',
          icon: '🏅',
          description: '世界最高の個人賞。フランス・フットボール誌が選ぶ最優秀選手。',
          rarity: 'legendary' as const,
          season: currentState.currentSeason,
          league: LEAGUES[currentState.currentLeague].name,
        };
        newState.seasonAwards = [...(newState.seasonAwards ?? []), bdAward];
        newState.pendingAwards = [...(newState.pendingAwards ?? []), bdAward];
        if (!newState.awards.includes('バロンドール')) {
          newState.awards = [...newState.awards, 'バロンドール'];
        }
      }

      // 上位リーグでトロフィーを追加（CLは専用シミュレーションで付与するためここでは除外）
      const trophiesThisSeason: string[] = [];
      if (newState.currentLeague === 'premier_league' && Math.random() < 0.25) {
        const t = `プレミアリーグ優勝 (Season ${newState.currentSeason - 1})`;
        newState.trophies = [...newState.trophies, t];
        trophiesThisSeason.push(t);
      } else if (newState.currentLeague === 'j1' && Math.random() < 0.25) {
        const t = `J1リーグ優勝 (Season ${newState.currentSeason - 1})`;
        newState.trophies = [...newState.trophies, t];
        trophiesThisSeason.push(t);
      }

      // シーズンのファンボーナス
      const seasonFanBonus = Math.floor(currentState.seasonGoals * 100 + currentState.matchesPlayed * 30);
      newState.fans = (newState.fans ?? 0) + seasonFanBonus;

      // GC廃止: ガチャはmoneyで引く → 追加処理なし
      void calcSeasonGC; // unused but keep import to avoid TS error

      // ballonDorFlag: OVR88+ & 欧州リーグ で受賞確定
      if ((newState.ballonDorFlag ?? false) && newState.ovr >= 88 &&
          (newState.currentLeague === 'premier_league' || newState.currentLeague === 'champions_league')) {
        if (!newState.awards.includes('バロンドール')) {
          newState.awards = [...newState.awards, 'バロンドール'];
          newState.ballonDorFlag = false;
        }
      }

      // シーズンサマリーを生成
      const summary: SeasonSummary = {
        season: currentState.currentSeason,
        league: LEAGUES[currentState.currentLeague].name,
        leagueId: currentState.currentLeague,
        team: currentState.currentTeam.name,
        position: currentState.position,
        goals: currentState.seasonGoals,
        assists: currentState.seasonAssists,
        rating: currentState.seasonRating,
        matches: currentState.matchesPlayed,
        trophies: trophiesThisSeason,
        ovrStart,
        ovrEnd: newState.ovr,
        agingDecay: hasDecay ? agingDecay : undefined,
      };

      newState.lastSeasonSummary = summary;
      newState.showSeasonSummary = true;
      newState.showSeasonReview  = false; // サマリー閉じたあとにレビューを出す

      // シーズン後の実績チェック
      const newlyUnlockedAch = checkAchievements(currentState, newState);
      if (newlyUnlockedAch.length > 0) {
        newState.achievements = [...(newState.achievements ?? []), ...newlyUnlockedAch];
        const msgs = newlyUnlockedAch.map(id => {
          const a = ACHIEVEMENTS.find(x => x.id === id);
          return `${a?.icon ?? '🏅'} 実績解除：${a?.title ?? id}`;
        });
        setNewUnlocks(msgs);
        setTimeout(() => setNewUnlocks([]), 3500);
      }

      // 次シーズンのOVR起点を記録
      newState.seasonStartOvr = newState.ovr;

      const maxAgeAfterSeason = calcMaxRetirementAge(newState);
      if (newState.age >= maxAgeAfterSeason) {
        const ending = determineEnding(newState);
        return { ...newState, gamePhase: 'ending', endingId: ending.id };
      }

      // 'playing'フェーズを維持 — SeasonSummaryModalが表示される
      // dismissSeasonSummaryが'transfer'フェーズへ移行する
      return { ...newState, gamePhase: 'playing' };
    }

    // 週次処理：給料支払い + 負債ペナルティ
    const weeklySalary = Math.round(currentState.currentTeam.salary / 4);
    let weeklyMoney = currentState.money + weeklySalary;
    let weeklyMorale = currentState.morale;

    if (weeklyMoney < 0) {
      // 借金額に応じてモラル減少（最大-10/週）
      const debtPenalty = Math.min(10, Math.floor(Math.abs(weeklyMoney) / 50) + 3);
      weeklyMorale = Math.max(0, weeklyMorale - debtPenalty);
      // 借金上限：-300万円（それ以上は増えない）
      weeklyMoney = Math.max(-300, weeklyMoney);
    }

    return {
      ...currentState,
      currentWeek: nextWeek,
      money: weeklyMoney,
      morale: weeklyMorale,
    };
  }, []);

  const OUTCOME_MESSAGE: Record<TrainingOutcome, string> = {
    critical_success: '🌟 大成功！ ステータスが大幅アップ！',
    success:          '✅ 成功！ トレーニング完了。',
    failure:          '❌ 失敗… 今日は調子が上がらなかった。',
    critical_failure: '💀 大失敗！ 余計に疲れてしまった…',
  };

  const selectTraining = useCallback((type: TrainingType) => {
    setState(prev => {
      if (prev.gamePhase !== 'playing') return prev;

      const { statsChange, fatigueChange, injuryOccurred, outcome } = applyTraining(prev, type);

      // フィードバック表示（休息は省略）
      if (type !== 'rest') {
        setTrainingFeedback({ outcome, message: OUTCOME_MESSAGE[outcome] });
        setTimeout(() => setTrainingFeedback(null), 2500);
      }

      // 連続トレーニング
      const prevStreak = prev.trainingStreak ?? { type: '', count: 0 };
      const newStreakCount = prevStreak.type === type ? prevStreak.count + 1 : 1;
      const newStreak = { type, count: newStreakCount };

      // 連続ボーナス: 3回連続→+1、5回連続→+2
      let streakBonus = 0;
      if (newStreakCount >= 5) streakBonus = 2;
      else if (newStreakCount >= 3) streakBonus = 1;

      const newStats = { ...prev.stats };
      const mx = STAT_MAX[prev.position];
      (Object.keys(statsChange) as (keyof PlayerStats)[]).forEach(key => {
        const base = statsChange[key] ?? 0;
        const canGain = newStats[key] < mx[key];
        const bonus = canGain && type !== 'rest' ? streakBonus : 0;
        newStats[key] = Math.min(mx[key], Math.max(0, newStats[key] + base + bonus));
      });

      // スキルボーナス: 特定トレーニングに追加 +1
      const playerSkills = prev.skills ?? [];
      if (type !== 'rest') {
        const skillGain = (key: keyof PlayerStats) => {
          if (newStats[key] < mx[key]) newStats[key] = Math.min(mx[key], newStats[key] + 1);
        };
        // legend: 全トレーニング +1（変化があった全スタット）
        if (playerSkills.includes('legend')) {
          (Object.keys(statsChange) as (keyof PlayerStats)[]).forEach(key => {
            if ((statsChange[key] ?? 0) > 0) skillGain(key);
          });
        }
        if (playerSkills.includes('sniper')       && type === 'shooting')  skillGain('shooting');
        if (playerSkills.includes('playmaker')    && type === 'passing')   skillGain('passing');
        if (playerSkills.includes('dribble_king') && type === 'dribbling') skillGain('dribbling');
      }

      const newOvr = calculateOVR(newStats, prev.position);
      const newFatigue = Math.max(0, Math.min(100, prev.fatigue + fatigueChange));
      const newInjury = injuryOccurred ? Math.min(5, prev.injury + 1) : Math.max(0, prev.injury - 1);
      const prevInjured = prev.injury > 0;

      let newState: GameState = {
        ...prev,
        stats: newStats,
        ovr: newOvr,
        fatigue: newFatigue,
        injury: newInjury,
        previousInjury: prevInjured,
        trainingStreak: newStreak,
      };

      // 週を進める
      newState = advanceWeek(newState);

      const allNewUnlocks: string[] = [];

      if (newState.gamePhase === 'playing' && !newState.showSeasonSummary) {
        // 試合チェック
        if (shouldMatchOccur(newState)) {
          const result = simulateMatch(newState);
          setLastMatchResult(result);
          setHighlights(generateHighlights(result, newState.playerName));

          // ファン数: 得点ボーナス
          const goalFans = result.playerGoals > 0
            ? Math.floor(Math.random() * 200 + 100) * result.playerGoals
            : 0;
          const winFans = result.win ? Math.floor(Math.random() * 150 + 50) : 0;
          const fanIncrease = goalFans + winFans;

          const leagueMatchProb = Math.min(0.85, LEAGUES[newState.currentLeague].matchesPerSeason / 38);
          const updatedStandings = updateStandings(
            newState.leagueStandings ?? [],
            result,
            newState.currentTeam.id,
            leagueMatchProb,
          );

          const isHatTrick = result.playerGoals >= 3;
          newState = {
            ...newState,
            seasonGoals: newState.seasonGoals + result.playerGoals,
            seasonAssists: newState.seasonAssists + result.playerAssists,
            seasonHatTricks: (newState.seasonHatTricks ?? 0) + (isHatTrick ? 1 : 0),
            seasonRating: newState.matchesPlayed > 0
              ? (newState.seasonRating * newState.matchesPlayed + result.playerRating) / (newState.matchesPlayed + 1)
              : result.playerRating,
            matchesPlayed: newState.matchesPlayed + 1,
            totalGoals: newState.totalGoals + result.playerGoals,
            totalAssists: newState.totalAssists + result.playerAssists,
            fans: (newState.fans ?? 0) + fanIncrease,
            leagueStandings: updatedStandings,
            gamePhase: 'match_day',
          };

          // 試合後の実績チェック
          const newAch = checkAchievements(prev, newState, result.playerGoals);
          if (newAch.length > 0) {
            newState.achievements = [...(newState.achievements ?? []), ...newAch];
            allNewUnlocks.push(...newAch.map(id => {
              const a = ACHIEVEMENTS.find(x => x.id === id);
              return `${a?.icon ?? '🏅'} 実績解除：${a?.title ?? id}`;
            }));
          }
        } else {
          // イベントチェック
          const eventChance = Math.random();
          if (eventChance < GAME_CONFIG.EVENT_CHANCE_PER_WEEK) {
            const event = getRandomEvent(newState);
            if (event) {
              setPendingEvent(event);
            }
          }
        }
      }

      // ── 国際大会マッチチェック（リーグ試合がない週に発生） ──────
      if (newState.gamePhase === 'playing' && !newState.showSeasonSummary) {
        const wk = newState.currentWeek;

        // ── WCトリガー（シーズン初週: wcActiveセット済み）──
        if (newState.wcActive && newState.wcRound === 0 && wk === 1) {
          const wcResult = simulateIntlMatch(newState, 'wc_group');
          setLastMatchResult(wcResult);
          newState = {
            ...newState,
            nationalCaps: (newState.nationalCaps ?? 0) + 1,
            nationalGoals: (newState.nationalGoals ?? 0) + wcResult.playerGoals,
            gamePhase: 'match_day',
          };
        }

        // ── CLグループステージ ──────────────────────────
        else if (newState.clActive && !newState.clEliminated && newState.clGroupStage < 3 && isCLGroupWeek(wk)) {
          const clResult = simulateIntlMatch(newState, 'cl_group');
          setLastMatchResult(clResult);
          newState = {
            ...newState,
            clGroupStage: newState.clGroupStage + 1,
            clGroupWins: newState.clGroupWins + (clResult.win ? 1 : 0),
            totalGoals: newState.totalGoals + clResult.playerGoals,
            totalAssists: newState.totalAssists + clResult.playerAssists,
            gamePhase: 'match_day',
          };
        }

        // ── CLノックアウト ─────────────────────────────
        else if (newState.clActive && !newState.clEliminated && newState.clGroupStage >= 3 && newState.clGroupWins >= 2) {
          let clIntlType: Parameters<typeof simulateIntlMatch>[1] | null = null;
          if (isCLR16Week(wk) && newState.clKnockoutRound === 0) clIntlType = 'cl_r16';
          else if (isCLQFWeek(wk) && newState.clKnockoutRound === 1) clIntlType = 'cl_qf';
          else if (isCLSFWeek(wk) && newState.clKnockoutRound === 2) clIntlType = 'cl_sf';
          else if (isCLFinalWeek(wk) && newState.clKnockoutRound === 3) clIntlType = 'cl_final';

          if (clIntlType) {
            const clResult = simulateIntlMatch(newState, clIntlType);
            setLastMatchResult(clResult);
            const nextKO = clResult.win ? newState.clKnockoutRound + 1 : newState.clKnockoutRound;
            const eliminated = !clResult.win;
            let newTrophies = newState.trophies;
            let newCLTrophies = newState.clTrophies ?? 0;
            let newAwards = newState.awards;
            if (clIntlType === 'cl_final' && clResult.win) {
              const t = `チャンピオンズリーグ優勝 (Season ${newState.currentSeason})`;
              newTrophies = [...newState.trophies, t];
              newCLTrophies += 1;
              newAwards = [...newState.awards, 'CLチャンピオン'];
              allNewUnlocks.push('🏆 チャンピオンズリーグ優勝！');
            }
            newState = {
              ...newState,
              clKnockoutRound: nextKO,
              clEliminated: eliminated,
              trophies: newTrophies,
              clTrophies: newCLTrophies,
              awards: newAwards,
              totalGoals: newState.totalGoals + clResult.playerGoals,
              totalAssists: newState.totalAssists + clResult.playerAssists,
              gamePhase: 'match_day',
            };
          }
        }

        // ── 国際親善・代表試合 ─────────────────────────
        else if (!newState.clActive && newState.ovr >= 65 && isNationalWeek(wk, newState.currentSeason)) {
          const ntResult = simulateIntlMatch(newState, 'national');
          setLastMatchResult(ntResult);
          newState = {
            ...newState,
            nationalCaps: (newState.nationalCaps ?? 0) + 1,
            nationalGoals: (newState.nationalGoals ?? 0) + ntResult.playerGoals,
            gamePhase: 'match_day',
          };
        }
      }

      // 新スキルチェック
      const newSkillIds = checkNewSkills(newState);
      if (newSkillIds.length > 0) {
        newState.skills = [...(newState.skills ?? []), ...newSkillIds];
        allNewUnlocks.push(...newSkillIds.map(id => {
          const sk = SKILLS.find(x => x.id === id);
          return `${sk?.icon ?? '⚡'} 特技解除：${sk?.name ?? id}`;
        }));
      }

      if (allNewUnlocks.length > 0) {
        setNewUnlocks(allNewUnlocks);
        setTimeout(() => setNewUnlocks([]), 3000);
      }

      saveGame(newState);
      return newState;
    });
  }, [advanceWeek]);

  const skipWeek = useCallback(() => {
    setState(prev => {
      if (prev.gamePhase !== 'playing') return prev;

      // speed_star スキル: 疲労回復量 +10%
      const hasSpeedStar = (prev.skills ?? []).includes('speed_star');
      const recovery = hasSpeedStar
        ? Math.ceil(GAME_CONFIG.FATIGUE_RECOVERY_PER_WEEK * 1.1)
        : GAME_CONFIG.FATIGUE_RECOVERY_PER_WEEK;

      let newState: GameState = {
        ...prev,
        fatigue: Math.max(0, prev.fatigue - recovery),
        morale: Math.min(100, prev.morale + 2),
        injury: Math.max(0, prev.injury - 1),
        // 休息で怪我が回復した場合のために previousInjury を更新
        previousInjury: prev.injury > 0,
      };
      newState = advanceWeek(newState);

      if (newState.gamePhase === 'playing' && !newState.showSeasonSummary) {
        const eventChance = Math.random();
        if (eventChance < GAME_CONFIG.EVENT_CHANCE_PER_WEEK) {
          const event = getRandomEvent(newState);
          if (event) setPendingEvent(event);
        }
      }
      // showSeasonSummary 時は dismissSeasonSummary でオファーを生成するため、
      // ここでの重複生成を削除

      saveGame(newState);
      return newState;
    });
  }, [advanceWeek]);

  const resolveEvent = useCallback((choiceIndex: number) => {
    if (!pendingEvent) return;
    const choice = pendingEvent.choices[choiceIndex];
    if (!choice) return;

    setState(prev => {
      const { effect } = choice;
      const newStats = { ...prev.stats };
      const mx = STAT_MAX[prev.position];
      const statsKeys: (keyof PlayerStats)[] = ['shooting', 'passing', 'dribbling', 'speed', 'stamina', 'defense'];
      statsKeys.forEach(key => {
        if (effect[key] !== undefined) {
          newStats[key] = Math.min(mx[key], Math.max(0, newStats[key] + (effect[key] as number)));
        }
      });

      // キャバクラ訪問カウント処理（イベントもショップと同一ペナルティ体系に統一）
      const newCabaretCount  = effect.cabaretVisit ? (prev.cabaretCount ?? 0) + 1 : (prev.cabaretCount ?? 0);
      const newCabaretSeason = effect.cabaretVisit ? (prev.cabaretSeasonCount ?? 0) + 1 : (prev.cabaretSeasonCount ?? 0);
      const newPenaltyLevel  = calcCabaretPenalty(newCabaretCount);
      const decay = cabaretStatDecay(newPenaltyLevel);
      (Object.keys(decay) as (keyof PlayerStats)[]).forEach(k => {
        const d = decay[k] ?? 0;
        if (d !== 0) newStats[k] = Math.min(mx[k], Math.max(0, newStats[k] + d));
      });

      const newOvr = calculateOVR(newStats, prev.position);
      const newState: GameState = {
        ...prev,
        stats: newStats,
        ovr: newOvr,
        morale: Math.min(100, Math.max(0, prev.morale + (effect.morale ?? 0))),
        money: prev.money + (effect.money ?? 0),
        injury: Math.min(5, Math.max(0, prev.injury + (effect.injury ?? 0))),
        fatigue: Math.min(100, Math.max(0, prev.fatigue + (effect.fatigue ?? 0))),
        conductScore: Math.min(100, Math.max(0, (prev.conductScore ?? 100) + (effect.conductScore ?? 0))),
        cabaretCount: newCabaretCount,
        cabaretSeasonCount: newCabaretSeason,
        cabaretPenaltyLevel: newPenaltyLevel,
      };
      saveGame(newState);
      return newState;
    });

    setPendingEvent(null);
  }, [pendingEvent]);

  const advanceMatch = useCallback(() => {
    setState(prev => {
      const newState: GameState = {
        ...prev,
        gamePhase: 'playing',
        fatigue: Math.min(100, prev.fatigue + 10),
      };

      saveGame(newState);
      return newState;
    });
    setLastMatchResult(null);
    setHighlights([]);
  }, []);

  const continueFromMatch = useCallback(() => {
    const comp = lastMatchResult?.competition;

    // ── WC連続進行 ───────────────────────────────────
    if (comp?.startsWith('wc_')) {
      const won = lastMatchResult!.win;
      setState(prev => {
        if (!prev.wcActive) return { ...prev, gamePhase: 'playing' };
        const round = prev.wcRound;

        // グループステージ (0→1→2)
        if (round < 2) {
          // 次のGSマッチを生成
          const nextRound  = round + 1;
          const nextResult = simulateIntlMatch(
            { ...prev, wcRound: nextRound },
            nextRound === 2 ? 'wc_group' : 'wc_group',
          );
          setLastMatchResult(nextResult);
          const ns: GameState = {
            ...prev,
            wcRound: nextRound,
            wcGroupWins: prev.wcGroupWins + (won ? 1 : 0),
            nationalCaps: (prev.nationalCaps ?? 0) + 1,
            nationalGoals: (prev.nationalGoals ?? 0) + nextResult.playerGoals,
            gamePhase: 'match_day',
          };
          saveGame(ns);
          return ns;
        }

        // GS最終戦終了
        if (round === 2) {
          const totalWins = prev.wcGroupWins + (won ? 1 : 0);
          if (totalWins < 2) {
            // グループ敗退
            const ns: GameState = {
              ...prev,
              wcActive: false,
              wcRound: 0,
              wcGroupWins: 0,
              gamePhase: 'playing',
              showSeasonSummary: !prev.lastSeasonSummary,
            };
            setLastMatchResult(null);
            setHighlights([]);
            saveGame(ns);
            return ns;
          }
          // SF進出
          const sfResult = simulateIntlMatch(prev, 'wc_sf');
          setLastMatchResult(sfResult);
          const ns: GameState = {
            ...prev,
            wcRound: 3,
            wcGroupWins: totalWins,
            nationalCaps: (prev.nationalCaps ?? 0) + 1,
            nationalGoals: (prev.nationalGoals ?? 0) + sfResult.playerGoals,
            gamePhase: 'match_day',
          };
          saveGame(ns);
          return ns;
        }

        // SF終了
        if (round === 3) {
          if (!won) {
            const ns: GameState = {
              ...prev, wcActive: false, wcRound: 0, wcGroupWins: 0,
              gamePhase: 'playing', showSeasonSummary: !prev.lastSeasonSummary,
            };
            setLastMatchResult(null);
            setHighlights([]);
            saveGame(ns);
            return ns;
          }
          const finalResult = simulateIntlMatch(prev, 'wc_final');
          setLastMatchResult(finalResult);
          const ns: GameState = {
            ...prev,
            wcRound: 4,
            nationalCaps: (prev.nationalCaps ?? 0) + 1,
            nationalGoals: (prev.nationalGoals ?? 0) + finalResult.playerGoals,
            gamePhase: 'match_day',
          };
          saveGame(ns);
          return ns;
        }

        // Final終了
        const trophy = won ? `ワールドカップ優勝 (Season ${prev.currentSeason})` : null;
        const ns: GameState = {
          ...prev,
          wcActive: false,
          wcRound: 0,
          wcGroupWins: 0,
          wcWins: (prev.wcWins ?? 0) + (won ? 1 : 0),
          trophies: trophy ? [...prev.trophies, trophy] : prev.trophies,
          awards: won ? [...prev.awards, 'ワールドカップ優勝'] : prev.awards,
          gamePhase: 'playing',
          showSeasonSummary: !prev.lastSeasonSummary,
          nationalCaps: (prev.nationalCaps ?? 0) + 1,
          nationalGoals: (prev.nationalGoals ?? 0) + (lastMatchResult?.playerGoals ?? 0),
        };
        setLastMatchResult(null);
        setHighlights([]);
        saveGame(ns);
        return ns;
      });
      return;
    }

    advanceMatch();
  }, [advanceMatch, lastMatchResult]);

  // ── ガチャプル ──────────────────────────────────────
  const [lastGachaResults, setLastGachaResults] = useState<PullResult[]>([]);

  const pullGacha = useCallback((type: GachaType, isMulti: boolean): PullResult[] => {
    let results: PullResult[] = [];
    setState(prev => {
      const cost = isMulti ? GACHA_COST[type].multi : GACHA_COST[type].single;
      if (prev.money < cost) return prev;

      const pityKey: keyof typeof prev =
        type === 'standard' ? 'gachaPityStandard' : 'gachaPityPickup';
      const currentPity = (prev[pityKey] as number) ?? 0;

      let newPity = currentPity;
      if (isMulti) {
        const { results: r, newPity: np } = pullMulti(type, currentPity, prev.position, prev.currentSeason);
        results = r;
        newPity = np;
      } else {
        const { result: r, newPity: np } = pullSingle(type, currentPity, prev.position, prev.currentSeason);
        results = [r];
        newPity = np;
      }

      // 即時適用せず倉庫に追加
      const newInvItems = results.map(r => ({
        uid: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        itemId: r.item.id,
        obtainedAt: new Date().toISOString(),
      }));
      const ns: GameState = {
        ...prev,
        money: prev.money - cost,
        inventory: [...(prev.inventory ?? []), ...newInvItems],
        [pityKey]: newPity,
        gachaTotalPulls: (prev.gachaTotalPulls ?? 0) + results.length,
      };

      saveGame(ns);
      return ns;
    });
    setTimeout(() => setLastGachaResults([...results]), 0);
    return results;
  }, []);

  // ── アイテム倉庫 ──────────────────────────────────────
  const useInventoryItem = useCallback((uid: string) => {
    setState(prev => {
      const slot = (prev.inventory ?? []).find(i => i.uid === uid);
      if (!slot) return prev;
      const gachaItem = GACHA_ITEMS.find(i => i.id === slot.itemId);
      if (!gachaItem) return prev;

      let ns = applyGachaItem(prev, gachaItem);
      // gachaCoins効果はmoneyに変換
      if (gachaItem.effect.gachaCoins) {
        ns = { ...ns, money: ns.money + gachaItem.effect.gachaCoins };
      }
      ns = { ...ns, inventory: (ns.inventory ?? []).filter(i => i.uid !== uid) };
      setNewUnlocks([`${gachaItem.icon} ${gachaItem.name} を使用しました！`]);
      setTimeout(() => setNewUnlocks([]), 2500);
      saveGame(ns);
      return ns;
    });
  }, []);

  const discardInventoryItem = useCallback((uid: string) => {
    setState(prev => {
      const ns = { ...prev, inventory: (prev.inventory ?? []).filter(i => i.uid !== uid) };
      saveGame(ns);
      return ns;
    });
  }, []);

  const dismissPendingAwards = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, pendingAwards: [] };
      saveGame(newState);
      return newState;
    });
  }, []);

  const buyItem = useCallback((item: ShopItem) => {
    setState(prev => {
      if (prev.money < item.price) return prev;
      if (!item.consumable && (prev.purchasedItems ?? []).includes(item.id)) return prev;

      const { effect } = item;
      const mx = STAT_MAX[prev.position];
      const newStats = { ...prev.stats };
      const statKeys: (keyof PlayerStats)[] = ['shooting', 'passing', 'dribbling', 'speed', 'stamina', 'defense'];
      statKeys.forEach(k => {
        if (effect[k] !== undefined) {
          newStats[k] = Math.min(mx[k], Math.max(0, newStats[k] + (effect[k] as number)));
        }
      });

      const newPurchased = item.consumable
        ? (prev.purchasedItems ?? [])
        : [...(prev.purchasedItems ?? []), item.id];

      // キャバクラカウンター処理
      const newCabaretCount  = effect.cabaretVisit ? (prev.cabaretCount ?? 0) + 1 : (prev.cabaretCount ?? 0);
      const newCabaretSeason = effect.cabaretVisit ? (prev.cabaretSeasonCount ?? 0) + 1 : (prev.cabaretSeasonCount ?? 0);
      const newPenaltyLevel  = calcCabaretPenalty(newCabaretCount);

      // ペナルティによるスタット減衰
      const decay = cabaretStatDecay(newPenaltyLevel);
      (Object.keys(decay) as (keyof PlayerStats)[]).forEach(k => {
        const d = decay[k] ?? 0;
        if (d !== 0) newStats[k] = Math.min(mx[k], Math.max(0, newStats[k] + d));
      });

      // 麻薬イベントトリガー判定
      const drugTriggerChance = newPenaltyLevel >= 4 && newCabaretSeason >= 3
        ? 0.18
        : newCabaretCount >= 30 && newCabaretSeason >= 5
        ? 0.08
        : 0;
      const isDrugTriggered = drugTriggerChance > 0 && Math.random() < drugTriggerChance;

      // 不動産・車両配列処理
      const newRealEstate = effect.addRealEstate
        ? [...(prev.realEstate ?? []), effect.addRealEstate]
        : (prev.realEstate ?? []);
      const newVehicles = effect.addVehicle
        ? [...(prev.vehicles ?? []), effect.addVehicle]
        : (prev.vehicles ?? []);

      let newState: GameState = {
        ...prev,
        stats: newStats,
        ovr: calculateOVR(newStats, prev.position),
        money: prev.money - item.price,
        morale: effect.morale !== undefined
          ? Math.min(100, Math.max(0, prev.morale + effect.morale))
          : prev.morale,
        fatigue: effect.fatigue !== undefined
          ? Math.min(100, Math.max(0, prev.fatigue + effect.fatigue))
          : prev.fatigue,
        injury: effect.injury !== undefined
          ? Math.min(5, Math.max(0, prev.injury + effect.injury))
          : prev.injury,
        fans: effect.fans !== undefined
          ? (prev.fans ?? 0) + effect.fans
          : prev.fans,
        conductScore: effect.conductScore !== undefined
          ? Math.min(100, Math.max(0, (prev.conductScore ?? 100) + effect.conductScore))
          : prev.conductScore,
        purchasedItems: newPurchased,
        cabaretCount: newCabaretCount,
        cabaretSeasonCount: newCabaretSeason,
        cabaretPenaltyLevel: newPenaltyLevel,
        realEstate: newRealEstate,
        vehicles: newVehicles,
        isDrugEvent: isDrugTriggered || (prev.isDrugEvent ?? false),
      };

      // 麻薬摘発 → 即エンディング
      if (isDrugTriggered) {
        const ending = determineEnding({ ...newState, isDrugEvent: true });
        newState = { ...newState, gamePhase: 'ending', endingId: ending.id };
      }

      const unlockMsg = isDrugTriggered
        ? '🚨 麻薬摘発！キャリア強制終了...'
        : newPenaltyLevel > (prev.cabaretPenaltyLevel ?? 0)
        ? `⚠️ 素行ペナルティLv${newPenaltyLevel}：スタットが低下しています`
        : `${item.icon} ${item.name}を購入しました！`;
      setNewUnlocks([unlockMsg]);
      setTimeout(() => setNewUnlocks([]), 3000);

      saveGame(newState);
      return newState;
    });
  }, []);

  const dismissSeasonSummary = useCallback(() => {
    setState(prev => {
      // サマリーを閉じたらシーズンレビューを表示
      const newState: GameState = {
        ...prev,
        showSeasonSummary: false,
        showSeasonReview: true,
        pendingAwards: [],
      };
      saveGame(newState);
      return newState;
    });
  }, []);

  const dismissSeasonReview = useCallback(() => {
    setState(prev => {
      const offers = generateTransferOffers(prev);
      setPendingTransferOffers(offers);
      const newState: GameState = {
        ...prev,
        showSeasonReview: false,
        gamePhase: 'transfer',
      };
      saveGame(newState);
      return newState;
    });
  }, []);

  const acceptTransfer = useCallback((offer: TransferOffer) => {
    setState(prev => {
      const nextLeagueForOffer = offer.team.league;
      const isPromotion = LEAGUES[nextLeagueForOffer].level > LEAGUES[prev.currentLeague].level;

      // 昇格時のファンブースト
      const promotionFans = isPromotion
        ? Math.floor(Math.random() * 500 + 200)
        : 0;

      const newState: GameState = {
        ...prev,
        currentTeam: offer.team,
        currentLeague: nextLeagueForOffer,
        money: prev.money + offer.salary,
        morale: Math.min(100, prev.morale + 15),
        gamePhase: 'playing',
        fans: (prev.fans ?? 0) + promotionFans,
        leagueStandings: [], // 移籍後は新リーグで再生成
      };
      newState.leagueStandings = generateStandings(newState);

      // 移籍後の実績チェック
      const newAch = checkAchievements(prev, newState);
      if (newAch.length > 0) {
        newState.achievements = [...(newState.achievements ?? []), ...newAch];
        setNewUnlocks(newAch.map(id => {
          const a = ACHIEVEMENTS.find(x => x.id === id);
          return `${a?.icon ?? '🏅'} 実績解除：${a?.title ?? id}`;
        }));
        setTimeout(() => setNewUnlocks([]), 3000);
      }

      saveGame(newState);
      return newState;
    });
    setPendingTransferOffers([]);
  }, []);

  const declineTransfer = useCallback(() => {
    setState(prev => {
      const newState: GameState = {
        ...prev,
        morale: Math.min(100, prev.morale + 10),
        gamePhase: 'playing',
      };
      saveGame(newState);
      return newState;
    });
    setPendingTransferOffers([]);
  }, []);

  const dismissTransfer = useCallback(() => {
    setState(prev => {
      const newState: GameState = { ...prev, gamePhase: 'playing' };
      saveGame(newState);
      return newState;
    });
    setPendingTransferOffers([]);
  }, []);

  const startNewSeason = useCallback(() => {
    setState(prev => {
      const offers = generateTransferOffers(prev);
      setPendingTransferOffers(offers);
      return prev;
    });
  }, []);

  const restartGame = useCallback(() => {
    resetGame(activeSlotRef.current);
    resetGameFromSupabase(activeSlotRef.current);
    setState({
      playerName: '',
      position: 'FW',
      age: 17,
      stats: GAME_CONFIG.INITIAL_STATS.FW,
      ovr: calculateOVR(GAME_CONFIG.INITIAL_STATS.FW, 'FW'),
      currentWeek: 1,
      currentSeason: 1,
      currentLeague: 'regional',
      currentTeam: TEAMS.regional[0],
      seasonGoals: 0,
      seasonAssists: 0,
      seasonHatTricks: 0,
      seasonRating: 0,
      matchesPlayed: 0,
      morale: 70,
      money: 0,
      injury: 0,
      fatigue: 0,
      totalGoals: 0,
      totalAssists: 0,
      trophies: [],
      awards: [],
      gamePhase: 'setup',
      isNewGame: true,
      previousInjury: false,
      achievements: [],
      fans: 0,
      trainingStreak: { type: '', count: 0 },
      lastSeasonSummary: null,
      showSeasonSummary: false,
      skills: [],
      leagueStandings: [],
      seasonAwards: [],
      pendingAwards: [],
      purchasedItems: [],
      realEstate: [],
      vehicles: [],
      cabaretCount: 0,
      cabaretSeasonCount: 0,
      cabaretPenaltyLevel: 0,
      conductScore: 100,
      isDrugEvent: false,
      endingId: null,
      clQualified: false,
      clActive: false,
      clGroupStage: 0,
      clGroupWins: 0,
      clKnockoutRound: 0,
      clEliminated: false,
      clTrophies: 0,
      nationalCaps: 0,
      nationalGoals: 0,
      wcWins: 0,
      wcActive: false,
      wcRound: 0,
      wcGroupWins: 0,
      wcWinBonus: false,
      showSeasonReview: false,
      inventory: [],
      gachaCoins: 0,
      gachaPityStandard: 0,
      gachaPityPickup: 0,
      gachaTotalPulls: 0,
      retireAgeBonus: 0,
      ballonDorFlag: false,
    });
    setPendingEvent(null);
    setPendingTransferOffers([]);
    setLastMatchResult(null);
    setHighlights([]);
    setNotification(null);
    setNewUnlocks([]);
  }, []);

  return {
    state,
    pendingEvent,
    pendingTransferOffers,
    lastMatchResult,
    highlights,
    notification,
    newUnlocks,
    startNewGame,
    selectTraining,
    skipWeek,
    acceptTransfer,
    declineTransfer,
    resolveEvent,
    advanceMatch,
    startNewSeason,
    continueFromMatch,
    restartGame,
    dismissTransfer,
    dismissSeasonSummary,
    dismissSeasonReview,
    dismissPendingAwards,
    buyItem,
    pullGacha,
    lastGachaResults,
    useInventoryItem,
    discardInventoryItem,
    trainingFeedback,
    currentSlotId,
    allSlots,
    selectSlot,
    returnToSlotSelect,
  };
}
