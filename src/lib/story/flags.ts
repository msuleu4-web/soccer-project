// フラグ管理ユーティリティ
// 一度立てた true フラグは原則として消さない設計 (CLANNAD方式)

import type { UserStoryProgress } from '@/lib/types/story';

/**
 * requires_flags の全条件が story_flags で満たされているか確認
 */
export function checkFlags(
  storyFlags: Record<string, boolean>,
  required: Record<string, boolean>,
): boolean {
  return Object.entries(required).every(([k, v]) => storyFlags[k] === v);
}

/**
 * フラグを安全にマージ
 * 既に true のフラグを false に上書きしない
 */
export function mergeFlags(
  current: Record<string, boolean>,
  incoming: Record<string, boolean>,
): Record<string, boolean> {
  const merged = { ...current };
  for (const [k, v] of Object.entries(incoming)) {
    if (current[k] === true && v === false) continue;
    merged[k] = v;
  }
  return merged;
}

/**
 * キャラクターとの関係性をテキストで表現 (数値は非公開)
 * slug の最初のセグメントをキーのプレフィックスとして使う
 * 例: 'misaki-aoi' → 'misaki'
 */
export function getRelationshipHint(
  slug: string,
  flags: Record<string, boolean>,
): string | null {
  const key = slug.split('-')[0];
  if (flags[`${key}_trusts_player`]) return '最近、彼女との距離が縮まった気がする。';
  if (flags[`${key}_close`])         return '彼女は、あなたのことを少し意識しているようだ。';
  if (flags[`met_${key}`])           return 'まだお互いのことを知らないが、何かが始まりそうな予感がする。';
  return null;
}

/**
 * 試合結果フラグをセット
 * last_match_win: true (WIN) / false (LOSE/DRAW)
 */
export function setMatchResultFlag(
  flags: Record<string, boolean>,
  result: 'win' | 'lose' | 'draw',
): Record<string, boolean> {
  return mergeFlags(flags, { last_match_win: result === 'win' });
}

/**
 * ルートを解放できるか判定
 * 冬花ルートは 2 ルートクリアで解放
 */
export function canUnlockRoute(
  progress: UserStoryProgress,
  targetSlug: string,
): boolean {
  if (progress.unlocked_routes.includes(targetSlug)) return true;
  if (targetSlug === 'fuyuka-shiranui' && progress.completed_routes.length >= 2) return true;
  return false;
}
