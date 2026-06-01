export type Position = 'FW' | 'MF' | 'DF' | 'GK';

export interface PlayerStats {
  shooting: number;
  passing: number;
  dribbling: number;
  speed: number;
  stamina: number;
  defense: number;
}

export type LeagueId =
  | 'regional'
  | 'j3'
  | 'j2'
  | 'j1'
  | 'premier_league'
  | 'champions_league';

export interface Team {
  id: string;
  name: string;
  league: LeagueId;
  prestige: number;
  salary: number;
}

export interface TransferOffer {
  team: Team;
  salary: number;
  message: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    label: string;
    effect: Partial<PlayerStats> & {
      morale?: number;
      money?: number;
      injury?: number;
      fatigue?: number;
      conductScore?: number;
      cabaretVisit?: boolean;
    };
  }[];
  condition?: (state: GameState) => boolean;
}

export type MatchEventType =
  | 'player_goal'
  | 'player_assist'
  | 'teammate_goal'
  | 'opponent_goal'
  | 'chance'
  | 'danger'
  | 'save';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  text: string;
}

export type MatchCompetition =
  | 'league'
  | 'cl_group' | 'cl_r16' | 'cl_qf' | 'cl_sf' | 'cl_final'
  | 'national'
  | 'wc_group' | 'wc_sf' | 'wc_final';

export interface MatchResult {
  opponent: string;
  playerGoals: number;
  playerAssists: number;
  playerRating: number;
  teamScore: number;
  opponentScore: number;
  win: boolean;
  events: MatchEvent[];
  competition?: MatchCompetition;
  round?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  bonus: string;
}

export interface SeasonSummary {
  season: number;
  league: string;
  leagueId?: LeagueId;
  team: string;
  position?: Position;
  goals: number;
  assists: number;
  rating: number;
  matches: number;
  trophies: string[];
  ovrStart: number;
  ovrEnd: number;
  agingDecay?: Partial<PlayerStats>;  // 加齢によるスタット減少（27歳以降）
}

export type AwardRarity = 'bronze' | 'silver' | 'gold' | 'legendary';


export interface SeasonAward {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: AwardRarity;
  season: number;
  league: string;
}

// ガチャアイテム倉庫の1スロット
export interface InventoryItem {
  uid: string;         // 倉庫内一意ID
  itemId: string;      // GachaItem.id への参照
  obtainedAt: string;  // ISO8601 取得日時
}

export interface StandingEntry {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  isPlayer: boolean;
}

export interface GameState {
  playerName: string;
  position: Position;
  age: number;
  stats: PlayerStats;
  ovr: number;
  currentWeek: number;
  currentSeason: number;
  currentLeague: LeagueId;
  currentTeam: Team;
  seasonGoals: number;
  seasonAssists: number;
  seasonHatTricks: number;
  seasonRating: number;
  matchesPlayed: number;
  morale: number;
  money: number;
  injury: number;
  fatigue: number;
  totalGoals: number;
  totalAssists: number;
  trophies: string[];
  awards: string[];
  gamePhase: 'setup' | 'playing' | 'match_day' | 'transfer' | 'ending';
  isNewGame: boolean;
  previousInjury?: boolean;
  seasonStartOvr?: number;
  achievements: string[];
  fans: number;
  trainingStreak: { type: string; count: number };
  lastSeasonSummary: SeasonSummary | null;
  showSeasonSummary: boolean;
  skills: string[];
  leagueStandings: StandingEntry[];
  seasonAwards: SeasonAward[];       // 全シーズンの受賞歴
  pendingAwards: SeasonAward[];      // 今シーズン受賞（表示待ち）
  purchasedItems: string[];          // 購入済み一回限りアイテムID

  // ライフスタイル・資産
  realEstate: string[];              // 所有不動産アイテムID
  vehicles: string[];                // 所有車両アイテムID
  cabaretCount: number;              // キャリア通算キャバクラ訪問回数
  cabaretSeasonCount: number;        // 今シーズンの訪問回数
  cabaretPenaltyLevel: number;       // 0=なし 1=軽度 2=中度 3=重度 4=深刻 5=崩壊
  conductScore: number;              // 素行スコア 0-100 (高いほど良好)
  isDrugEvent: boolean;              // 麻薬事件フラグ（即エンディング）
  endingId: string | null;           // 到達したエンディングID

  // チャンピオンズリーグ
  clQualified: boolean;              // 来季CL出場権獲得
  clActive: boolean;                 // 今季CL参加中
  clGroupStage: number;              // GSマッチ消化数（0-3）
  clGroupWins: number;               // GSでの勝利数
  clKnockoutRound: number;           // 0=なし 1=R16 2=QF 3=SF 4=Final
  clEliminated: boolean;             // CL敗退済み
  clTrophies: number;                // CLトロフィー数

  // 国際大会
  nationalCaps: number;              // 代表キャップ数
  nationalGoals: number;             // 代表ゴール数

  // ワールドカップ
  wcWins: number;                    // WC優勝回数
  wcActive: boolean;                 // WC開催中
  wcRound: number;                   // 0=GS1 1=GS2 2=GS3 3=SF 4=Final
  wcGroupWins: number;               // WSグループ勝利数
  wcWinBonus: boolean;               // WC勝率ボーナスフラグ（ガチャ）

  showSeasonReview: boolean;           // シーズン評価モーダル表示フラグ

  // アイテム倉庫（Supabaseに自動保存）
  inventory: InventoryItem[];

  // ガチャシステム
  gachaCoins: number;                // 所持GC（廃止 → 互換保持のみ）
  gachaPityStandard: number;         // スタンダード天井カウンター
  gachaPityPickup: number;           // ピックアップ天井カウンター
  gachaTotalPulls: number;           // 累計ガチャ回数
  retireAgeBonus: number;            // ガチャ由来の引退年齢ボーナス
  ageReduceUsed?: number;            // 時の巻き戻し使用回数（最大2回）
  ballonDorFlag: boolean;            // バロンドール特別フラグ（ガチャ）

  // ストーリー週連動
  storySeenWeeks?: number[];         // 今シーズン中にストーリーボタンを押した週（5,10,15…）
}
