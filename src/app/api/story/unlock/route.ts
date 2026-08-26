// POST /api/story/unlock
// 週給を使ってシーン/ルートを解放する
// Body: { content_type: ContentType; content_id: string }
// 残高チェック → 解放登録 → 残高減算 → 取引記録 を並列実行

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ContentType, StoryScene, UserWallet } from '@/lib/types/story';

interface UnlockBody {
  content_type: ContentType;
  content_id:   string;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

  const body = await req.json() as Partial<UnlockBody>;
  if (!body.content_type || !body.content_id) {
    return NextResponse.json({ error: 'content_type と content_id が必要です' }, { status: 400 });
  }

  const db = createServiceClient();

  // 既解放チェック (二重課金防止)
  const { data: existing } = await db
    .from('user_unlocked_content')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', body.content_type)
    .eq('content_id', body.content_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: '既に解放済みです', already_unlocked: true },
      { status: 409 },
    );
  }

  // コスト取得 (scene のみ; route は 0 扱い)
  let cost = 0;
  if (body.content_type === 'scene') {
    const { data: sceneData } = await db
      .from('story_scenes')
      .select('unlock_cost')
      .eq('id', body.content_id)
      .single();
    cost = (sceneData as Pick<StoryScene, 'unlock_cost'> | null)?.unlock_cost ?? 0;
  }

  // 無料コンテンツはそのまま解放
  if (cost === 0) {
    await db.from('user_unlocked_content').insert({
      user_id:      user.id,
      content_type: body.content_type,
      content_id:   body.content_id,
    });
    return NextResponse.json({ success: true, content_id: body.content_id, new_balance: 0 });
  }

  // 残高確認
  const { data: walletData } = await db
    .from('user_wallet')
    .select('balance, total_spent')
    .eq('user_id', user.id)
    .single();

  if (!walletData) {
    return NextResponse.json({ error: 'ウォレットが見つかりません' }, { status: 404 });
  }

  const wallet = walletData as Pick<UserWallet, 'balance' | 'total_spent'>;

  if (wallet.balance < cost) {
    return NextResponse.json(
      { error: `残高が不足しています (必要: ${cost.toLocaleString('ja-JP')}G)` },
      { status: 402 },
    );
  }

  const newBalance = wallet.balance - cost;

  // 解放 + 残高減算 + 取引記録を並列実行
  const [unlockRes, walletRes, txRes] = await Promise.all([
    db.from('user_unlocked_content').insert({
      user_id:      user.id,
      content_type: body.content_type,
      content_id:   body.content_id,
    }),
    db.from('user_wallet').update({
      balance:     newBalance,
      total_spent: wallet.total_spent + cost,
    }).eq('user_id', user.id),
    db.from('wallet_transactions').insert({
      user_id:              user.id,
      transaction_type:     'unlock_scene',
      amount:               -cost,
      description_ja:       'シーン解放',
      related_content_type: body.content_type,
      related_content_id:   body.content_id,
    }),
  ]);

  if (unlockRes.error || walletRes.error || txRes.error) {
    return NextResponse.json({ error: '解放処理に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ success: true, content_id: body.content_id, new_balance: newBalance });
}
