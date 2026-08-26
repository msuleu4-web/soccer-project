// GET /api/story/progress
// 現在の進行状況とウォレットを返す

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

  const db = createServiceClient();
  const [progressRes, walletRes] = await Promise.all([
    db.from('user_story_progress').select('*').eq('user_id', user.id).maybeSingle(),
    db.from('user_wallet').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  return NextResponse.json({
    progress: progressRes.data,
    wallet:   walletRes.data,
  });
}
