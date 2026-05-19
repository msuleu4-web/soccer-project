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

export interface TrainingResult {
  statsChange: Partial<PlayerStats>;
  fatigueChange: number;
  injuryOccurred: boolean;
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

// 収穫逓減：現在値/上限で計算するので100超えスタットでも正常動作
// raw < 1 のとき確率的に +1 を返す（上限近くでも必ずいつか上がる）
function diminishing(base: number, currentValue: number, morale: number, maxValue: number): number {
  if (base <= 0 || currentValue >= maxValue) return 0;
  const factor = (1 - currentValue / maxValue) * (morale / 100);
  if (factor <= 0) return 0;
  const raw = base * factor;
  if (raw >= 1) return Math.round(raw);
  // 端数部分を確率に変換: raw=0.37 → 37%で+1, 63%で+0
  return Math.random() < raw ? 1 : 0;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function applyTraining(state: GameState, trainingType: TrainingType): TrainingResult {
  const { stats, morale, fatigue, position } = state;
  const halfEffect = fatigue >= GAME_CONFIG.FATIGUE_INJURY_THRESHOLD ? 0.5 : 1;
  let injuryOccurred = false;

  if (fatigue >= GAME_CONFIG.FATIGUE_INJURY_THRESHOLD && Math.random() < GAME_CONFIG.FATIGUE_INJURY_CHANCE) {
    injuryOccurred = true;
  }

  const mx = STAT_MAX[position]; // ポジション別上限
  const statsChange: Partial<PlayerStats> = {};
  let fatigueChange = 0;

  switch (trainingType) {
    case 'shooting': {
      const base = rand(3, 5);
      statsChange.shooting = diminishing(base * halfEffect, stats.shooting, morale, mx.shooting);
      statsChange.passing  = diminishing(1   * halfEffect, stats.passing,  morale, mx.passing);
      fatigueChange = 15;
      break;
    }
    case 'passing': {
      const base = rand(3, 5);
      statsChange.passing   = diminishing(base * halfEffect, stats.passing,   morale, mx.passing);
      statsChange.dribbling = diminishing(1    * halfEffect, stats.dribbling, morale, mx.dribbling);
      fatigueChange = 10;
      break;
    }
    case 'dribbling': {
      const base = rand(3, 5);
      statsChange.dribbling = diminishing(base * halfEffect, stats.dribbling, morale, mx.dribbling);
      statsChange.speed     = diminishing(1    * halfEffect, stats.speed,     morale, mx.speed);
      fatigueChange = 15;
      break;
    }
    case 'physical': {
      const baseSpeed   = rand(2, 4);
      const baseStamina = rand(2, 4);
      statsChange.speed   = diminishing(baseSpeed   * halfEffect, stats.speed,   morale, mx.speed);
      statsChange.stamina = diminishing(baseStamina * halfEffect, stats.stamina, morale, mx.stamina);
      fatigueChange = 20;
      break;
    }
    case 'defense': {
      const base = rand(3, 5);
      statsChange.defense = diminishing(base * halfEffect, stats.defense, morale, mx.defense);
      statsChange.stamina = diminishing(1    * halfEffect, stats.stamina, morale, mx.stamina);
      fatigueChange = 15;
      break;
    }
    case 'rest': {
      fatigueChange = -30;
      break;
    }
  }

  return { statsChange, fatigueChange, injuryOccurred };
}

// ランダムな分を重複なしで生成
function uniqueMinutes(count: number): number[] {
  const mins = new Set<number>();
  while (mins.size < count) mins.add(rand(1, 90));
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
  (opponent: string, min: number) => `⚽ ${min}分 チームメイトのシュートがゴール！(${opponent} 0-1)`,
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

export function simulateMatch(state: GameState): MatchResult {
  const { stats, ovr, currentTeam, position } = state;
  const leagueLevel = LEAGUES[state.currentLeague].level;
  const opponentStrength = leagueLevel * 10 + rand(-5, 5);

  const fatiguePenalty = state.fatigue > 50 ? (state.fatigue - 50) / 100 : 0;
  const moraleFactor = state.morale / 100;
  const effectiveOvr = ovr * (1 - fatiguePenalty * 0.3) * (0.7 + moraleFactor * 0.3);

  // 個人ゴール・アシスト確率
  let goalChance = 0;
  if (position === 'FW')      goalChance = (stats.shooting / 100) * 0.6 + (effectiveOvr / 100) * 0.4;
  else if (position === 'MF') goalChance = (stats.shooting / 100) * 0.3 + (effectiveOvr / 100) * 0.2;
  else                        goalChance = (stats.shooting / 100) * 0.1 + (effectiveOvr / 100) * 0.05;

  let playerGoals = 0;
  if (Math.random() < goalChance * 1.5) {
    playerGoals = Math.random() < 0.25 ? 2 : 1;
    if (Math.random() < 0.05) playerGoals = 3; // ハットトリック
  }
  const playerAssists = Math.random() < 0.25 ? 1 : 0;

  // チーム全体スコア（選手ゴールを必ず含む）
  const teamStrength = currentTeam.prestige * 15 + ovr * 0.5;
  const baseTeamScore = Math.round(Math.random() * 3 + teamStrength / opponentStrength);
  // アシストはチームゴールとは別カウントなので playerGoals のみ保証
  const teamScore = Math.max(playerGoals, baseTeamScore);
  const opponentScore = Math.round(Math.random() * 3 + opponentStrength / (teamStrength + 1));
  const win = teamScore > opponentScore;

  // 評価点
  let rating = 5.0 + (effectiveOvr - 50) / 20;
  rating += playerGoals * 0.8 + playerAssists * 0.4;
  if (win) rating += 0.5;
  rating = Math.max(3.0, Math.min(10.0, rating + (Math.random() - 0.5)));

  // 対戦相手
  const leagueTeams = TEAMS[state.currentLeague];
  const opponents = leagueTeams.filter(t => t.id !== currentTeam.id);
  const opponent = opponents[rand(0, opponents.length - 1)] ?? leagueTeams[0];

  // ──── 分単位イベント生成 ────
  const events: MatchEvent[] = [];
  // チームメイトゴール = チームスコア - 選手のゴール（アシストはゴールではない）
  const teammatGoals = teamScore - playerGoals;

  // 必要な分数を確保
  const totalGoals = teamScore + opponentScore;
  const chanceCount = rand(2, 4);
  const allMinutes = uniqueMinutes(totalGoals + chanceCount + playerAssists);
  let minIdx = 0;

  // 選手ゴール
  for (let i = 0; i < playerGoals; i++) {
    const min = allMinutes[minIdx++];
    const tpl = PLAYER_GOAL_TEXTS[rand(0, PLAYER_GOAL_TEXTS.length - 1)];
    events.push({ minute: min, type: 'player_goal', text: tpl(state.playerName, min) });
  }

  // 選手アシスト
  for (let i = 0; i < playerAssists; i++) {
    const min = allMinutes[minIdx++];
    const tpl = PLAYER_ASSIST_TEXTS[rand(0, PLAYER_ASSIST_TEXTS.length - 1)];
    events.push({ minute: min, type: 'player_assist', text: tpl(state.playerName, min) });
  }

  // チームメイトゴール
  for (let i = 0; i < Math.max(0, teammatGoals); i++) {
    const min = allMinutes[minIdx++];
    const tpl = TEAMMATE_GOAL_TEXTS[rand(0, TEAMMATE_GOAL_TEXTS.length - 1)];
    events.push({ minute: min, type: 'teammate_goal', text: tpl(opponent.name, min) });
  }

  // 相手ゴール
  for (let i = 0; i < opponentScore; i++) {
    const min = allMinutes[minIdx++];
    const tpl = OPPONENT_GOAL_TEXTS[rand(0, OPPONENT_GOAL_TEXTS.length - 1)];
    events.push({ minute: min, type: 'opponent_goal', text: tpl(opponent.name, min) });
  }

  // チャンス・セーブ
  for (let i = 0; i < chanceCount; i++) {
    const min = allMinutes[minIdx++] ?? rand(1, 90);
    const tpl = CHANCE_TEXTS[rand(0, CHANCE_TEXTS.length - 1)];
    const type = tpl(state.playerName, min).startsWith('🛡️') || tpl(state.playerName, min).startsWith('⚠️')
      ? 'save' as const : 'chance' as const;
    events.push({ minute: min, type, text: tpl(state.playerName, min) });
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

  for (const [leagueId, minOvr] of Object.entries(thresholds)) {
    if (state.ovr >= minOvr) {
      const targetLevel = LEAGUES[leagueId as keyof typeof LEAGUES].level;
      if (targetLevel > currentLevel || (targetLevel === currentLevel && Math.random() < 0.3)) {
        const leagueTeams = TEAMS[leagueId as keyof typeof TEAMS];
        const team: Team = leagueTeams[rand(0, leagueTeams.length - 1)];
        const salaryMultiplier = 1 + (state.ovr - minOvr) / 50;
        const salary = Math.round(team.salary * salaryMultiplier);

        const messages = [
          `${team.name}はあなたのような才能ある選手を必要としています。`,
          `是非私たちのチームでプレーしてください。`,
          `あなたのプレーを長く見てきました。共に戦いましょう。`,
          `あなたならば私たちのチームを次のレベルへ導けると確信しています。`,
        ];

        offers.push({
          team,
          salary,
          message: messages[rand(0, messages.length - 1)],
        });
      }
    }
  }

  // Limit to 3 offers max
  return offers.slice(0, 3);
}

export function shouldMatchOccur(state: GameState): boolean {
  const matchesPerSeason = LEAGUES[state.currentLeague].matchesPerSeason;
  const totalWeeks = 38;
  const probability = matchesPerSeason / totalWeeks;
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
