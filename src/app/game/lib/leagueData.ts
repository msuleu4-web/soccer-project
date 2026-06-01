import type { LeagueId, Team } from '../types/game';

export const LEAGUES: Record<LeagueId, { name: string; level: number; matchesPerSeason: number; country: string }> = {
  regional:         { name: '地域リーグ',               level: 1, matchesPerSeason: 20, country: '🇯🇵 日本' },
  j3:               { name: 'J3リーグ',                 level: 2, matchesPerSeason: 30, country: '🇯🇵 日本' },
  j2:               { name: 'J2リーグ',                 level: 3, matchesPerSeason: 34, country: '🇯🇵 日本' },
  j1:               { name: 'J1リーグ',                 level: 4, matchesPerSeason: 34, country: '🇯🇵 日本' },
  premier_league:   { name: 'ブンデスリーガ',           level: 5, matchesPerSeason: 34, country: '🇩🇪 ドイツ' },
  champions_league: { name: 'プレミアリーグ / ラ・リーガ', level: 6, matchesPerSeason: 38, country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🇪🇸 欧州最高峰' },
};

export const LEAGUE_ORDER: LeagueId[] = [
  'regional', 'j3', 'j2', 'j1', 'premier_league', 'champions_league',
];

export const TEAMS: Record<LeagueId, Team[]> = {

  // 地域リーグ：東北・北海道・山陰の小都市
  regional: [
    { id: 'aomori_sol',   name: 'FC青森ソルジャーズ',      league: 'regional', prestige: 1, salary: 10 },
    { id: 'iwate_frt',    name: '岩手フロンティアFC',       league: 'regional', prestige: 1, salary: 11 },
    { id: 'akita_nth',    name: '秋田ノーザンズ',           league: 'regional', prestige: 1, salary: 10 },
    { id: 'yamagata_rv',  name: '山形リバーズ',             league: 'regional', prestige: 1, salary: 12 },
    { id: 'tottori_win',  name: '鳥取ウィンズ',             league: 'regional', prestige: 1, salary: 10 },
    { id: 'shimane_ath',  name: '島根アスレティックス',     league: 'regional', prestige: 1, salary: 11 },
    { id: 'kochi_pio',    name: '高知パイオニアーズ',       league: 'regional', prestige: 1, salary: 10 },
  ],

  // J3リーグ：地方中核都市
  j3: [
    { id: 'toyama_van',   name: '富山ヴァンガード',         league: 'j3', prestige: 2, salary: 22 },
    { id: 'ishikawa_swn', name: '石川スワンズ',             league: 'j3', prestige: 2, salary: 24 },
    { id: 'fukui_em',     name: '福井エメラルズ',           league: 'j3', prestige: 2, salary: 21 },
    { id: 'miyazaki_sun', name: '宮崎サンシャインFC',       league: 'j3', prestige: 2, salary: 25 },
    { id: 'oita_grn',     name: '大分グリーンズ',           league: 'j3', prestige: 2, salary: 22 },
    { id: 'saga_utd',     name: '佐賀ユナイテッド',         league: 'j3', prestige: 2, salary: 20 },
    { id: 'nagasaki_bay', name: '長崎ベイスターズ',         league: 'j3', prestige: 2, salary: 23 },
    { id: 'yamaguchi_wv', name: '山口ウェーブ',             league: 'j3', prestige: 2, salary: 21 },
  ],

  // J2リーグ：中規模都市
  j2: [
    { id: 'niigata_alb',  name: '新潟アルビス',             league: 'j2', prestige: 3, salary: 55 },
    { id: 'nagano_alp',   name: '長野アルパインズ',         league: 'j2', prestige: 3, salary: 50 },
    { id: 'shizuoka_fz',  name: '静岡フォルツァ',           league: 'j2', prestige: 3, salary: 65 },
    { id: 'okayama_brv',  name: '岡山ブレイブズ',           league: 'j2', prestige: 3, salary: 58 },
    { id: 'kumamoto_vlc', name: '熊本ヴォルカーノ',         league: 'j2', prestige: 3, salary: 60 },
    { id: 'mie_tidal',    name: '三重タイダルFC',           league: 'j2', prestige: 3, salary: 54 },
    { id: 'gunma_hawks',  name: '群馬ホークス',             league: 'j2', prestige: 3, salary: 56 },
    { id: 'tochigi_sc',   name: '栃木スカイズ',             league: 'j2', prestige: 3, salary: 52 },
    { id: 'tokushima_vs', name: '徳島ヴォルティスタ',       league: 'j2', prestige: 3, salary: 51 },
  ],

  // J1リーグ：主要都市
  j1: [
    { id: 'tokyo_vic',    name: '東京ヴィクトリア',         league: 'j1', prestige: 4, salary: 130 },
    { id: 'osaka_grd',    name: '大阪グランデ',             league: 'j1', prestige: 4, salary: 120 },
    { id: 'nagoya_phx',   name: '名古屋フェニックス',       league: 'j1', prestige: 4, salary: 125 },
    { id: 'yokohama_mb',  name: '横浜マリンブルー',         league: 'j1', prestige: 4, salary: 115 },
    { id: 'sapporo_pol',  name: '札幌ポーラーズ',           league: 'j1', prestige: 4, salary: 105 },
    { id: 'fukuoka_wng',  name: '福岡ウィングス',           league: 'j1', prestige: 4, salary: 110 },
    { id: 'hiroshima_lg', name: '広島レジェンズ',           league: 'j1', prestige: 4, salary: 112 },
    { id: 'sendai_rl',    name: '仙台ロイヤルズ',           league: 'j1', prestige: 4, salary: 108 },
    { id: 'saitama_tgr',  name: '埼玉タイガース',           league: 'j1', prestige: 4, salary: 118 },
    { id: 'kyoto_imp',    name: '京都インペリアル',         league: 'j1', prestige: 4, salary: 113 },
    { id: 'kobe_azu',     name: '神戸アズーロ',             league: 'j1', prestige: 4, salary: 116 },
    { id: 'chiba_sea',    name: '千葉シーガルズ',           league: 'j1', prestige: 4, salary: 107 },
  ],

  // ブンデスリーガ：ドイツ架空クラブ
  premier_league: [
    { id: 'berlin_sturm',   name: 'ベルリン・シュトルム',       league: 'premier_league', prestige: 5, salary: 280 },
    { id: 'munich_rotw',    name: 'ミュンヘン・ロートヴァイス', league: 'premier_league', prestige: 5, salary: 320 },
    { id: 'hamburg_hafe',   name: 'ハンブルク・ハーフェンシティ',league: 'premier_league', prestige: 5, salary: 290 },
    { id: 'dortmund_blk',   name: 'ドルトムント・シュワルツゲルプ',league: 'premier_league', prestige: 5, salary: 310 },
    { id: 'frankfurt_adr',  name: 'フランクフルト・アドラー',   league: 'premier_league', prestige: 5, salary: 285 },
    { id: 'koeln_dom',      name: 'ケルン・ドムシュタット',     league: 'premier_league', prestige: 5, salary: 270 },
    { id: 'stuttgart_ros',  name: 'シュトゥットガルト・ローゼン',league: 'premier_league', prestige: 5, salary: 275 },
    { id: 'leipzig_bull',   name: 'ライプツィヒ・ブルシュタイン',league: 'premier_league', prestige: 5, salary: 300 },
  ],

  // プレミアリーグ/ ラ・リーガ：英西最高峰
  champions_league: [
    { id: 'london_royals',  name: 'ロンドン・ロイヤルズ',       league: 'champions_league', prestige: 6, salary: 650 },
    { id: 'manchester_stm', name: 'マンチェスター・ストーム',   league: 'champions_league', prestige: 6, salary: 680 },
    { id: 'madrid_blanco',  name: 'マドリード・ブランコ',       league: 'champions_league', prestige: 6, salary: 700 },
    { id: 'barcelona_azgr', name: 'バルセロナ・アスールグラナ', league: 'champions_league', prestige: 6, salary: 690 },
    { id: 'liverpool_red',  name: 'リバプール・レッズ',         league: 'champions_league', prestige: 6, salary: 660 },
    { id: 'sevilla_sol',    name: 'セビリア・ソルドラド',       league: 'champions_league', prestige: 6, salary: 580 },
    { id: 'chelsea_blue',   name: 'チェルシー・ブルーライオン', league: 'champions_league', prestige: 6, salary: 630 },
    { id: 'atletico_rj',    name: 'アトレティコ・ロホブランコ', league: 'champions_league', prestige: 6, salary: 610 },
  ],
};

export function getLeagueName(leagueId: LeagueId): string {
  return LEAGUES[leagueId].name;
}

export function getNextLeague(currentLeague: LeagueId): LeagueId | null {
  const idx = LEAGUE_ORDER.indexOf(currentLeague);
  if (idx < LEAGUE_ORDER.length - 1) return LEAGUE_ORDER[idx + 1];
  return null;
}

export function getRandomTeamFromLeague(leagueId: LeagueId): Team {
  const teams = TEAMS[leagueId];
  return teams[Math.floor(Math.random() * teams.length)];
}
