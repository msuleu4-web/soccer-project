// POST /api/story/payday
// 週給を受け取る (7日クールダウン付き)
// クールダウン中は next_payday_at と理由メッセージを返す

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { canReceiveSalary, nextPaydayAt, formatNextPayday } from '@/lib/story/wallet';
import type { UserWallet, UserStoryProgress } from '@/lib/types/story';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

  const db = createServiceClient();

  const { data: walletData } = await db
    .from('user_wallet')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!walletData) {
    return NextResponse.json({ error: 'ウォレットが見つかりません' }, { status: 404 });
  }

  const wallet = walletData as UserWallet;

  // クールダウン中
  if (!canReceiveSalary(wallet)) {
    return NextResponse.json({
      credited:       false,
      amount:         0,
      new_balance:    wallet.balance,
      next_payday_at: nextPaydayAt(wallet).toISOString(),
      message_ja:     `次の給料日は ${formatNextPayday(wallet)} です。`,
    });
  }

  // シーズン番号を取得してログメッセージに使う
  const { data: progressData } = await db
    .from('user_story_progress')
    .select('season_number')
    .eq('user_id', user.id)
    .maybeSingle();

  const season = (progressData as Pick<UserStoryProgress, 'season_number'> | null)?.season_number ?? 1;
  const newBalance = wallet.balance + wallet.weekly_salary;
  const now        = new Date().toISOString();

  await Promise.all([
    db.from('user_wallet').update({
      balance:       newBalance,
      total_earned:  wallet.total_earned + wallet.weekly_salary,
      last_payday_at: now,
    }).eq('user_id', user.id),
    db.from('wallet_transactions').insert({
      user_id:          user.id,
      transaction_type: 'salary',
      amount:           wallet.weekly_salary,
      description_ja:   `シーズン${season} 週給支給`,
    }),
  ]);

  const updatedWallet: UserWallet = { ...wallet, last_payday_at: now };

  return NextResponse.json({
    credited:       true,
    amount:         wallet.weekly_salary,
    new_balance:    newBalance,
    next_payday_at: nextPaydayAt(updatedWallet).toISOString(),
    message_ja:     `${wallet.weekly_salary.toLocaleString('ja-JP')}Gの週給が支給されました。`,
  });
}
