import { notFound } from 'next/navigation';
import { createAnonClient, createServiceClient } from '@/lib/supabase/service';
import MatchTimeline from './MatchTimeline';
import ShareButtons from './ShareButtons';
import MatchAnalysisSection from './MatchAnalysis';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  const supa = createAnonClient();
  const { data } = await supa
    .from('simulations')
    .select(`
      home_score, away_score,
      home_team:teams!simulations_home_team_id_fkey(name),
      away_team:teams!simulations_away_team_id_fkey(name)
    `)
    .eq('id', params.id)
    .single();

  if (!data) return { title: '試合が見つかりません' };

  const sim = data as any;
  const title = `${sim.home_team.name} ${sim.home_score}-${sim.away_score} ${sim.away_team.name} | 監督AIシミュレーター`;
  return {
    title,
    openGraph: {
      title,
      images: [{ url: `/simulator/${params.id}/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [`/simulator/${params.id}/og`],
    },
  };
}

export default async function SimulationPage({ params }: PageProps) {
  const supa = createAnonClient();
  const { data, error } = await supa
    .from('simulations')
    .select(`
      *,
      home_team:teams!simulations_home_team_id_fkey(*),
      away_team:teams!simulations_away_team_id_fkey(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  // view_count増加 (fire-and-forget)
  createServiceClient()
    .rpc('increment_view_count', { sim_id: params.id })
    .then(() => {});

  const sim = data as any;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      {/* スコアボード */}
      <div className="gl-card p-6 mb-6 text-center">
        <p className="text-sm text-[var(--fg-muted)] mb-2">監督AIシミュレーター</p>
        <div className="flex items-center justify-center gap-4 md:gap-8 my-4">
          <div className="flex-1 text-right">
            <p className="text-lg md:text-2xl font-bold">{sim.home_team.name}</p>
            <p className="text-xs text-[var(--fg-muted)]">
              {sim.home_formation} / {sim.home_style}
            </p>
          </div>
          <div className="text-4xl md:text-6xl font-bold tabular-nums">
            {sim.home_score} - {sim.away_score}
          </div>
          <div className="flex-1 text-left">
            <p className="text-lg md:text-2xl font-bold">{sim.away_team.name}</p>
            <p className="text-xs text-[var(--fg-muted)]">
              {sim.away_formation} / {sim.away_style}
            </p>
          </div>
        </div>
      </div>

      {/* スタッツ */}
      <div className="gl-card p-5 mb-6">
        <h3 className="font-bold mb-3">試合スタッツ</h3>
        <StatBar
          label="ボール支配率"
          homeValue={sim.match_data.home_possession}
          awayValue={sim.match_data.away_possession}
          suffix="%"
        />
        <StatBar
          label="シュート数"
          homeValue={sim.match_data.home_shots}
          awayValue={sim.match_data.away_shots}
        />
      </div>

      {/* MVP */}
      <div className="gl-card p-5 mb-6 border-l-4 border-[var(--color-accent-green)]">
        <p className="text-sm text-[var(--fg-muted)] mb-1">Man of the Match</p>
        <p className="text-xl font-bold mb-1">{sim.match_data.mvp.name}</p>
        <p className="text-sm">{sim.match_data.mvp.reason}</p>
      </div>

      {/* タイムライン */}
      <MatchTimeline events={sim.match_data.events} />

      {/* 総評 */}
      <div className="gl-card p-5 my-6">
        <h3 className="font-bold mb-2">試合総評</h3>
        <p className="leading-relaxed">{sim.match_data.summary}</p>
      </div>

      {/* AI戦術分析 */}
      <div className="my-6">
        <MatchAnalysisSection
          simId={sim.id}
          homeTeamName={sim.home_team.name}
          awayTeamName={sim.away_team.name}
        />
      </div>

      {/* シェア */}
      <ShareButtons
        simId={sim.id}
        title={`${sim.home_team.name} ${sim.home_score}-${sim.away_score} ${sim.away_team.name}`}
      />

      <div className="text-center mt-8">
        <a href="/simulator" className="gl-btn gl-btn-primary">
          もう一度シミュレートする
        </a>
      </div>
    </main>
  );
}

function StatBar({
  label,
  homeValue,
  awayValue,
  suffix = '',
}: {
  label: string;
  homeValue: number;
  awayValue: number;
  suffix?: string;
}) {
  const total = homeValue + awayValue || 1;
  const homePct = (homeValue / total) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{homeValue}{suffix}</span>
        <span className="text-[var(--fg-muted)]">{label}</span>
        <span className="font-medium">{awayValue}{suffix}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-[var(--border-default)]">
        <div
          className="bg-[var(--color-accent-green)]"
          style={{ width: `${homePct}%` }}
        />
        <div className="bg-[var(--color-brand-green)] flex-1" />
      </div>
    </div>
  );
}
