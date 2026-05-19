'use client';

import { useState, useCallback } from 'react';
import type { GameState, Position, PlayerStats, TransferOffer, SeasonSummary } from '../types/game';
import { GAME_CONFIG, STAT_MAX } from '../lib/gameConfig';
import { calculateOVR, applyTraining, simulateMatch, generateTransferOffers, shouldMatchOccur, generateHighlights } from '../lib/gameEngine';
import type { TrainingType } from '../lib/gameEngine';
import { getRandomEvent } from '../lib/eventSystem';
import { TEAMS, LEAGUES, getNextLeague } from '../lib/leagueData';
import { saveGame, loadGame, resetGame } from '../lib/saveManager';
import { checkAchievements, ACHIEVEMENTS } from '../lib/achievements';
import { checkSeasonAwards } from '../lib/awardsSystem';
import { checkNewSkills, SKILLS } from '../lib/skills';
import { generateStandings, updateStandings } from '../lib/standingsEngine';

function buildInitialState(name: string, position: Position): GameState {
  const stats = { ...GAME_CONFIG.INITIAL_STATS[position] };
  const startTeam = TEAMS.regional[0];
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
    currentTeam: startTeam,
    seasonGoals: 0,
    seasonAssists: 0,
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
  };
}

export interface GameActions {
  startNewGame: (name: string, position: Position) => void;
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
  dismissPendingAwards: () => void;
}

export interface GameStateExtended {
  state: GameState;
  pendingEvent: ReturnType<typeof getRandomEvent>;
  pendingTransferOffers: TransferOffer[];
  lastMatchResult: ReturnType<typeof simulateMatch> | null;
  highlights: string[];
  notification: string | null;
  newUnlocks: string[];
}

export function useGameState(): GameStateExtended & GameActions {
  const saved = typeof window !== 'undefined' ? loadGame() : null;
  const [state, setState] = useState<GameState>(
    saved ?? {
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
      gamePhase: saved ? 'playing' : 'setup',
      isNewGame: !saved,
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
    }
  );

  const [pendingEvent, setPendingEvent] = useState<ReturnType<typeof getRandomEvent>>(null);
  const [pendingTransferOffers, setPendingTransferOffers] = useState<TransferOffer[]>([]);
  const [lastMatchResult, setLastMatchResult] = useState<ReturnType<typeof simulateMatch> | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);

  const update = useCallback((updater: (prev: GameState) => GameState) => {
    setState(prev => {
      const next = updater(prev);
      saveGame(next);
      return next;
    });
  }, []);

  const startNewGame = useCallback((name: string, position: Position) => {
    resetGame();
    const newState = buildInitialState(name, position);
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

    // 引退チェック
    if (currentState.age >= GAME_CONFIG.RETIREMENT_AGE) {
      return { ...currentState, gamePhase: 'ending' };
    }

    // シーズン終了
    if (nextWeek > maxWeeks) {
      // ovrStart: シーズン開始時のOVRを保持（なければ現在値）
      const ovrStart = currentState.seasonStartOvr ?? currentState.ovr;

      // シーズン終了: 年齢加算・シーズン成績リセット・移籍オファー生成
      const newState: GameState = {
        ...currentState,
        age: currentState.age + 1,
        currentWeek: 1,
        currentSeason: currentState.currentSeason + 1,
        seasonGoals: 0,
        seasonAssists: 0,
        seasonRating: 0,
        matchesPlayed: 0,
        fatigue: Math.max(0, currentState.fatigue - 20),
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

      // 上位リーグでトロフィーを追加
      const trophiesThisSeason: string[] = [];
      if (newState.currentLeague === 'champions_league' && Math.random() < 0.3) {
        const t = `チャンピオンズリーグ優勝 (Season ${newState.currentSeason - 1})`;
        newState.trophies = [...newState.trophies, t];
        trophiesThisSeason.push(t);
      } else if (newState.currentLeague === 'premier_league' && Math.random() < 0.25) {
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

      // シーズンサマリーを生成
      const summary: SeasonSummary = {
        season: currentState.currentSeason,
        league: LEAGUES[currentState.currentLeague].name,
        team: currentState.currentTeam.name,
        goals: currentState.seasonGoals,
        assists: currentState.seasonAssists,
        rating: currentState.seasonRating,
        matches: currentState.matchesPlayed,
        trophies: trophiesThisSeason,
        ovrStart,
        ovrEnd: newState.ovr,
      };

      newState.lastSeasonSummary = summary;
      newState.showSeasonSummary = true;

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

      if (newState.age >= GAME_CONFIG.RETIREMENT_AGE) {
        return { ...newState, gamePhase: 'ending' };
      }

      // 'playing'フェーズを維持 — SeasonSummaryModalが表示される
      // dismissSeasonSummaryが'transfer'フェーズへ移行する
      return { ...newState, gamePhase: 'playing' };
    }

    // 週次処理：負債ペナルティ
    let weeklyMoney = currentState.money;
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

  const selectTraining = useCallback((type: TrainingType) => {
    setState(prev => {
      if (prev.gamePhase !== 'playing') return prev;

      const { statsChange, fatigueChange, injuryOccurred } = applyTraining(prev, type);

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
        // streak bonus: base が 0 でも上限未満ならボーナス適用
        const canGain = newStats[key] < mx[key];
        const bonus = canGain && type !== 'rest' ? streakBonus : 0;
        newStats[key] = Math.min(mx[key], Math.max(0, newStats[key] + base + bonus));
      });

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

          const updatedStandings = updateStandings(
            newState.leagueStandings ?? [],
            result,
            newState.currentTeam.id,
          );

          newState = {
            ...newState,
            seasonGoals: newState.seasonGoals + result.playerGoals,
            seasonAssists: newState.seasonAssists + result.playerAssists,
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
      let newState = {
        ...prev,
        fatigue: Math.max(0, prev.fatigue - GAME_CONFIG.FATIGUE_RECOVERY_PER_WEEK),
        morale: Math.min(100, prev.morale + 2),
        // 週スキップ（休息）で怪我も回復
        injury: Math.max(0, prev.injury - 1),
      };
      newState = advanceWeek(newState);

      if (newState.gamePhase === 'playing' && !newState.showSeasonSummary) {
        const eventChance = Math.random();
        if (eventChance < GAME_CONFIG.EVENT_CHANCE_PER_WEEK) {
          const event = getRandomEvent(newState);
          if (event) setPendingEvent(event);
        }
      } else if (newState.showSeasonSummary) {
        // シーズン終了: transfer offersを生成してモーダル表示待ち
        const offers = generateTransferOffers(newState);
        setPendingTransferOffers(offers);
      } else if (newState.gamePhase === 'transfer') {
        const offers = generateTransferOffers(newState);
        setPendingTransferOffers(offers);
      }

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

      const newOvr = calculateOVR(newStats, prev.position);
      const newState: GameState = {
        ...prev,
        stats: newStats,
        ovr: newOvr,
        morale: Math.min(100, Math.max(0, prev.morale + (effect.morale ?? 0))),
        money: prev.money + (effect.money ?? 0),
        injury: Math.min(5, Math.max(0, prev.injury + (effect.injury ?? 0))),
        fatigue: Math.min(100, Math.max(0, prev.fatigue + (effect.fatigue ?? 0))),
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
    advanceMatch();
  }, [advanceMatch]);

  const dismissPendingAwards = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, pendingAwards: [] };
      saveGame(newState);
      return newState;
    });
  }, []);

  const dismissSeasonSummary = useCallback(() => {
    setState(prev => {
      const offers = generateTransferOffers(prev);
      setPendingTransferOffers(offers);
      const newState: GameState = {
        ...prev,
        showSeasonSummary: false,
        pendingAwards: [],  // 表示済みアワードをクリア
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
        setNewUnlocks(newAch.map(id => `🏅 実績解除：${id}`));
        setTimeout(() => setNewUnlocks([]), 3000);
      }

      saveGame(newState);
      return newState;
    });
    setPendingTransferOffers([]);
  }, []);

  const declineTransfer = useCallback(() => {
    setState(prev => {
      // OVRが十分高ければ自動昇格を試みる
      const nextLeague = getNextLeague(prev.currentLeague);
      let newLeague = prev.currentLeague;
      let newTeam = prev.currentTeam;

      if (nextLeague) {
        const threshold = GAME_CONFIG.TRANSFER_THRESHOLDS[nextLeague];
        if (threshold !== undefined && prev.ovr >= threshold) {
          newLeague = nextLeague;
          const leagueTeams = TEAMS[nextLeague];
          newTeam = leagueTeams[Math.floor(Math.random() * leagueTeams.length)];
          setNotification(`${LEAGUES[nextLeague].name}に昇格しました！`);
        }
      }

      const newState: GameState = {
        ...prev,
        currentLeague: newLeague,
        currentTeam: newTeam,
        morale: Math.min(100, prev.morale + 10),
        gamePhase: 'playing',
        leagueStandings: [],
      };
      // リーグが変わった場合は順位表を再生成
      if (newLeague !== prev.currentLeague) {
        newState.leagueStandings = generateStandings(newState);
      } else {
        newState.leagueStandings = prev.leagueStandings;
      }
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
    resetGame();
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
    dismissPendingAwards,
  };
}
