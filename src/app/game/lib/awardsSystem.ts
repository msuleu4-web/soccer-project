import type { GameState, SeasonAward, LeagueId } from '../types/game';
import { LEAGUES } from './leagueData';

// リーグごとの得点王・アシスト王しきい値
const GOAL_THRESHOLD: Record<LeagueId, number> = {
  regional:         6,
  j3:               8,
  j2:               10,
  j1:               13,
  premier_league:   16,
  champions_league: 20,
};
const ASSIST_THRESHOLD: Record<LeagueId, number> = {
  regional:         4,
  j3:               6,
  j2:               7,
  j1:               9,
  premier_league:   11,
  champions_league: 14,
};

interface AwardCheck {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: SeasonAward['rarity'];
  condition: (s: GameState) => boolean;
  unique?: boolean; // キャリアで一度だけ
}

const AWARD_DEFS: AwardCheck[] = [
  // ── ルーキー系 ─────────────────────────────────
  {
    id: 'rookie_of_year',
    name: '新人王',
    icon: '🌱',
    rarity: 'silver',
    description: 'リーグ最優秀新人選手として表彰された。',
    condition: s =>
      s.age <= 21 &&
      s.currentSeason <= 3 &&
      s.matchesPlayed >= 10 &&
      s.seasonRating >= 6.0,
    unique: true,
  },
  {
    id: 'breakthrough_player',
    name: 'ブレイクスルー賞',
    icon: '💥',
    rarity: 'bronze',
    description: '今シーズン最も飛躍した若手選手として認定された。',
    condition: s =>
      s.age <= 24 &&
      s.matchesPlayed >= 12 &&
      s.seasonRating >= 6.5 &&
      (s.ovr - (s.seasonStartOvr ?? s.ovr)) >= 8,
  },

  // ── 個人タイトル系 ──────────────────────────────
  {
    id: 'top_scorer',
    name: '得点王',
    icon: '⚽',
    rarity: 'gold',
    description: 'リーグ最多得点を記録し、得点王のタイトルを獲得した。',
    condition: s =>
      s.seasonGoals >= GOAL_THRESHOLD[s.currentLeague] &&
      s.matchesPlayed >= 10,
  },
  {
    id: 'assist_king',
    name: 'アシスト王',
    icon: '🎯',
    rarity: 'silver',
    description: 'リーグ最多アシストを記録した。',
    condition: s =>
      s.seasonAssists >= ASSIST_THRESHOLD[s.currentLeague] &&
      s.matchesPlayed >= 10,
  },
  {
    id: 'golden_boot_europe',
    name: 'ヨーロッパ ゴールデンブーツ',
    icon: '🥾',
    rarity: 'legendary',
    description: '欧州リーグの最多得点者に贈られる栄誉ある賞。',
    condition: s =>
      (s.currentLeague === 'premier_league' || s.currentLeague === 'champions_league') &&
      s.seasonGoals >= 25 &&
      s.matchesPlayed >= 20,
  },

  // ── MVP系 ────────────────────────────────────
  {
    id: 'league_mvp',
    name: 'リーグMVP',
    icon: '🏆',
    rarity: 'gold',
    description: 'リーグで最も輝いた選手に贈られるMVP賞。',
    condition: s =>
      s.seasonRating >= 8.0 &&
      s.matchesPlayed >= 20,
  },
  {
    id: 'j1_mvp',
    name: 'J1リーグ最優秀選手賞',
    icon: '🥇',
    rarity: 'gold',
    description: 'J1リーグシーズンMVP。日本サッカー最高の個人賞。',
    condition: s =>
      s.currentLeague === 'j1' &&
      s.seasonRating >= 7.8 &&
      s.matchesPlayed >= 20,
  },
  {
    id: 'bundesliga_player',
    name: 'ブンデスリーガ最優秀選手',
    icon: '🦅',
    rarity: 'gold',
    description: 'ドイツブンデスリーガ シーズンMVP。',
    condition: s =>
      s.currentLeague === 'premier_league' &&
      s.seasonRating >= 8.0 &&
      s.matchesPlayed >= 20,
  },
  {
    id: 'cl_mvp',
    name: 'プレミアリーグ/ラ・リーガ MVP',
    icon: '👑',
    rarity: 'legendary',
    description: '欧州最高峰リーグの最優秀選手賞。',
    condition: s =>
      s.currentLeague === 'champions_league' &&
      s.seasonRating >= 8.5 &&
      s.matchesPlayed >= 25,
  },

  // ── ベストイレブン系 ──────────────────────────────
  {
    id: 'best_eleven',
    name: 'ベストイレブン',
    icon: '⭐',
    rarity: 'silver',
    description: 'シーズンベストイレブンに選出された。',
    condition: s =>
      s.seasonRating >= 7.5 &&
      s.matchesPlayed >= 15,
  },
  {
    id: 'best_eleven_europe',
    name: 'ヨーロッパ ベストイレブン',
    icon: '🌟',
    rarity: 'gold',
    description: '欧州最優秀イレブンに選出された。',
    condition: s =>
      (s.currentLeague === 'premier_league' || s.currentLeague === 'champions_league') &&
      s.seasonRating >= 8.0 &&
      s.matchesPlayed >= 20,
  },

  // ── ポジション賞 ─────────────────────────────────
  {
    id: 'best_gk',
    name: 'ベストGK賞',
    icon: '🥅',
    rarity: 'silver',
    description: 'シーズン最優秀ゴールキーパーに選ばれた。',
    condition: s =>
      s.position === 'GK' &&
      s.seasonRating >= 7.5 &&
      s.matchesPlayed >= 15,
  },
  {
    id: 'best_df',
    name: 'ベストDF賞',
    icon: '🛡️',
    rarity: 'silver',
    description: 'シーズン最優秀ディフェンダーに選ばれた。',
    condition: s =>
      s.position === 'DF' &&
      s.seasonRating >= 7.5 &&
      s.matchesPlayed >= 15,
  },
  {
    id: 'best_mf',
    name: 'ベストMF賞',
    icon: '🧠',
    rarity: 'silver',
    description: 'シーズン最優秀ミッドフィールダーに選ばれた。',
    condition: s =>
      s.position === 'MF' &&
      s.seasonRating >= 7.5 &&
      s.matchesPlayed >= 15,
  },
  {
    id: 'best_fw',
    name: 'ベストFW賞',
    icon: '🎯',
    rarity: 'silver',
    description: 'シーズン最優秀フォワードに選ばれた。',
    condition: s =>
      s.position === 'FW' &&
      s.seasonRating >= 7.5 &&
      s.seasonGoals >= GOAL_THRESHOLD[s.currentLeague] * 0.7 &&
      s.matchesPlayed >= 15,
  },

  // ── 世界個人賞 ──────────────────────────────────
  {
    id: 'world_player',
    name: 'FIFA ワールドプレイヤー・オブ・ザ・イヤー',
    icon: '🌍',
    rarity: 'legendary',
    description: '世界最優秀選手賞。世界中のサッカーファンが認める称号。',
    condition: s =>
      s.ovr >= 90 &&
      (s.currentLeague === 'premier_league' || s.currentLeague === 'champions_league') &&
      s.seasonRating >= 8.2 &&
      s.matchesPlayed >= 25,
    unique: true,
  },
  {
    id: 'ballon_dor_award',
    name: 'バロンドール',
    icon: '🏅',
    rarity: 'legendary',
    description: '世界で最も権威ある個人賞。フランス・フットボール誌が選ぶ最優秀選手。',
    condition: s =>
      s.ovr >= 95 &&
      (s.currentLeague === 'premier_league' || s.currentLeague === 'champions_league') &&
      s.seasonRating >= 8.5 &&
      s.matchesPlayed >= 30,
    unique: true,
  },

  // ── 特別賞 ─────────────────────────────────────
  {
    id: 'iron_player',
    name: 'フル出場賞',
    icon: '💪',
    rarity: 'bronze',
    description: '今シーズン一度も欠場せず全試合に出場した。',
    condition: s => {
      const maxMatches = Math.floor(
        (s.currentLeague === 'j1' || s.currentLeague === 'j2' ? 34 :
         s.currentLeague === 'j3' ? 30 :
         s.currentLeague === 'premier_league' ? 34 :
         s.currentLeague === 'champions_league' ? 38 : 20) * 0.9
      );
      return s.matchesPlayed >= maxMatches && s.injury === 0;
    },
  },
  {
    id: 'hat_trick_king',
    name: 'ハットトリック王',
    icon: '🎩',
    rarity: 'gold',
    description: '今シーズン3試合以上でハットトリックを達成。稀有な記録。',
    condition: s =>
      s.seasonGoals >= GOAL_THRESHOLD[s.currentLeague] * 1.5 &&
      s.matchesPlayed >= 15,
  },
  {
    id: 'fans_choice',
    name: 'ファン投票最優秀選手',
    icon: '❤️',
    rarity: 'silver',
    description: 'サポーターの投票で選ばれた最も愛される選手賞。',
    condition: s =>
      (s.fans ?? 0) >= 50000 &&
      s.matchesPlayed >= 15 &&
      s.seasonRating >= 7.0,
  },
  {
    id: 'captain_excellent',
    name: '最優秀キャプテン賞',
    icon: '🎖️',
    rarity: 'silver',
    description: 'チームを牽引するリーダーシップが認められた。',
    condition: s =>
      s.seasonRating >= 7.5 &&
      s.matchesPlayed >= 25 &&
      s.morale >= 80,
  },
];

export function checkSeasonAwards(state: GameState): SeasonAward[] {
  const leagueName = LEAGUES[state.currentLeague].name;
  const wonIds = new Set(state.seasonAwards?.map(a => a.id) ?? []);

  return AWARD_DEFS
    .filter(def => {
      if (def.unique && wonIds.has(def.id)) return false;
      return def.condition(state);
    })
    .map(def => ({
      id: def.id,
      name: def.name,
      icon: def.icon,
      description: def.description,
      rarity: def.rarity,
      season: state.currentSeason,
      league: leagueName,
    }));
}

export const RARITY_LABEL: Record<SeasonAward['rarity'], string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold:   'ゴールド',
  legendary: 'レジェンド',
};

export const RARITY_COLOR: Record<SeasonAward['rarity'], string> = {
  bronze:    '#cd7f32',
  silver:    '#c0c0c0',
  gold:      '#FFD700',
  legendary: '#9b59b6',
};
