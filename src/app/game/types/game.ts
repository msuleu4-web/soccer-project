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

export interface MatchResult {
  opponent: string;
  playerGoals: number;
  playerAssists: number;
  playerRating: number;
  teamScore: number;
  opponentScore: number;
  win: boolean;
  events: MatchEvent[];
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
  team: string;
  goals: number;
  assists: number;
  rating: number;
  matches: number;
  trophies: string[];
  ovrStart: number;
  ovrEnd: number;
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
}
