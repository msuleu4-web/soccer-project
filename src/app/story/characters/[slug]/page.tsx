// キャラクター個別ページ (Server Component)
// キャラ詳細・関係性ヒント・関連シーン一覧を表示

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getRelationshipHint } from '@/lib/story/flags';
import type { StoryCharacter, StoryScene, UserStoryProgress } from '@/lib/types/story';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

const roleLabels: Record<string, string> = {
  pr_staff:  'PR担当',
  captain:   '主将',
  analyst:   'データ分析官',
  youth_fw:  'ユースFW',
  secretary: '事務局長補佐',
  mystery:   '謎の存在',
};

export default async function CharacterDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const db = createServiceClient();

  const [charRes, progressRes] = await Promise.all([
    db.from('story_characters').select('*').eq('slug', params.slug).single(),
    db.from('user_story_progress').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  if (charRes.error || !charRes.data) notFound();

  const char     = charRes.data as StoryCharacter;
  const progress = progressRes.data as UserStoryProgress | null;

  // 隠しキャラで未解放ならリダイレクト
  if (char.is_hidden && !(progress?.unlocked_routes.includes(char.slug))) {
    redirect('/story/characters');
  }

  // このキャラが登場するシーン
  const { data: scenesData } = await db
    .from('story_scenes')
    .select('id, title_ja, scene_type, unlock_cost, scene_order')
    .eq('character_id', char.id)
    .order('scene_order');

  const scenes     = (scenesData ?? []) as Pick<StoryScene, 'id' | 'title_ja' | 'scene_type' | 'unlock_cost' | 'scene_order'>[];
  const hint       = progress ? getRelationshipHint(char.slug, progress.story_flags) : null;
  const isUnlocked = progress?.unlocked_routes.includes(char.slug) ?? false;
  const isCompleted = progress?.completed_routes.includes(char.slug) ?? false;

  const sceneTypeLabel: Record<string, string> = {
    dialogue:    '会話',
    choice:      '選択',
    match_event: '試合',
    reflection:  '回想',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-default)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/story/characters" className="text-sm" style={{ color: 'var(--fg-2)' }}>← 図鑑</Link>
        <span className="font-bold truncate max-w-[160px]" style={{ color: 'var(--fg-1)' }}>
          {char.display_name_ja}
        </span>
        <div style={{ width: 48 }} />
      </header>

      <main className="gl-container py-6 space-y-5">
        {/* キャラクタープロフィール */}
        <div
          className="gl-card p-5"
          style={{ borderTop: `4px solid ${char.theme_color}` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: `${char.theme_color}22` }}
            >
              👤
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold" style={{ color: 'var(--fg-1)' }}>
                  {char.display_name_ja}
                </h1>
                {isCompleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,210,106,0.15)', color: 'var(--color-accent-green)' }}>
                    CLEAR
                  </span>
                )}
              </div>
              <p className="text-sm font-medium mb-2" style={{ color: char.theme_color }}>
                {roleLabels[char.role] ?? char.role}
              </p>
              {char.bio_summary_ja && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                  {char.bio_summary_ja}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 関係性ヒント */}
        {hint && (
          <div
            className="gl-card p-4 text-sm italic text-center"
            style={{ background: `${char.theme_color}11`, border: `1px solid ${char.theme_color}33`, color: 'var(--fg-2)' }}
          >
            「{hint}」
          </div>
        )}

        {!hint && isUnlocked && (
          <div
            className="gl-card p-4 text-sm text-center"
            style={{ color: 'var(--fg-muted)' }}
          >
            まだ深い接点はない。ストーリーを進めよう。
          </div>
        )}

        {/* ルート解放ボタン */}
        {!isUnlocked && (
          <div
            className="gl-card p-4 text-center space-y-2"
            style={{ border: `1px dashed ${char.theme_color}55` }}
          >
            <p className="text-sm" style={{ color: 'var(--fg-2)' }}>
              このキャラのルートはまだ解放されていません
            </p>
            <Link href="/story" className="gl-btn gl-btn-secondary text-sm inline-flex">
              ストーリーを進める
            </Link>
          </div>
        )}

        {/* 登場シーン一覧 */}
        {scenes.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--fg-2)' }}>
              登場シーン ({scenes.length})
            </h2>
            <div className="space-y-2">
              {scenes.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/story/play/${scene.id}`}
                  className="gl-card flex items-center gap-3 p-3 transition-transform hover:scale-[1.01]"
                >
                  <span className="text-lg">
                    {scene.unlock_cost > 0 ? '🔒' : '▶'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--fg-1)' }}>
                      {scene.title_ja ?? `シーン #${scene.scene_order}`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {sceneTypeLabel[scene.scene_type] ?? scene.scene_type}
                      {scene.unlock_cost > 0 && ` · ${scene.unlock_cost.toLocaleString('ja-JP')}G`}
                    </p>
                  </div>
                  <span style={{ color: 'var(--fg-muted)' }}>›</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
