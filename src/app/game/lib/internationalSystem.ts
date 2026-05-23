import type { GameState, MatchResult, MatchEvent, MatchCompetition } from '../types/game';
import { STAT_MAX } from './gameConfig';

// ── 対戦相手リスト ──────────────────────────────────────

const CL_GROUP_OPPONENTS = [
  'ガラタサライ CF', 'FCポルト', 'アヤックス', 'ベンフィカ',
  'PSV アイントホーフェン', 'セルティック FC', 'シャフタール',
  'ディナモ・ザグレブ', 'RBライプツィヒ', 'ビジャレアル CF',
];
const CL_R16_OPPONENTS = [
  'バイエルン・ミュンヘン', 'ユベントス', 'インテル', 'ACミラン',
  'PSG', 'アトレティコ', 'ドルトムント', 'ナポリ',
];
const CL_QF_OPPONENTS = [
  'レアル・マドリード', 'マンチェスター・シティ', 'バルセロナ', 'リバプール',
];
const CL_SF_OPPONENTS  = ['レアル・マドリード', 'マンチェスター・シティ'];
const CL_FINAL_OPPONENT = 'CLファイナル — 欧州最強チーム';

const NATIONAL_OPPONENTS = [
  '韓国代表', '中国代表', 'サウジアラビア代表', 'オーストラリア代表',
  'イラン代表', 'UAE代表', '北朝鮮代表', 'カタール代表',
];
const WC_GROUP_OPPONENTS = [
  'セネガル代表', 'エクアドル代表', 'モロッコ代表', 'ポーランド代表',
  'カナダ代表', 'チュニジア代表', 'コスタリカ代表', 'オーストラリア代表',
];
const WC_SF_OPPONENTS    = ['フランス代表', 'スペイン代表', 'ドイツ代表', 'イングランド代表'];
const WC_FINAL_OPPONENT  = 'ブラジル代表 — WCファイナル';

// ── CL参加条件 ─────────────────────────────────────────

/** player's team が top3 かどうか判定 */
export function isTeamInTop3(standings: GameState['leagueStandings']): boolean {
  if (!standings || standings.length === 0) return false;
  const sorted = [...standings].sort((a, b) => b.points - a.points);
  const idx    = sorted.findIndex(s => s.isPlayer);
  return idx !== -1 && idx < 3;      // 0-indexed → 1〜3位
}

/** 欧州リーグ（CL資格対象）かどうか */
export function isEuropeanLeague(league: string): boolean {
  return league === 'premier_league' || league === 'champions_league';
}

// ── CL マッチ週の判定 ─────────────────────────────────

const CL_GROUP_WEEKS    = [6, 13, 20] as const;
const CL_R16_WEEK       = 25;
const CL_QF_WEEK        = 29;
const CL_SF_WEEK        = 33;
const CL_FINAL_WEEK     = 37;
const NATIONAL_WEEK     = 22;         // フレンドリーマッチ
const NATIONAL_WC_QUAL_WEEKS = [8, 30] as const; // WC予選年

export function isCLGroupWeek(week: number)  { return (CL_GROUP_WEEKS as readonly number[]).includes(week); }
export function isCLR16Week(week: number)    { return week === CL_R16_WEEK; }
export function isCLQFWeek(week: number)     { return week === CL_QF_WEEK; }
export function isCLSFWeek(week: number)     { return week === CL_SF_WEEK; }
export function isCLFinalWeek(week: number)  { return week === CL_FINAL_WEEK; }
export function isNationalWeek(week: number, season: number) {
  if (week === NATIONAL_WEEK) return true;
  if (season % 4 === 3) return (NATIONAL_WC_QUAL_WEEKS as readonly number[]).includes(week);
  return false;
}

// ── WC条件 ────────────────────────────────────────────

export function isWCYear(season: number)       { return season > 0 && season % 4 === 0; }
export function qualifiesForWC(state: GameState) {
  return state.ovr >= 72 && (state.nationalCaps ?? 0) >= 3;
}

// ── ランダム選択ユーティリティ ─────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ── 国際試合シミュレーション ──────────────────────────

export type IntlMatchType =
  | 'cl_group' | 'cl_r16' | 'cl_qf' | 'cl_sf' | 'cl_final'
  | 'national'
  | 'wc_group' | 'wc_sf' | 'wc_final';

interface IntlMatchConfig {
  opponentStrength: number; // 1〜10
  opponent: string;
  competition: MatchCompetition;
  round: string;
}

function getMatchConfig(type: IntlMatchType, state: GameState): IntlMatchConfig {
  switch (type) {
    case 'cl_group':  return { opponentStrength: 6 + rand(0,2), opponent: pick(CL_GROUP_OPPONENTS), competition: 'cl_group', round: `グループステージ ${state.clGroupStage + 1}/3` };
    case 'cl_r16':    return { opponentStrength: 7 + rand(0,1), opponent: pick(CL_R16_OPPONENTS),   competition: 'cl_r16',   round: 'ラウンド16' };
    case 'cl_qf':     return { opponentStrength: 8,             opponent: pick(CL_QF_OPPONENTS),    competition: 'cl_qf',    round: 'クォーターファイナル' };
    case 'cl_sf':     return { opponentStrength: 9,             opponent: pick(CL_SF_OPPONENTS),    competition: 'cl_sf',    round: 'セミファイナル' };
    case 'cl_final':  return { opponentStrength: 10,            opponent: CL_FINAL_OPPONENT,         competition: 'cl_final', round: '🏆 チャンピオンズリーグ ファイナル' };
    case 'national':  return { opponentStrength: 5 + rand(0,2), opponent: pick(NATIONAL_OPPONENTS), competition: 'national', round: '国際親善試合' };
    case 'wc_group':  return { opponentStrength: 5 + rand(0,3), opponent: pick(WC_GROUP_OPPONENTS), competition: 'wc_group', round: `グループステージ ${state.wcRound + 1}/3` };
    case 'wc_sf':     return { opponentStrength: 8 + rand(0,1), opponent: pick(WC_SF_OPPONENTS),    competition: 'wc_sf',    round: '🌍 ワールドカップ 準決勝' };
    case 'wc_final':  return { opponentStrength: 10,            opponent: WC_FINAL_OPPONENT,         competition: 'wc_final', round: '🏆 ワールドカップ ファイナル' };
  }
}

export function simulateIntlMatch(state: GameState, type: IntlMatchType): MatchResult {
  const cfg = getMatchConfig(type, state);
  const mx  = STAT_MAX[state.position];

  // 選手のドミナンス計算（league と同じロジック）
  const shootRatio = Math.min(1.0, state.stats.shooting  / mx.shooting);
  const dribRatio  = Math.min(1.0, state.stats.dribbling / mx.dribbling);
  const speedRatio = Math.min(1.0, state.stats.speed     / mx.speed);
  const dominance  = Math.pow(shootRatio * 0.5 + dribRatio * 0.3 + speedRatio * 0.2, 1.8);
  const ovrFactor  = Math.pow(state.ovr / 99, 2.0);

  // 相手の強さに応じた勝率調整
  const strengthAdv = (state.ovr - cfg.opponentStrength * 9) / 100; // -0.9 〜 +0.1
  const winChance   = Math.max(0.10, Math.min(0.90, 0.45 + strengthAdv + dominance * 0.25));

  const win = Math.random() < winChance;

  // ゴール数
  let playerGoals = 0;
  const goalChance = dominance * 0.70 + ovrFactor * 0.30;
  if (Math.random() < Math.min(goalChance, 0.95)) {
    playerGoals = Math.random() < 0.25 ? 2 : 1;
    if (Math.random() < 0.08) playerGoals = 3;
  }
  const playerAssists = Math.random() < 0.20 ? 1 : 0;

  // スコア
  const teamScore     = Math.max(playerGoals + playerAssists, win ? rand(1,3) : rand(0,2));
  const opponentScore = win ? rand(0, teamScore - 1) : rand(teamScore, teamScore + 2);

  // 評価点
  let rating = 5.0 + ovrFactor * 4.0;
  rating += playerGoals * 0.8 + playerAssists * 0.4;
  if (win) rating += 0.5;
  rating = Math.max(3.0, Math.min(10.0, rating + (Math.random() * 0.4 - 0.2)));

  // イベント生成（簡易）
  const events: MatchEvent[] = [];
  const GOAL_TEXTS = [
    (n: string, m: number) => `⚽ ${m}分 ${n}がシュート！ゴール！`,
    (n: string, m: number) => `⚽ ${m}分 ${n}の強烈なミドルシュートがネットを揺らす！`,
    (n: string, m: number) => `⚽ ${m}分 ${n}がGKの股を抜いてゴール！`,
  ];
  const usedMins = new Set<number>();
  const nextMin  = () => { let m; do { m = rand(1, 90); } while (usedMins.has(m)); usedMins.add(m); return m; };

  for (let i = 0; i < playerGoals; i++) {
    const m = nextMin();
    events.push({ minute: m, type: 'player_goal', text: pick(GOAL_TEXTS)(state.playerName, m) });
  }
  for (let i = 0; i < playerAssists; i++) {
    const m = nextMin();
    events.push({ minute: m, type: 'player_assist', text: `🎯 ${m}分 ${state.playerName}の絶妙なパスにチームメイトが合わせてゴール！（アシスト）` });
  }
  const opp = Math.max(0, opponentScore);
  for (let i = 0; i < opp; i++) {
    const m = nextMin();
    events.push({ minute: m, type: 'opponent_goal', text: `💥 ${m}分 ${cfg.opponent}が得点。失点。` });
  }

  events.sort((a, b) => a.minute - b.minute);

  return {
    opponent: cfg.opponent,
    playerGoals,
    playerAssists,
    playerRating: parseFloat(rating.toFixed(1)),
    teamScore: win ? teamScore : Math.min(teamScore, opponentScore - 1 < 0 ? 0 : opponentScore - 1),
    opponentScore: win ? opponentScore : opponentScore,
    win,
    events,
    competition: cfg.competition,
    round: cfg.round,
  };
}

// ── CLラウンドテキスト ────────────────────────────────

export function getCLRoundLabel(knockoutRound: number): string {
  switch (knockoutRound) {
    case 1: return 'ラウンド16';
    case 2: return 'クォーターファイナル';
    case 3: return 'セミファイナル';
    case 4: return 'ファイナル';
    default: return 'グループステージ';
  }
}
