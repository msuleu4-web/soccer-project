// GET /api/story/chapters-list
// 管理画面のドロップダウン用に章一覧を返す

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

  const db = createServiceClient();
  const { data, error } = await db
    .from('story_chapters')
    .select('*')
    .order('part_number')
    .order('chapter_number');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ chapters: data ?? [] });
}
