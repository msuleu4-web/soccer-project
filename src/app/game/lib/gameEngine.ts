import type { GameState, PlayerStats, Position, MatchResult, MatchEvent, TransferOffer, Team } from '../types/game';
import { GAME_CONFIG, STAT_MAX } from './gameConfig';
import { LEAGUES, TEAMS, LEAGUE_ORDER, getNextLeague } from './leagueData';

export type TrainingType =
  | 'shooting'
  | 'passing'
  | 'dribbling'
  | 'physical'
  | 'defense'
  | 'rest';

export type TrainingOutcome = 'critical_success' | 'success' | 'failure' | 'critical_failure';

export interface TrainingResult {
  statsChange: Partial<PlayerStats>;
  fatigueChange: number;
  injuryOccurred: boolean;
  outcome: TrainingOutcome;
  successRate: number;       // 0〜1（UI表示用）
}

// 各練習種別のベース成功率
const BASE_SUCCESS_RATE: Record<TrainingType, number> = {
  shooting:  0.65,
  passing:   0.68,
  dribbling: 0.62,
  physical:  0.58,
  defense:   0.64,
  rest:      1.00,
};

export function getTrainingSuccessRate(fatigue: number, morale: number, trainingType: TrainingType): number {
  if (trainingType === 'rest') return 1;
  const base      = BASE_SUCCESS_RATE[trainingType];
  const fatigueMod = -0.28 * (fatigue / 100);          // 疲労0→修正なし / 疲労100→-28%
  const moraleMod  = -0.15 + 0.22 * (morale / 100);   // モラル0→-15% / モラル100→+7%
  return Math.min(0.90, Math.max(0.12, base + fatigueMod + moraleMod));
}

// OVRはスタット/上限で正規化 → 全スタットが上限に達するとOVR99
export function calculateOVR(stats: PlayerStats, position: Position): number {
  const weights = GAME_CONFIG.OVR_WEIGHTS[position];
  const maxes  = STAT_MAX[position];
  const raw =
    (stats.shooting  / maxes.shooting)  * weights.shooting  +
    (stats.passing   / maxes.passing)   * weights.passing   +
    (stats.dribbling / maxes.dribbling) * weights.dribbling +
    (stats.speed     / maxes.speed)     * weights.speed     +
    (stats.stamina   / maxes.stamina)   * weights.stamina   +
    (stats.defense   / maxes.defense)   * weights.defense;
  return Math.round(Math.min(99, Math.max(1, raw * 99)));
}

// 収穫逓減：2.0乗で全域にわたってきつく
// - 上限の30%以下：比較的伸びやすい
// - 上限の70%超え：急激に困難
// - 上限の95%超え：最低5%を保証（完全に止まらないようにする）
function diminishing(base: number, currentValue: number, morale: number, maxValue: number): number {
  if (base <= 0 || currentValue >= maxValue) return 0;
  const ratio = 1 - currentValue / maxValue;
  const factor = Math.pow(ratio, 2.0) * (morale / 100);
  if (factor <= 0) return 0;
  const raw = base * factor;
  // 上限付近（残り5%以内）でも最低5%の確率を保証してスタックを防ぐ
  const finalChance = ratio < 0.05 ? Math.max(raw, 0.05) : raw;
  if (finalChance >= 1) return Math.round(finalChance);
  return Math.random() < finalChance ? 1 : 0;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function applyTraining(state: GameState, trainingType: TrainingType): TrainingResult {
  const { stats, morale, fatigue, position } = state;
  const skills = state.skills ?? [];

  // ── 成功率・成否判定 ──────────────────────────────────
  const successRate = getTrainingSuccessRate(fatigue, morale, trainingType);
  let outcome: TrainingOutcome = 'success';
  if (trainingType !== 'rest') {
    const r = Math.random();
    if      (r < successRate * 0.15) outcome = 'critical_success';  // 大成功
    else if (r < successRate)        outcome = 'success';
    else if (r > 0.97)               outcome = 'critical_failure';  // 大失敗（〜3%）
    else                             outcome = 'failure';
  }

  // 成功時の倍率（大成功: 1.5倍、失敗: 0）
  const multiplier =
    outcome === 'critical_success' ? 1.5 :
    outcome === 'success'          ? 1.0 : 0;

  const halfEffect = fatigue >= GAME_CONFIG.FATIGUE_INJURY_THRESHOLD ? 0.5 : 1;
  let injuryOccurred = false;

  // wall スキル: 怪我リスク -50%
  const injuryChance = skills.includes('wall')
    ? GAME_CONFIG.FATIGUE_INJURY_CHANCE * 0.5
    : GAME_CONFIG.FATIGUE_INJURY_CHANCE;
  if (fatigue >= GAME_CONFIG.FATIGUE_INJURY_THRESHOLD && Math.random() < injuryChance) {
    injuryOccurred = true;
  }

  const mx = STAT_MAX[position];
  const statsChange: Partial<PlayerStats> = {};
  let fatigueChange = 0;

  switch (trainingType) {
    case 'shooting': {
      const base = rand(5, 14) * multiplier;
      statsChange.shooting = diminishing(base * halfEffect, stats.shooting, morale, mx.shooting);
      statsChange.passing  = diminishing(1.5 * multiplier * halfEffect, stats.passing, morale, mx.passing);
      fatigueChange = 20;
      break;
    }
    case 'passing': {
      const base = rand(5, 14) * multiplier;
      statsChange.passing   = diminishing(base * halfEffect, stats.passing,   morale, mx.passing);
      statsChange.dribbling = diminishing(1.5 * multiplier * halfEffect, stats.dribbling, morale, mx.dribbling);
      fatigueChange = 15;
      break;
    }
    case 'dribbling': {
      const base = rand(5, 14) * multiplier;
      statsChange.dribbling = diminishing(base * halfEffect, stats.dribbling, morale, mx.dribbling);
      statsChange.speed     = diminishing(1.5 * multiplier * halfEffect, stats.speed,  morale, mx.speed);
      fatigueChange = 20;
      break;
    }
    case 'physical': {
      const baseSpeed   = rand(4, 10) * multiplier;
      const baseStamina = rand(4, 10) * multiplier;
      statsChange.speed   = diminishing(baseSpeed   * halfEffect, stats.speed,   morale, mx.speed);
      statsChange.stamina = diminishing(baseStamina * halfEffect, stats.stamina, morale, mx.stamina);
      fatigueChange = 28;
      break;
    }
    case 'defense': {
      const base = rand(5, 14) * multiplier;
      statsChange.defense = diminishing(base * halfEffect, stats.defense, morale, mx.defense);
      statsChange.stamina = diminishing(1.5 * multiplier * halfEffect, stats.stamina, morale, mx.stamina);
      fatigueChange = 20;
      break;
    }
    case 'rest': {
      fatigueChange = -30;
      break;
    }
  }

  // 大失敗: 追加疲労 +12
  if (outcome === 'critical_failure') fatigueChange += 12;

  // iron_body スキル: 疲労増加 -20%
  if (skills.includes('iron_body') && fatigueChange > 0) {
    fatigueChange = Math.ceil(fatigueChange * 0.8);
  }

  return { statsChange, fatigueChange, injuryOccurred, outcome, successRate };
}

// ランダムな分を重複なしで生成
function uniqueMinutes(count: number): number[] {
  const clamped = Math.min(count, 90);
  const mins = new Set<number>();
  while (mins.size < clamped) mins.add(rand(1, 90));
  return Array.from(mins).sort((a, b) => a - b);
}

// 選手ゴールの説明文
const PLAYER_GOAL_TEXTS = [
  (name: string, min: number) => `⚽ ${min}分 ${name}がペナルティエリア内で反転シュート！ゴール！`,
  (name: string, min: number) => `⚽ ${min}分 ${name}の豪快な右足ミドルシュートがゴール右隅に突き刺さる！`,
  (name: string, min: number) => `⚽ ${min}分 ${name}が1対1を冷静に制してGKの股を抜く！`,
  (name: string, min: number) => `⚽ ${min}分 コーナーキックのこぼれ球を${name}が押し込んでゴール！`,
  (name: string, min: number) => `⚽ ${min}分 ${name}がスルーパスに抜け出し、GKと1対1！冷静に沈めた！`,
  (name: string, min: number) => `⚽ ${min}分 ${name}の左足アウトサイドシュートがゴール上隅へ！`,
  (name: string, min: number) => `⚽ ${min}分 ${name}がドリブルでDF2人をかわしてゴール！`,
  (name: string, min: number) => `⚽ ${min}分 クロスに${name}がヘディング！ゴール！`,
];

// 選手アシストの説明文
const PLAYER_ASSIST_TEXTS = [
  (name: string, min: number) => `🎯 ${min}分 ${name}の絶妙なスルーパスにチームメイトが抜け出しゴール！（アシスト）`,
  (name: string, min: number) => `🎯 ${min}分 ${name}のクロスをチームメイトが頭で合わせる！（アシスト）`,
  (name: string, min: number) => `🎯 ${min}分 ${name}がヒールパスでチームメイトをフリーにしてゴール！（アシスト）`,
];

// チームメイトゴールの説明文
const TEAMMATE_GOAL_TEXTS = [
  (_: string, min: number) => `⚽ ${min}分 チームメイトの強烈なシュートがゴールへ！`,
  (_: string, min: number) => `⚽ ${min}分 セットプレーからチームメイトがヘッドで押し込む！`,
  (_: string, min: number) => `⚽ ${min}分 カウンターからチームメイトが流し込む！`,
  (_: string, min: number) => `⚽ ${min}分 ペナルティキックをチームメイトが決める！`,
];

// 相手ゴールの説明文
const OPPONENT_GOAL_TEXTS = [
  (opponent: string, min: number) => `💥 ${min}分 ${opponent}がミドルシュートを決める。失点。`,
  (opponent: string, min: number) => `💥 ${min}分 ${opponent}のカウンターアタックから失点。`,
  (opponent: string, min: number) => `💥 ${min}分 ${opponent}のコーナーキックからヘディングで失点。`,
  (opponent: string, min: number) => `💥 ${min}分 ${opponent}のFKが壁を越えてゴールへ。失点。`,
];

// チャンス・セーブの説明文
const CHANCE_TEXTS = [
  (name: string, min: number) => `🔥 ${min}分 ${name}がシュート！惜しくもポスト直撃！`,
  (name: string, min: number) => `🔥 ${min}分 ${name}の強烈なシュートをGKがビッグセーブ！`,
  (_: string, min: number) => `🛡️ ${min}分 味方GKの好セーブで失点を防ぐ！`,
  (name: string, min: number) => `🔥 ${min}分 ${name}がフリーになったが、惜しくもクロスバー直撃！`,
  (_: string, min: number) => `⚠️ ${min}分 相手の決定的なシュート！辛くもDFがブロック！`,
  (name: string, min: number) => `🔥 ${min}分 ${name}のドリブル突破！シュートはわずかに枠外。`,
];

export function generateHighlights(result: MatchResult, _playerName: string): string[] {
  return result.events.map(e => e.text);
}

// ポワソン分布でゴール数をサンプリング（最大5点）
function poissonGoals(lambda: number): number {
  const r = Math.random();
  let cumP = 0;
  let p = Math.exp(-lambda);
  for (let k = 0; k <= 5; k++) {
    cumP += p;
    if (r < cumP) return k;
    p *= lambda / (k + 1);
  }
  return 5;
}

export function simulateMatch(state: GameState): MatchResult {
  const { stats, ovr, currentTeam, position } = state;
  const leagueLevel = LEAGUES[state.currentLeague].level;

  const fatiguePenalty = state.fatigue > 50 ? (state.fatigue - 50) / 100 : 0;
  const moraleFactor = state.morale / 100;
  const effectiveOvr = ovr * (1 - fatiguePenalty * 0.3) * (0.7 + moraleFactor * 0.3);

  // 個人ゴール確率 — ステータス比率で非線形スケーリング（高スペック支配力の極大化）
  const mx = STAT_MAX[position];
  const shootRatio  = Math.min(1.0, stats.shooting  / mx.shooting);
  const dribRatio   = Math.min(1.0, stats.dribbling / mx.dribbling);
  const speedRatio  = Math.min(1.0, stats.speed     / mx.speed);
  // 冪乗曲線で中程度の差が試合に圧倒的に反映される
  const dominance   = Math.pow((shootRatio * 0.5 + dribRatio * 0.3 + speedRatio * 0.2), 1.8);
  const ovrDom      = Math.pow(effectiveOvr / 99, 2.2);

  let goalChance = 0;
  if (position === 'FW')      goalChance = dominance * 0.90 + ovrDom * 0.40;
  else if (position === 'MF') goalChance = dominance * 0.45 + ovrDom * 0.20;
  else                        goalChance = dominance * 0.15 + ovrDom * 0.08;

  let playerGoals = 0;
  if (Math.random() < Math.min(goalChance, 0.99)) {
    // 高ドミナンスほど複数得点の確率が上昇
    const multiGoalChance = 0.10 + dominance * 0.40;
    const hatTrickChance  = 0.01 + dominance * 0.15;
    playerGoals = Math.random() < multiGoalChance ? 2 : 1;
    if (Math.random() < hatTrickChance) playerGoals = 3;
    if (dominance >= 0.95 && Math.random() < 0.06) playerGoals = 4; // 神域
  }
  // アシスト確率（ポジションによって差をつける）
  const assistChance = position === 'MF' ? 0.28 : position === 'FW' ? 0.18 : 0.10;
  const playerAssists = Math.random() < assistChance ? 1 : 0;

  // ─── 現実的なチームスコア計算 ───
  // チーム同士の強さ比率：同リーグなら互角、OVRで微調整
  const teamEffective = currentTeam.prestige * 10 + rand(-3, 3);
  const oppEffective  = leagueLevel * 10 + rand(-3, 3);
  const ovrBonus = (effectiveOvr - 50) / 200; // -0.25〜+0.25
  const rawRatio = teamEffective / Math.max(5, oppEffective) + ovrBonus;
  // 0.6〜1.8 にクランプ（7:0 のような極端なスコアを防ぐ）
  const strengthRatio = Math.min(1.8, Math.max(0.6, rawRatio));

  // ポワソン分布でゴール数（平均1.2〜2.2点）
  const baseTeamScore = poissonGoals(1.2 * strengthRatio);
  const opponentScore = poissonGoals(1.2 / strengthRatio);

  // 選手のゴール＋アシストはチームスコアに反映（アシストは味方ゴール保証）
  const teamScore = Math.max(playerGoals + playerAssists, baseTeamScore);
  const win = teamScore > opponentScore;

  // 評価点 — 高ドミナンス選手はほぼ毎試合高評価を独占
  const ratingBase = 4.0 + ovrDom * 5.5;
  let rating = ratingBase + playerGoals * 0.8 + playerAssists * 0.4;
  if (win) rating += 0.4;
  if (dominance >= 0.90) rating += 0.5; // 支配選手ボーナス
  rating = Math.max(3.0, Math.min(10.0, rating + (Math.random() * 0.4 - 0.2)));

  // 対戦相手
  const leagueTeams = TEAMS[state.currentLeague] ?? [];
  const opponents = leagueTeams.filter(t => t.id !== currentTeam.id);
  const opponentPool = opponents.length > 0 ? opponents : leagueTeams;
  const opponent = opponentPool.length > 0
    ? opponentPool[rand(0, opponentPool.length - 1)]
    : { id: 'unknown', name: '対戦相手', league: state.currentLeague, prestige: 1, salary: 0 };

  // ──── 分単位イベント生成 ────
  const events: MatchEvent[] = [];
  // アシストイベント自体が「味方ゴール」を表すため、
  // 追加の teammate_goal は (teamScore - playerGoals - playerAssists) 個だけ生成する
  const extraTeammatGoals = Math.max(0, teamScore - playerGoals - playerAssists);

  // 必要な分数を確保
  const totalGoals = teamScore + opponentScore;
  const chanceCount = rand(2, 4);
  const allMinutes = uniqueMinutes(totalGoals + chanceCount + playerAssists);
  let minIdx = 0;

  // 選手ゴール
  for (let i = 0; i < playerGoals; i++) {
    const min = allMinutes[minIdx++] ?? rand(1, 90);
    const tpl = PLAYER_GOAL_TEXTS[rand(0, PLAYER_GOAL_TEXTS.length - 1)];
    events.push({ minute: min, type: 'player_goal', text: tpl(state.playerName, min) });
  }

  // 選手アシスト（このイベント自体が味方の1ゴールを意味する）
  for (let i = 0; i < playerAssists; i++) {
    const min = allMinutes[minIdx++] ?? rand(1, 90);
    const tpl = PLAYER_ASSIST_TEXTS[rand(0, PLAYER_ASSIST_TEXTS.length - 1)];
    events.push({ minute: min, type: 'player_assist', text: tpl(state.playerName, min) });
  }

  // アシスト以外のチームメイトゴール
  for (let i = 0; i < extraTeammatGoals; i++) {
    const min = allMinutes[minIdx++] ?? rand(1, 90);
    const tpl = TEAMMATE_GOAL_TEXTS[rand(0, TEAMMATE_GOAL_TEXTS.length - 1)];
    events.push({ minute: min, type: 'teammate_goal', text: tpl(opponent.name, min) });
  }

  // 相手ゴール
  for (let i = 0; i < opponentScore; i++) {
    const min = allMinutes[minIdx++] ?? rand(1, 90);
    const tpl = OPPONENT_GOAL_TEXTS[rand(0, OPPONENT_GOAL_TEXTS.length - 1)];
    events.push({ minute: min, type: 'opponent_goal', text: tpl(opponent.name, min) });
  }

  // チャンス・セーブ
  for (let i = 0; i < chanceCount; i++) {
    const min = allMinutes[minIdx++] ?? rand(1, 90);
    const tpl = CHANCE_TEXTS[rand(0, CHANCE_TEXTS.length - 1)];
    const text = tpl(state.playerName, min);
    const type = text.startsWith('🛡️') || text.startsWith('⚠️') ? 'save' as const : 'chance' as const;
    events.push({ minute: min, type, text });
  }

  // 分数順にソート
  events.sort((a, b) => a.minute - b.minute);

  return {
    opponent: opponent.name,
    playerGoals,
    playerAssists,
    playerRating: parseFloat(rating.toFixed(1)),
    teamScore,
    opponentScore,
    win,
    events,
  };
}

export function generateTransferOffers(state: GameState): TransferOffer[] {
  const offers: TransferOffer[] = [];
  const currentLevel = LEAGUES[state.currentLeague].level;
  const thresholds = GAME_CONFIG.TRANSFER_THRESHOLDS;

  // ── パフォーマンスボーナス計算 ─────────────────────────
  // 順位が上位3位以内かどうか
  const sorted = [...state.leagueStandings].sort((a, b) => b.points - a.points);
  const rank   = sorted.findIndex(e => e.isPlayer) + 1;
  const isTop3 = rank >= 1 && rank <= 3;

  // シーズン評価が良いかどうか
  const goodRating = state.seasonRating >= 7.0;

  // ポジション別の活躍基準
  const goodGoals =
    (state.position === 'FW' && state.seasonGoals >= 8)  ||
    (state.position === 'MF' && state.seasonGoals >= 5)  ||
    (state.position === 'DF' && state.seasonGoals >= 2)  ||
    (state.position === 'GK' && state.matchesPlayed >= 20);

  const performanceBonus =
    (isTop3     ? 0.30 : 0) +
    (goodRating ? 0.20 : 0) +
    (goodGoals  ? 0.10 : 0);

  const messages = [
    '',  // placeholder (実際は下で使う)
  ];
  void messages; // suppress unused warning

  for (const [leagueId, minOvr] of Object.entries(thresholds)) {
    const targetLevel = LEAGUES[leagueId as keyof typeof LEAGUES].level;

    // 現在リーグ以下は対象外
    if (targetLevel <= currentLevel) continue;

    const ovrDiff = state.ovr - minOvr;

    // OVR が閾値より8以上低い場合は対象外（成績ボーナスでも届かない）
    if (ovrDiff < -8) continue;

    // 基本確率: 閾値超過→80%、閾値未満でも好成績なら最大60%まで
    const baseChance = ovrDiff >= 0
      ? 0.80
      : 0.20 + ((ovrDiff + 8) / 8) * 0.40;

    const totalChance = Math.min(0.95, baseChance + performanceBonus);

    if (Math.random() < totalChance) {
      const leagueTeams = TEAMS[leagueId as keyof typeof TEAMS];
      if (!leagueTeams || leagueTeams.length === 0) continue;
      const team: Team = leagueTeams[rand(0, leagueTeams.length - 1)];
      const salaryMultiplier = 1 + Math.max(0, ovrDiff) / 50;
      const salary = Math.round(team.salary * salaryMultiplier);

      const msgs = [
        `${team.name}はあなたのような才能ある選手を必要としています。`,
        `是非私たちのチームでプレーしてください。`,
        `あなたのプレーを長く見てきました。共に戦いましょう。`,
        `あなたならば私たちのチームを次のレベルへ導けると確信しています。`,
      ];

      offers.push({
        team,
        salary,
        message: msgs[rand(0, msgs.length - 1)],
      });
    }
  }

  // 最大3件に制限
  return offers.slice(0, 3);
}

export function shouldMatchOccur(state: GameState): boolean {
  const matchesPerSeason = LEAGUES[state.currentLeague].matchesPerSeason;
  const totalWeeks = 38;
  // 最大85%に制限（上位リーグでも毎週試合にならないようにする）
  const probability = Math.min(0.85, matchesPerSeason / totalWeeks);
  return Math.random() < probability;
}

export function getLeagueIcon(leagueId: string): string {
  const icons: Record<string, string> = {
    regional: '🏘️',
    j3: '🥉',
    j2: '🥈',
    j1: '🥇',
    premier_league: '⭐',
    champions_league: '👑',
  };
  return icons[leagueId] ?? '⚽';
}

export function getOvrColor(ovr: number): string {
  if (ovr >= 95) return 'text-yellow-400';
  if (ovr >= 85) return 'text-purple-400';
  if (ovr >= 75) return 'text-blue-400';
  if (ovr >= 60) return 'text-green-500';
  return 'text-gray-400';
}

export function getOvrBgColor(ovr: number): string {
  if (ovr >= 95) return 'bg-yellow-500';
  if (ovr >= 85) return 'bg-purple-500';
  if (ovr >= 75) return 'bg-blue-500';
  if (ovr >= 60) return 'bg-green-600';
  return 'bg-gray-500';
}

export function getCareerRank(state: GameState): { rank: string; description: string } {
  const isInCL = state.currentLeague === 'champions_league';
  const isInPL = state.currentLeague === 'premier_league';
  const isInJ1 = state.currentLeague === 'j1';
  const hasBallonDor = state.awards.includes('バロンドール');
  const hasCLTrophy = state.trophies.some(t => t.includes('チャンピオンズリーグ'));

  if (hasBallonDor || hasCLTrophy) {
    return { rank: 'S', description: '世界最高の選手として記憶される伝説的なキャリア！' };
  }
  if ((isInPL || isInCL) && state.totalGoals >= 100) {
    return { rank: 'A', description: '世界トップリーグで活躍した一流選手のキャリア！' };
  }
  if ((isInJ1 || isInPL || isInCL) && state.totalGoals >= 50) {
    return { rank: 'B', description: 'J1以上のリーグで活躍した優秀なキャリア！' };
  }
  if (state.currentLeague === 'j2' || isInJ1 || isInPL || isInCL) {
    return { rank: 'C', description: 'J2以上のリーグで地道に活躍したキャリア。' };
  }
  return { rank: 'D', description: '地道に頑張ったが、もう一歩届かなかったキャリア。' };
}

export { getNextLeague, LEAGUE_ORDER };
