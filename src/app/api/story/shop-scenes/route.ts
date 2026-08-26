// GET /api/story/shop-scenes
// unlock_cost > 0 のシーン一覧 + ユーザーの解放済み ID を返す

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

  const db = createServiceClient();

  const [scenesRes, unlockedRes] = await Promise.all([
    db.from('story_scenes')
      .select(`
        id, title_ja, scene_type, unlock_cost, scene_order,
        story_chapters ( title_ja, part_number ),
        story_characters ( display_name_ja, theme_color )
      `)
      .gt('unlock_cost', 0)
      .order('scene_order'),
    db.from('user_unlocked_content')
      .select('content_id')
      .eq('user_id', user.id)
      .eq('content_type', 'scene'),
  ]);

  return NextResponse.json({
    scenes:   scenesRes.data  ?? [],
    unlocked: (unlockedRes.data ?? []).map((r: { content_id: string }) => r.content_id),
  });
}
