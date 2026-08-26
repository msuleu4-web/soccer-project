// キャラクター図鑑ページ (Server Component)
// is_hidden=true かつ unlocked_routes に含まれないキャラは「???」表示

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getRelationshipHint } from '@/lib/story/flags';
import type { StoryCharacter, UserStoryProgress } from '@/lib/types/story';

export const dynamic = 'force-dynamic';

const roleLabels: Record<string, string> = {
  pr_staff:  'PR担当',
  captain:   '主将',
  analyst:   'データ分析官',
  youth_fw:  'ユースFW',
  secretary: '事務局長補佐',
  mystery:   '???',
};

export default async function CharactersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const db = createServiceClient();

  const [charsRes, progressRes] = await Promise.all([
    db.from('story_characters').select('*').order('created_at'),
    db.from('user_story_progress').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  const characters = (charsRes.data ?? []) as StoryCharacter[];
  const progress   = progressRes.data as UserStoryProgress | null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-default)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/story" className="text-sm" style={{ color: 'var(--fg-2)' }}>← 戻る</Link>
        <span className="font-bold" style={{ color: 'var(--fg-1)' }}>キャラクター図鑑</span>
        <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          {progress?.completed_routes.length ?? 0} ルート攻略済み
        </span>
      </header>

      <main className="gl-container py-6">
        <div className="grid grid-cols-1 gap-4">
          {characters.map((char) => {
            const isUnlocked = progress?.unlocked_routes.includes(char.slug) ?? false;
            const hidden     = char.is_hidden && !isUnlocked;
            const hint       = progress ? getRelationshipHint(char.slug, progress.story_flags) : null;
            const isCompleted = progress?.completed_routes.includes(char.slug) ?? false;

            return (
              <Link
                key={char.id}
                href={hidden ? '#' : `/story/characters/${char.slug}`}
                className="gl-card flex items-center gap-4 p-4 transition-transform hover:scale-[1.01]"
                style={{ borderLeft: `4px solid ${hidden ? 'var(--color-border)' : char.theme_color}` }}
              >
                {/* アイコン */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: hidden ? 'var(--bg-surface-elevated)' : `${char.theme_color}22` }}
                >
                  {hidden ? '❓' : (char.character_image_url ? '👤' : '👤')}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-bold" style={{ color: 'var(--fg-1)' }}>
                      {hidden ? '???' : char.display_name_ja}
                    </h2>
                    {isCompleted && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,210,106,0.15)', color: 'var(--color-accent-green)' }}>
                        CLEAR
                      </span>
                    )}
                  </div>

                  <p className="text-xs mb-1" style={{ color: char.theme_color }}>
                    {hidden ? '????' : roleLabels[char.role] ?? char.role}
                  </p>

                  {!hidden && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--fg-2)' }}>
                      {hint ?? char.bio_summary_ja ?? ''}
                    </p>
                  )}

                  {hidden && (
                    <p className="text-xs italic" style={{ color: 'var(--fg-muted)' }}>
                      2つ以上のルートをクリアすると解放される
                    </p>
                  )}
                </div>

                {/* 矢印 */}
                {!hidden && (
                  <span style={{ color: 'var(--fg-muted)' }}>›</span>
                )}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
