// シーン再生ページ
// Server Component: シーン・ウォレット・解放済みIDを取得して ScenePlayer へ渡す

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import ScenePlayer from '@/app/story/_components/ScenePlayer';
import type { StoryScene, UserWallet, UserStoryProgress } from '@/lib/types/story';

export const dynamic = 'force-dynamic';

interface Props {
  params:      { sceneId: string };
  searchParams: { returnTo?: string };
}

export default async function ScenePlayPage({ params, searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createServiceClient();

  // 初回 start ルートの処理: 最初のシーンを取得してリダイレクト
  if (params.sceneId === 'start') {
    const { data: firstScene } = await db
      .from('story_scenes')
      .select('id')
      .order('scene_order', { ascending: true })
      .limit(1)
      .single();

    if (!firstScene) notFound();

    if (user) {
      // 進行状況が未作成なら初期化
      const { data: existing } = await db
        .from('user_story_progress')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        const { data: firstChapter } = await db
          .from('story_chapters')
          .select('id')
          .order('part_number')
          .order('chapter_number')
          .limit(1)
          .single();

        await db.from('user_story_progress').insert({
          user_id:            user.id,
          current_chapter_id: firstChapter?.id ?? null,
          current_scene_id:   (firstScene as { id: string }).id,
        });

        await db.from('user_wallet').upsert({
          user_id: user.id,
        }, { onConflict: 'user_id', ignoreDuplicates: true });
      }
    }

    redirect(`/story/play/${(firstScene as { id: string }).id}`);
  }

  // 通常シーン取得
  const [sceneRes, walletRes, progressRes] = await Promise.all([
    db.from('story_scenes').select('*').eq('id', params.sceneId).single(),
    user ? db.from('user_wallet').select('*').eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    user ? db.from('user_story_progress').select('*').eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  if (sceneRes.error || !sceneRes.data) notFound();

  const scene    = sceneRes.data as StoryScene;
  const wallet   = (walletRes.data  ?? { user_id: user?.id ?? 'anonymous', balance: 0, weekly_salary: 50000, last_payday_at: new Date().toISOString(), total_earned: 0, total_spent: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }) as UserWallet;
  const progress = progressRes.data as UserStoryProgress | null;

  // フラグチェック: requires_flags が満たされていなければトップへ
  if (progress && Object.keys(scene.requires_flags).length > 0) {
    const ok = Object.entries(scene.requires_flags).every(
      ([k, v]) => progress.story_flags[k] === v,
    );
    if (!ok) redirect('/story');
  }

  const storyFlags = progress?.story_flags ?? {};

  const returnTo = searchParams.returnTo ?? undefined;

  return (
    <ScenePlayer
      scene={scene}
      wallet={wallet}
      storyFlags={storyFlags}
      returnTo={returnTo}
    />
  );
}
