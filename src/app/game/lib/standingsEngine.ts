import type { GameState, StandingEntry, MatchResult } from '../types/game';
import { TEAMS, LEAGUES } from './leagueData';

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// シーズン開始時に全チームの順位表を生成
export function generateStandings(state: GameState): StandingEntry[] {
  const allTeams = TEAMS[state.currentLeague];
  const leagueLevel = LEAGUES[state.currentLeague].level;
  const matchesPlayed = Math.max(0, state.currentWeek - 1);

  // 選手のOVRとリーグレベルの差に基づいて選手チームの強さを決める
  const playerStrength = Math.min(1.0, state.ovr / (leagueLevel * 15));

  const entries: StandingEntry[] = allTeams.map(team => {
    const isPlayer = team.id === state.currentTeam.id;

    if (isPlayer) {
      // 選手チームは実績に基づく
      const wins   = state.matchesPlayed > 0 ? Math.round(state.matchesPlayed * playerStrength * 0.6) : 0;
      const losses = state.matchesPlayed > 0 ? Math.round(state.matchesPlayed * (1 - playerStrength) * 0.5) : 0;
      const draws  = Math.max(0, state.matchesPlayed - wins - losses);
      const gf = wins * rand(2, 3) + draws * rand(0, 1);
      const ga = losses * rand(1, 3) + draws * rand(0, 2);
      return {
        teamId: team.id,
        teamName: team.name,
        played: state.matchesPlayed,
        wins, draws, losses,
        goalsFor: gf,
        goalsAgainst: ga,
        points: wins * 3 + draws,
        isPlayer: true,
      };
    }

    // 他チームはランダム生成（prestige+乱数で強さを決定）
    const strength = (team.prestige / 6) * 0.8 + Math.random() * 0.4;
    const played = Math.max(0, matchesPlayed + rand(-2, 2));
    const wins   = Math.round(played * strength * 0.55);
    const losses = Math.round(played * (1 - strength) * 0.55);
    const draws  = Math.max(0, played - wins - losses);
    const gf = wins * rand(1, 3) + draws * rand(0, 1);
    const ga = losses * rand(1, 2) + draws * rand(0, 1);
    return {
      teamId: team.id,
      teamName: team.name,
      played,
      wins, draws, losses,
      goalsFor: gf,
      goalsAgainst: ga,
      points: wins * 3 + draws,
      isPlayer: false,
    };
  });

  return sortStandings(entries);
}

// 試合結果を反映して順位表を更新
export function updateStandings(
  standings: StandingEntry[],
  result: MatchResult,
  playerTeamId: string,
): StandingEntry[] {
  const updated = standings.map(entry => {
    if (entry.teamId === playerTeamId) {
      // 選手チームの実績を更新
      const win  = result.teamScore > result.opponentScore;
      const draw = result.teamScore === result.opponentScore;
      return {
        ...entry,
        played: entry.played + 1,
        wins:   entry.wins   + (win  ? 1 : 0),
        draws:  entry.draws  + (draw ? 1 : 0),
        losses: entry.losses + (!win && !draw ? 1 : 0),
        goalsFor:     entry.goalsFor     + result.teamScore,
        goalsAgainst: entry.goalsAgainst + result.opponentScore,
        points: entry.points + (win ? 3 : draw ? 1 : 0),
      };
    }

    // 他チームはランダムに試合を進める（週1試合の確率）
    if (Math.random() < 0.65) {
      const otherWin  = Math.random() < 0.45;
      const otherDraw = !otherWin && Math.random() < 0.25;
      return {
        ...entry,
        played: entry.played + 1,
        wins:   entry.wins   + (otherWin  ? 1 : 0),
        draws:  entry.draws  + (otherDraw ? 1 : 0),
        losses: entry.losses + (!otherWin && !otherDraw ? 1 : 0),
        goalsFor:     entry.goalsFor     + rand(0, 3),
        goalsAgainst: entry.goalsAgainst + rand(0, 3),
        points: entry.points + (otherWin ? 3 : otherDraw ? 1 : 0),
      };
    }
    return entry;
  });

  return sortStandings(updated);
}

function sortStandings(entries: StandingEntry[]): StandingEntry[] {
  return [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

export function getPlayerRank(standings: StandingEntry[], teamId: string): number {
  return standings.findIndex(e => e.teamId === teamId) + 1;
}
