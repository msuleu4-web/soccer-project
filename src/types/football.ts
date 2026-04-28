
// src/app/api/fixtures/route.ts で整形後の型
export interface Fixture {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  venue: string | null;
  status: string;
}

// src/app/api/standings/route.ts で整形後の型
export interface Standing {
  rank: number;
  teamId: number;
  team: string;
  logo: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}
