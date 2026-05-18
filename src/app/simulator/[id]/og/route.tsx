import { ImageResponse } from 'next/og';
import { createAnonClient } from '@/lib/supabase/service';

export const runtime = 'edge';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supa = createAnonClient();
  const { data } = await supa
    .from('simulations')
    .select(`
      home_score, away_score,
      home_formation, away_formation,
      home_team:teams!simulations_home_team_id_fkey(name),
      away_team:teams!simulations_away_team_id_fkey(name)
    `)
    .eq('id', params.id)
    .single();

  if (!data) {
    return new Response('Not found', { status: 404 });
  }

  const sim = data as any;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F3D2E 0%, #050a14 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.7, marginBottom: 32, letterSpacing: 2 }}>
          監督AIシミュレーター | Goal Labo
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 40,
          }}
        >
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 44, fontWeight: 'bold', marginBottom: 8 }}>
              {sim.home_team.name}
            </div>
            <div style={{ fontSize: 20, opacity: 0.6 }}>{sim.home_formation}</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              fontSize: 100,
              fontWeight: 'bold',
              color: '#00D26A',
            }}
          >
            <span>{sim.home_score}</span>
            <span style={{ color: 'white', opacity: 0.4, fontSize: 72 }}>-</span>
            <span>{sim.away_score}</span>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 44, fontWeight: 'bold', marginBottom: 8 }}>
              {sim.away_team.name}
            </div>
            <div style={{ fontSize: 20, opacity: 0.6 }}>{sim.away_formation}</div>
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 20, opacity: 0.5 }}>
          goal-labo.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
