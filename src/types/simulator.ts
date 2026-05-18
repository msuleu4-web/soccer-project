import type { Team } from './board';

export type Formation = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2' | '3-4-3' | '5-3-2';
export type TacticalStyle = 'attacking' | 'defensive' | 'balanced' | 'counter';

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'chance' | 'save' | 'commentary';
  team: 'home' | 'away' | null;
  scorer?: string;
  assist?: string;
  description: string;
}

export interface MatchData {
  events: MatchEvent[];
  summary: string;
  mvp: {
    name: string;
    team: 'home' | 'away';
    reason: string;
  };
  home_possession: number;
  away_possession: number;
  home_shots: number;
  away_shots: number;
}

export interface SimulationRow {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_formation: Formation;
  away_formation: Formation;
  home_style: TacticalStyle;
  away_style: TacticalStyle;
  home_score: number;
  away_score: number;
  match_data: MatchData;
  creator_hash: string;
  view_count: number;
  share_count: number;
  created_at: string;
}

export interface SimulationWithTeams extends SimulationRow {
  home_team: Team;
  away_team: Team;
}

export interface MatchAnalysis {
  winner_analysis: {
    team: 'home' | 'away' | 'draw';
    title: string;
    factors: string[];
  };
  loser_analysis: {
    team: 'home' | 'away' | 'draw';
    title: string;
    factors: string[];
  };
  power_comparison: {
    summary: string;
    home_advantages: string[];
    away_advantages: string[];
  };
  key_players: {
    name: string;
    team: 'home' | 'away';
    rating: number;
    comment: string;
  }[];
  tactical_analysis: {
    summary: string;
    formation_impact: string;
    style_matchup: string;
  };
  what_if: string;
}

export const FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '3-4-3', '5-3-2'];

export const STYLES: { value: TacticalStyle; label: string; description: string }[] = [
  { value: 'attacking', label: '攻撃的',     description: '前線からハイプレス、積極的なゴール狙い' },
  { value: 'defensive', label: '守備的',     description: 'ブロックを固め、堅実な試合運び' },
  { value: 'balanced',  label: 'バランス',   description: '攻守のバランスを重視' },
  { value: 'counter',   label: 'カウンター', description: '低い位置で受け、速攻で仕留める' },
];
