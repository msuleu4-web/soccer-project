// POST /api/story/advance
// 選択肢のないシーンを次へ進める
// Body: { scene_id: string }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { advanceScene, fetchScene } from '@/lib/story/engine';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json() as { scene_id?: string };
  if (!body.scene_id) {
    return NextResponse.json({ error: 'scene_id が必要です' }, { status: 400 });
  }

  // 未ログイン: DBを更新せずに次シーンだけ返す
  if (!user) {
    const db = createServiceClient();
    const current = await fetchScene(body.scene_id);
    if (!current) return NextResponse.json({ next_scene: null });
    const { data } = await db
      .from('story_scenes')
      .select('*')
      .eq('chapter_id', current.chapter_id)
      .gt('scene_order', current.scene_order)
      .order('scene_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    return NextResponse.json({ next_scene: data ?? null });
  }

  try {
    const result = await advanceScene(user.id, body.scene_id);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : '不明なエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
