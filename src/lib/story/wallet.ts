// 給料・残高管理の計算ロジック (純粋関数のみ)
// DB 操作は必ず API Route 経由。このファイルは副作用なし

import type { UserWallet } from '@/lib/types/story';

const PAYDAY_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export function canReceiveSalary(wallet: UserWallet): boolean {
  return Date.now() - new Date(wallet.last_payday_at).getTime() >= PAYDAY_INTERVAL_MS;
}

export function nextPaydayAt(wallet: UserWallet): Date {
  return new Date(new Date(wallet.last_payday_at).getTime() + PAYDAY_INTERVAL_MS);
}

export function hasSufficientBalance(wallet: UserWallet, cost: number): boolean {
  return wallet.balance >= cost;
}

export function formatBalance(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}G`;
}

export function formatNextPayday(wallet: UserWallet): string {
  return nextPaydayAt(wallet).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}
