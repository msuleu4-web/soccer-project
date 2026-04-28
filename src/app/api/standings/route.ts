
import { NextResponse } from 'next/server';
import { fetchStandings, LEAGUES } from '@/lib/theSportsDB';

export async function GET() {
  const leagueKey = 'epl'; // EPL固定

  try {
    const standings = await fetchStandings(leagueKey);
    const leagueInfo = LEAGUES[leagueKey];

    if (standings.length === 0) {
        return NextResponse.json({ season: leagueInfo.season, leagueName: leagueInfo.name, standings: [] });
    }

    return NextResponse.json({
      season: leagueInfo.season,
      leagueName: leagueInfo.name,
      standings,
    });
  } catch (error) {
    console.error(`[API/STANDINGS] Error for EPL:`, error);
    return NextResponse.json(
      { message: 'データ取得に失敗しました' },
      { status: 500 }
    );
  }
}
