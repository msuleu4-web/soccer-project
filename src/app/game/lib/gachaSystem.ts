import type { GameState, PlayerStats, Position } from '../types/game';
import { STAT_MAX } from './gameConfig';
import { calculateOVR } from './gameEngine';

// ══════════════════════════════════════════════════════════════════
// レアリティ体系
// ★3 World Class    3.00% (ピックアップ 0.70% / 通常 ★3 2.30%)
// ★2 Pro League    18.50%
// ★1 ユース        78.50%
// ══════════════════════════════════════════════════════════════════

export type GachaRarity = '★1' | '★2' | '★3';
export type GachaType   = 'standard' | 'pickup';

export const RARITY_LABEL: Record<GachaRarity, string> = {
  '★1': 'ユース',
  '★2': 'プロリーグ',
  '★3': 'ワールドクラス',
};

export const RARITY_STARS: Record<GachaRarity, string> = {
  '★1': '★',
  '★2': '★★',
  '★3': '★★★',
};

export const RARITY_COLOR: Record<GachaRarity, string> = {
  '★1': '#6b7280',
  '★2': '#3b82f6',
  '★3': '#eab308',
};

export const RARITY_GLOW: Record<GachaRarity, string> = {
  '★1': 'none',
  '★2': '0 0 14px #3b82f650',
  '★3': '0 0 28px #eab30870',
};

export const PICKUP_COLOR = '#ef4444';
export const PICKUP_GLOW  = '0 0 32px #ef444490';

// ── アイテム定義 ──────────────────────────────────────

export interface GachaItemEffect {
  shooting?: number;
  passing?: number;
  dribbling?: number;
  speed?: number;
  stamina?: number;
  defense?: number;
  allStats?: number;
  morale?: number;
  fatigue?: number;
  injury?: number;
  fans?: number;
  gachaCoins?: number;
  conductScore?: number;
  cabaretPenaltyReduce?: number;
  cabaretCountReduce?: number;
  retireAgeBonus?: number;
  ageReduce?: number;
  clQualified?: boolean;
  ballonDorFlag?: boolean;
  skillRandom?: boolean;
  wcWinBonus?: boolean;
}

export interface GachaItem {
  id: string;
  name: string;
  rarity: GachaRarity;
  isPickupEligible: boolean; // ピックアップ対象になりうるか
  forPosition?: Position[];  // ポジション限定
  icon: string;
  flavorText: string;
  effect: GachaItemEffect;
}

// ════════════════════════════════════════
// ★1 ユース (12種)
// ════════════════════════════════════════
const STAR1_ITEMS: GachaItem[] = [
  {
    id: 's1_energy',   name: 'エナジーゼリー',
    rarity: '★1', isPickupEligible: false, icon: '🥤',
    flavorText: '疲労を手軽に回復する定番サプリ。',
    effect: { fatigue: -15, morale: 5 },
  },
  {
    id: 's1_stamina',  name: 'スタミナ錠剤',
    rarity: '★1', isPickupEligible: false, icon: '💊',
    flavorText: '持久力を底上げする栄養剤。',
    effect: { stamina: 8 },
  },
  {
    id: 's1_speed',    name: 'スピードサプリ',
    rarity: '★1', isPickupEligible: false, icon: '⚡',
    flavorText: '瞬発力を強化する速効性サプリ。',
    effect: { speed: 8 },
  },
  {
    id: 's1_morale',   name: 'やる気の手紙',
    rarity: '★1', isPickupEligible: false, icon: '✉️',
    flavorText: 'ファンからの応援メッセージでモラル向上。',
    effect: { morale: 20 },
  },
  {
    id: 's1_shoot',    name: 'シュートの基礎',
    rarity: '★1', isPickupEligible: false, icon: '🎯',
    flavorText: 'フォームを見直してシュート精度が向上。',
    effect: { shooting: 10 },
  },
  {
    id: 's1_pass',     name: 'パスの基礎',
    rarity: '★1', isPickupEligible: false, icon: '📡',
    flavorText: '基礎パス練習でキック精度が上がった。',
    effect: { passing: 10 },
  },
  {
    id: 's1_dribble',  name: 'ドリブルの基礎',
    rarity: '★1', isPickupEligible: false, icon: '🕺',
    flavorText: 'ボールタッチの基礎を叩き直した。',
    effect: { dribbling: 10 },
  },
  {
    id: 's1_defense',  name: '守備の基礎',
    rarity: '★1', isPickupEligible: false, icon: '🛡️',
    flavorText: '守備ポジショニングの基礎を学んだ。',
    effect: { defense: 10 },
  },
  {
    id: 's1_coin_s',   name: 'スカウトコイン(小)',
    rarity: '★1', isPickupEligible: false, icon: '💰',
    flavorText: 'スカウト活動で使える少額のコイン。',
    effect: { gachaCoins: 30 },
  },
  {
    id: 's1_recover',  name: '回復薬',
    rarity: '★1', isPickupEligible: false, icon: '🧪',
    flavorText: '軽い疲労をすぐに取り除く回復薬。',
    effect: { fatigue: -50, injury: -1 },
  },
  {
    id: 's1_fan_s',    name: 'ファン応援団',
    rarity: '★1', isPickupEligible: false, icon: '📢',
    flavorText: '地域のサポーターが応援に来てくれた。',
    effect: { fans: 2000 },
  },
  {
    id: 's1_all_mini', name: '全能ミニ強化',
    rarity: '★1', isPickupEligible: false, icon: '🌱',
    flavorText: '全ての能力を少しずつ底上げする研鑽。',
    effect: { allStats: 5 },
  },
];

// ════════════════════════════════════════
// ★2 プロリーグ (11種)
// ════════════════════════════════════════
const STAR2_ITEMS: GachaItem[] = [
  {
    id: 's2_shoot',   name: 'プロシュート強化剤',
    rarity: '★2', isPickupEligible: false, icon: '🔥',
    flavorText: 'プロ選手向けの特製シュート強化注射。',
    effect: { shooting: 30 },
  },
  {
    id: 's2_pass',    name: 'プロパス強化剤',
    rarity: '★2', isPickupEligible: false, icon: '🎯',
    flavorText: 'パスの精度と視野を大幅に改善する。',
    effect: { passing: 30 },
  },
  {
    id: 's2_dribble', name: 'プロドリブル強化剤',
    rarity: '★2', isPickupEligible: false, icon: '🌀',
    flavorText: 'ボールタッチと突破力を大幅改善。',
    effect: { dribbling: 30 },
  },
  {
    id: 's2_speed',   name: 'プロスピード強化剤',
    rarity: '★2', isPickupEligible: false, icon: '💨',
    flavorText: '筋肉繊維を最適化してスピードが飛躍。',
    effect: { speed: 30 },
  },
  {
    id: 's2_stamina', name: 'プロスタミナ強化剤',
    rarity: '★2', isPickupEligible: false, icon: '💪',
    flavorText: '肺活量と心肺機能を大幅に向上させる。',
    effect: { stamina: 30 },
  },
  {
    id: 's2_defense', name: 'プロ守備強化剤',
    rarity: '★2', isPickupEligible: false, icon: '⚔️',
    flavorText: '守備の判断力と体の使い方が向上。',
    effect: { defense: 30 },
  },
  {
    id: 's2_all',     name: '総合強化プログラム',
    rarity: '★2', isPickupEligible: false, icon: '⭐',
    flavorText: '全能力をバランスよく強化する特訓合宿。',
    effect: { allStats: 15 },
  },
  {
    id: 's2_recover', name: '完全回復薬',
    rarity: '★2', isPickupEligible: false, icon: '💉',
    flavorText: 'あらゆる疲労と怪我を完治させる秘薬。',
    effect: { fatigue: -100, injury: -5 },
  },
  {
    id: 's2_fan',     name: 'メディアキャンペーン',
    rarity: '★2', isPickupEligible: false, icon: '📺',
    flavorText: '全国放送のインタビューでファンが急増。',
    effect: { fans: 20000 },
  },
  {
    id: 's2_coin',    name: 'スカウトコイン(中)',
    rarity: '★2', isPickupEligible: false, icon: '💰',
    flavorText: 'スカウト活動に使える中型コインバッグ。',
    effect: { gachaCoins: 150 },
  },
  {
    id: 's2_skill',   name: 'スキル解放カード',
    rarity: '★2', isPickupEligible: false, icon: '🎲',
    flavorText: '眠っていた才能を一つ開花させるカード。',
    effect: { skillRandom: true },
  },
];

// ════════════════════════════════════════
// ★3 ワールドクラス (8種)
// ピックアップ対象はプレイヤーのポジションに応じて決まる
// ════════════════════════════════════════
const STAR3_ITEMS: GachaItem[] = [
  {
    id: 's3_fw',      name: 'レジェンドFW覚醒',
    rarity: '★3', isPickupEligible: true,
    forPosition: ['FW'],
    icon: '👑',
    flavorText: '歴史的FWの魂が宿り、得点力が神域へ到達する。',
    effect: { shooting: 100, dribbling: 60, speed: 50 },
  },
  {
    id: 's3_mf',      name: 'レジェンドMF覚醒',
    rarity: '★3', isPickupEligible: true,
    forPosition: ['MF'],
    icon: '🧙',
    flavorText: '伝説のプレイメーカーとの共鳴でパス能力が頂点へ。',
    effect: { passing: 100, dribbling: 60, stamina: 50 },
  },
  {
    id: 's3_df',      name: 'レジェンドDF覚醒',
    rarity: '★3', isPickupEligible: true,
    forPosition: ['DF', 'GK'],
    icon: '🏯',
    flavorText: '不動の守護神の意志を受け継ぎ、守備が完璧になる。',
    effect: { defense: 100, stamina: 60, speed: 40 },
  },
  {
    id: 's3_gk',      name: 'レジェンドGK覚醒',
    rarity: '★3', isPickupEligible: true,
    forPosition: ['GK'],
    icon: '🥅',
    flavorText: '神の手を持つGKの技術を完全に習得した。',
    effect: { defense: 120, stamina: 60 },
  },
  {
    id: 's3_all',     name: '完全覚醒',
    rarity: '★3', isPickupEligible: true, icon: '💥',
    flavorText: 'あらゆる限界を超えた覚醒。全能力が爆発的に向上。',
    effect: { allStats: 80 },
  },
  {
    id: 's3_age',     name: '時の巻き戻し',
    rarity: '★3', isPickupEligible: false, icon: '⏪',
    flavorText: '禁断の秘術で時間を2年逆行させる。(最低18歳)',
    effect: { ageReduce: 2 },
  },
  {
    id: 's3_ballon',  name: 'バロンドールの鍵',
    rarity: '★3', isPickupEligible: false, icon: '🏅',
    flavorText: 'バロンドール受賞への特別フラグが立つ。OVR88+で欧州リーグ在籍時に確定。',
    effect: { ballonDorFlag: true },
  },
  {
    id: 's3_legend',  name: '伝説の血統',
    rarity: '★3', isPickupEligible: false, icon: '🌌',
    flavorText: '神話の域。全スタット+80、引退年齢上限+5の究極強化。',
    effect: { allStats: 80, retireAgeBonus: 5 },
  },
];

export const GACHA_ITEMS: GachaItem[] = [
  ...STAR1_ITEMS,
  ...STAR2_ITEMS,
  ...STAR3_ITEMS,
];

// ── ガチャ種別設定 ──────────────────────────────────

export const GACHA_COST: Record<GachaType, { single: number; multi: number }> = {
  standard: { single: 50,  multi: 450 },
  pickup:   { single: 80,  multi: 720 },
};

export const GACHA_META: Record<GachaType, { label: string; emoji: string; color: string; desc: string }> = {
  standard: {
    label: '通常スカウト',
    emoji: '🔍',
    color: '#3b82f6',
    desc: '常設スカウト。★3 3.00% / ★2 18.50% / ★1 78.50%。90連で★3確定。',
  },
  pickup: {
    label: 'ピックアップスカウト',
    emoji: '⭐',
    color: '#ef4444',
    desc: 'ピックアップ選手が高確率で出現！★3ピックアップ 0.70% / 他★3 2.30% / 90連天井あり。',
  },
};

// ── 確率テーブル ──────────────────────────────────

// 天井
export const PITY_CAP = 90;

// ソフト天井: 74連目以降から確率が徐々に上昇
const SOFT_PITY_START = 74;

function star3Rate(pity: number): number {
  if (pity < SOFT_PITY_START) return 0.030;
  // ソフト天井: 74連目から+6%/連ずつ上昇
  return Math.min(1.0, 0.030 + (pity - SOFT_PITY_START + 1) * 0.060);
}

// ── ピックアップアイテム取得 ────────────────────────

export function getPickupItemId(position: Position, _season: number): string {
  switch (position) {
    case 'FW': return 's3_fw';
    case 'MF': return 's3_mf';
    case 'DF': return 's3_df';
    case 'GK': return 's3_gk';
  }
}

function findItem(id: string): GachaItem {
  return GACHA_ITEMS.find(i => i.id === id) ?? GACHA_ITEMS[0];
}

function pickFrom(items: GachaItem[]): GachaItem {
  return items[Math.floor(Math.random() * items.length)];
}

// ── 抽選ロジック ──────────────────────────────────

export interface PullResult {
  item: GachaItem;
  isPickup: boolean;
}

function rollSingle(
  type: GachaType,
  pity: number,
  pickupId: string,
): { result: PullResult; newPity: number } {
  const r      = Math.random();
  const star3  = star3Rate(pity);
  const isSSR  = r < star3;
  const isStar2 = !isSSR && r < star3 + 0.185;

  if (isSSR) {
    // ★3 確定: pickup か通常★3 か
    let item: GachaItem;
    let isPickup = false;
    if (type === 'pickup') {
      // 0.70/(3.00) = 23.3% でピックアップ
      isPickup = Math.random() < (0.007 / star3);
      if (isPickup) {
        item = findItem(pickupId);
      } else {
        const star3pool = STAR3_ITEMS.filter(i => i.id !== pickupId);
        item = pickFrom(star3pool.length > 0 ? star3pool : STAR3_ITEMS);
      }
    } else {
      item = pickFrom(STAR3_ITEMS);
    }
    return { result: { item, isPickup }, newPity: 0 };
  }

  if (isStar2) {
    return { result: { item: pickFrom(STAR2_ITEMS), isPickup: false }, newPity: pity + 1 };
  }

  return { result: { item: pickFrom(STAR1_ITEMS), isPickup: false }, newPity: pity + 1 };
}

export function pullSingle(
  type: GachaType,
  pity: number,
  position: Position,
  season: number,
): { result: PullResult; newPity: number } {
  const pickupId = getPickupItemId(position, season);
  return rollSingle(type, pity, pickupId);
}

// 10連: 最終枠で★2以上を保証
export function pullMulti(
  type: GachaType,
  pity: number,
  position: Position,
  season: number,
): { results: PullResult[]; newPity: number } {
  const pickupId = getPickupItemId(position, season);
  const results: PullResult[] = [];
  let currentPity = pity;

  for (let i = 0; i < 10; i++) {
    const { result, newPity } = rollSingle(type, currentPity, pickupId);
    currentPity = newPity;

    // 最終枠: ★2以上の出現がない場合に保証
    if (i === 9) {
      const hasStar2Plus = results.some(r => r.item.rarity !== '★1');
      if (!hasStar2Plus && result.item.rarity === '★1') {
        results.push({ item: pickFrom(STAR2_ITEMS), isPickup: false });
        continue;
      }
    }
    results.push(result);
  }

  return { results, newPity: currentPity };
}

// ── アイテム効果適用 ──────────────────────────────

export function applyGachaItem(state: GameState, item: GachaItem): GameState {
  const { effect } = item;
  const mx       = STAT_MAX[state.position];
  const newStats = { ...state.stats };
  const statKeys = ['shooting','passing','dribbling','speed','stamina','defense'] as (keyof PlayerStats)[];

  // 훈련과 동일하게 상한에 가까울수록 효과 감소 (최소 15% 보장)
  const addStat = (k: keyof PlayerStats, v: number) => {
    const ratio = newStats[k] / mx[k];
    const scale = Math.max(0.15, Math.pow(1 - ratio, 1.5));
    const effective = Math.max(1, Math.round(v * scale));
    newStats[k] = Math.min(mx[k], Math.max(0, newStats[k] + effective));
  };

  if (effect.shooting)  addStat('shooting',  effect.shooting);
  if (effect.passing)   addStat('passing',   effect.passing);
  if (effect.dribbling) addStat('dribbling', effect.dribbling);
  if (effect.speed)     addStat('speed',     effect.speed);
  if (effect.stamina)   addStat('stamina',   effect.stamina);
  if (effect.defense)   addStat('defense',   effect.defense);
  if (effect.allStats)  statKeys.forEach(k => addStat(k, effect.allStats!));

  let newSkills = state.skills ?? [];
  if (effect.skillRandom) {
    const ALL_IDS = ['speed_star','sniper','playmaker','dribble_king','iron_body','wall','all_rounder','legend'];
    const locked  = ALL_IDS.filter(id => !newSkills.includes(id));
    if (locked.length > 0) newSkills = [...newSkills, locked[Math.floor(Math.random() * locked.length)]];
  }

  const currentAgeReduceUsed = state.ageReduceUsed ?? 0;
  const canAgeReduce    = effect.ageReduce && currentAgeReduceUsed < 2;
  const newAge          = canAgeReduce ? Math.max(18, state.age - effect.ageReduce!) : state.age;
  const newAgeReduceUsed = canAgeReduce ? currentAgeReduceUsed + 1 : currentAgeReduceUsed;
  const newCabaretCount = effect.cabaretCountReduce ? Math.max(0, (state.cabaretCount ?? 0) - effect.cabaretCountReduce) : (state.cabaretCount ?? 0);
  const newPenalty      = effect.cabaretPenaltyReduce ? Math.max(0, (state.cabaretPenaltyLevel ?? 0) - effect.cabaretPenaltyReduce) : (state.cabaretPenaltyLevel ?? 0);
  const baseConductScore = state.conductScore ?? 100;
  const newConduct      = effect.conductScore !== undefined ? Math.min(100, baseConductScore + effect.conductScore) : baseConductScore;

  return {
    ...state,
    stats:               newStats,
    ovr:                 calculateOVR(newStats, state.position),
    age:                 newAge,
    morale:              effect.morale  ? Math.min(100, state.morale + effect.morale) : state.morale,
    fatigue:             effect.fatigue ? Math.min(100, Math.max(0, state.fatigue + effect.fatigue)) : state.fatigue,
    injury:              effect.injury  ? Math.min(5, Math.max(0, state.injury + effect.injury)) : state.injury,
    fans:                effect.fans    ? (state.fans ?? 0) + effect.fans : state.fans,
    gachaCoins:          effect.gachaCoins ? (state.gachaCoins ?? 0) + effect.gachaCoins : (state.gachaCoins ?? 0),
    conductScore:        newConduct,
    cabaretCount:        newCabaretCount,
    cabaretPenaltyLevel: newPenalty,
    retireAgeBonus:      effect.retireAgeBonus ? (state.retireAgeBonus ?? 0) + effect.retireAgeBonus : (state.retireAgeBonus ?? 0),
    clQualified:         effect.clQualified ? true : state.clQualified,
    ballonDorFlag:       effect.ballonDorFlag ? true : (state.ballonDorFlag ?? false),
    wcWinBonus:          effect.wcWinBonus ? true : (state.wcWinBonus ?? false),
    skills:              newSkills,
    ageReduceUsed:       newAgeReduceUsed,
  };
}

// ── GC獲得計算 ────────────────────────────────────────

export function calcMatchGC(goals: number, win: boolean, isHatTrick: boolean, competition?: string): number {
  let gc = goals * 5 + (win ? 10 : 0) + (isHatTrick ? 30 : 0);
  if (competition?.startsWith('cl_'))  gc += 30;
  if (competition?.startsWith('wc_'))  gc += 50;
  if (competition === 'national') gc += 20;
  return gc;
}

export function calcSeasonGC(season: number, leagueLevel: number): number {
  return 50 + leagueLevel * 10 + (season % 5 === 0 ? 50 : 0);
}
