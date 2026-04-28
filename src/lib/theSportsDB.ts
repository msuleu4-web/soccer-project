import { Standing, Fixture } from '@/types/football';

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

export const LEAGUES = {
  epl: { id: '4328', season: '2025-2026', name: 'プレミアリーグ' },
  j1: { id: '4399', season: '2026', name: 'J1リーグ' },
} as const;

export type LeagueKey = keyof typeof LEAGUES;

async function fetchFromTheSportsDB(path: string) {
  const apiKey = process.env.THESPORTSDB_API_KEY ?? '123';
  const url = `${BASE_URL}/${apiKey}/${path}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 }, // 1時間キャッシュ
  });
  if (!res.ok) {
    throw new Error(`TheSportsDB request failed: ${res.status}`);
  }
  return res.json();
}

function getSizedTeamLogo(url: string | null | undefined, size: 'small' | 'tiny'): string {
    if (!url) return '';
    return `${url}/${size}`;
}

export async function fetchStandings(leagueKey: LeagueKey): Promise<Standing[]> {
  const league = LEAGUES[leagueKey];
  try {
    const data = await fetchFromTheSportsDB(`lookuptable.php?l=${league.id}&s=${league.season}`);
    if (!data.table) {
      return [];
    }
    const standings: Standing[] = data.table.map((item: any) => ({
      rank: Number(item.intRank),
      team: item.strTeam,
      logo: getSizedTeamLogo(item.strTeamBadge, 'tiny'),
      played: Number(item.intPlayed),
      win: Number(item.intWin),
      draw: Number(item.intDraw),
      lose: Number(item.intLoss),
      goalsFor: Number(item.intGoalsFor),
      goalsAgainst: Number(item.intGoalsAgainst),
      goalDiff: Number(item.intGoalDifference),
      points: Number(item.intPoints),
      teamId: Number(item.idTeam),
    }));
    return standings;
  } catch (error) {
    console.error(`[TheSportsDB] Error fetching standings for ${leagueKey}:`, error);
    throw error;
  }
}



