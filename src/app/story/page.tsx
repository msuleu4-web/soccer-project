// ストーリートップページ (続きから / 章選択 / キャラクター一覧)

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { formatBalance, canReceiveSalary } from '@/lib/story/wallet';
import { getRelationshipHint } from '@/lib/story/flags';
import type {
  UserStoryProgress,
  UserWallet,
  StoryCharacter,
  StoryChapter,
  StoryScene,
} from '@/lib/types/story';

export const dynamic = 'force-dynamic';

export default async function StoryTopPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const db = createServiceClient();

  const [progressRes, walletRes, charactersRes, chaptersRes] = await Promise.all([
    db.from('user_story_progress').select('*').eq('user_id', user.id).maybeSingle(),
    db.from('user_wallet').select('*').eq('user_id', user.id).maybeSingle(),
    db.from('story_characters').select('*').order('created_at'),
    db.from('story_chapters').select('*').order('part_number').order('chapter_number'),
  ]);

  const progress   = progressRes.data   as UserStoryProgress | null;
  const wallet     = walletRes.data     as UserWallet | null;
  const characters = (charactersRes.data ?? []) as StoryCharacter[];
  const chapters   = (chaptersRes.data   ?? []) as StoryChapter[];

  // 現在シーンを取得 (続きからボタン用)
  let currentScene: StoryScene | null = null;
  if (progress?.current_scene_id) {
    const { data } = await db
      .from('story_scenes')
      .select('id, title_ja')
      .eq('id', progress.current_scene_id)
      .single();
    currentScene = data as StoryScene | null;
  }

  const paydayAvailable = wallet ? canReceiveSalary(wallet) : false;

  const partLabels: Record<number, string> = {
    1: '第1部 — 共通ルート',
    2: '第2部 — 個別ルート',
    3: '第3部 — True End',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-default)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/" className="text-sm font-semibold" style={{ color: 'var(--fg-1)' }}>
          ← Goal Labo
        </Link>
        <span className="font-bold tracking-wide" style={{ color: 'var(--color-accent-green)' }}>
          監督ライフ
        </span>
        {wallet && (
          <span className="text-sm font-medium" style={{ color: 'var(--fg-2)' }}>
            💰 {formatBalance(wallet.balance)}
          </span>
        )}
      </header>

      <main className="gl-container py-6 space-y-6">

        {/* 週給バナー */}
        {paydayAvailable && (
          <PaydayBanner />
        )}

        {/* 続きから / ゲーム開始 */}
        <section className="gl-card text-center space-y-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--fg-1)' }}>
              監督ライフ・シミュレーション
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-2)' }}>
              {progress
                ? `シーズン ${progress.season_number} — 第 ${progress.gameweek} 節`
                : '新たなストーリーが始まる'}
            </p>
          </div>

          {progress?.current_scene_id ? (
            <Link
              href={`/story/play/${progress.current_scene_id}`}
              className="gl-btn gl-btn-accent inline-flex items-center gap-2"
            >
              ▶ 続きから
              {currentScene?.title_ja && (
                <span className="text-xs opacity-80">— {currentScene.title_ja}</span>
              )}
            </Link>
          ) : (
            <StartButton chapters={chapters} />
          )}

          <div className="flex justify-center gap-4 pt-2">
            <Link href="/story/shop" className="text-sm" style={{ color: 'var(--fg-2)' }}>
              🔓 シーンショップ
            </Link>
            <Link href="/story/characters" className="text-sm" style={{ color: 'var(--fg-2)' }}>
              👥 キャラクター図鑑
            </Link>
          </div>
        </section>

        {/* キャラクター一覧 */}
        <section>
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--fg-2)' }}>
            登場キャラクター
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {characters.map((char) => {
              const isUnlocked = progress?.unlocked_routes.includes(char.slug);
              const hint       = progress
                ? getRelationshipHint(char.slug, progress.story_flags)
                : null;
              const hidden     = char.is_hidden && !isUnlocked;

              return (
                <Link
                  key={char.id}
                  href={hidden ? '#' : `/story/characters/${char.slug}`}
                  className="gl-card text-center p-3 space-y-2 transition-transform hover:scale-[1.02]"
                  style={{ borderTop: `3px solid ${hidden ? 'var(--color-border)' : char.theme_color}` }}
                >
                  <div
                    className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl"
                    style={{ background: hidden ? 'var(--bg-surface-elevated)' : `${char.theme_color}22` }}
                  >
                    {hidden ? '❓' : '👤'}
                  </div>
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--fg-1)' }}>
                    {hidden ? '???' : char.display_name_ja}
                  </p>
                  {hint && !hidden && (
                    <p className="text-xs leading-tight" style={{ color: 'var(--fg-muted)' }}>
                      {hint}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* 章一覧 */}
        <section>
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--fg-2)' }}>
            章一覧
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((part) => {
              const partChapters = chapters.filter((c) => c.part_number === part);
              if (partChapters.length === 0) return null;
              return (
                <div key={part}>
                  <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--color-accent-green)' }}>
                    {partLabels[part]}
                  </p>
                  <div className="space-y-2">
                    {partChapters.map((chapter) => {
                      const isCurrent = progress?.current_chapter_id === chapter.id;
                      return (
                        <div
                          key={chapter.id}
                          className="gl-card p-3 flex items-center gap-3"
                          style={{ borderLeft: isCurrent ? `3px solid var(--color-accent-green)` : '3px solid transparent' }}
                        >
                          <div className="text-lg">{isCurrent ? '▶' : '○'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--fg-1)' }}>
                              {chapter.title_ja}
                            </p>
                            {chapter.subtitle_ja && (
                              <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
                                {chapter.subtitle_ja}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

// 子コンポーネント

function PaydayBanner() {
  return (
    <form action="/api/story/payday" method="POST">
      <button
        type="submit"
        className="w-full gl-card text-center py-3 font-semibold transition-colors"
        style={{ background: 'rgba(0,210,106,0.1)', border: '1px solid var(--color-accent-green)', color: 'var(--color-accent-green)' }}
      >
        💴 週給を受け取る
      </button>
    </form>
  );
}

function StartButton({ chapters }: { chapters: StoryChapter[] }) {
  const firstChapter = chapters[0];
  if (!firstChapter) return null;
  return (
    <Link
      href={`/story/play/start`}
      className="gl-btn gl-btn-primary inline-flex items-center gap-2"
    >
      ▶ ストーリーを始める
    </Link>
  );
}
