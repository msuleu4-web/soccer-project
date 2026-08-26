// POST /api/story/choose
// 選択肢を選んだ後のフラグ更新と遷移先記録
// Body: { next_scene_id: string | null; sets_flags: Record<string, boolean> }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processChoice } from '@/lib/story/engine';

import type { GameBonus } from '@/lib/types/story';

interface ChooseBody {
  current_scene_id: string;
  next_scene_id:    string | null;
  sets_flags:       Record<string, boolean>;
  game_bonus?:      GameBonus;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

  const body = await req.json() as Partial<ChooseBody>;
  if (!body.current_scene_id) {
    return NextResponse.json({ error: 'current_scene_id が必要です' }, { status: 400 });
  }
  const currentSceneId = body.current_scene_id;
  const nextSceneId    = body.next_scene_id ?? null;
  const setsFlags      = body.sets_flags   ?? {};
  const gameBonus      = body.game_bonus   ?? null;

  try {
    const progress = await processChoice(user.id, currentSceneId, nextSceneId, setsFlags);
    return NextResponse.json({
      next_scene_id: nextSceneId,
      flags_set:     setsFlags,
      game_bonus:    gameBonus,
      progress,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : '不明なエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
