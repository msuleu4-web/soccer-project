// GET /api/story/characters-list
// 管理画面のドロップダウン用にキャラクター一覧を返す

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

  const db = createServiceClient();
  const { data, error } = await db
    .from('story_characters')
    .select('*')
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ characters: data ?? [] });
}
