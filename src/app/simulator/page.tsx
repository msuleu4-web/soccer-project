import { createAnonClient } from '@/lib/supabase/service';
import SimulatorForm from './SimulatorForm';
import type { Team } from '@/types/board';

export const metadata = {
  title: '監督AIシミュレーター | Goal Labo',
  description: 'AIが架空の試合を実況生成。あなたが監督になって対戦カードを作ろう。',
};

export default async function SimulatorPage() {
  const supa = createAnonClient();
  const { data: teams } = await supa
    .from('teams')
    .select('*')
    .eq('is_active', true)
    .order('league', { ascending: true })
    .order('name', { ascending: true });

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          監督AIシミュレーター
        </h1>
        <p className="text-[var(--fg-muted)]">
          2チームを選んで戦術を設定。AIが架空の90分を実況してくれます。
        </p>
      </div>
      <SimulatorForm teams={(teams ?? []) as Team[]} />
    </main>
  );
}
