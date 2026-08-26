// コンテンツ解放条件の判定ユーティリティ

import type { StoryScene, UserStoryProgress, UserWallet } from '@/lib/types/story';
import { checkFlags } from './flags';

export interface UnlockCheck {
  canView: boolean;
  needsPurchase: boolean;
  missingFlags: string[];
  insufficientBalance: boolean;
}

/**
 * シーン閲覧可否を総合チェック
 * alreadyUnlocked: user_unlocked_content に登録済みか
 */
export function checkSceneAccess(
  scene: StoryScene,
  progress: UserStoryProgress,
  wallet: UserWallet,
  alreadyUnlocked: boolean,
): UnlockCheck {
  const flagsOk = checkFlags(progress.story_flags, scene.requires_flags);
  const missingFlags = flagsOk
    ? []
    : Object.keys(scene.requires_flags).filter(
        (k) => progress.story_flags[k] !== scene.requires_flags[k],
      );

  const needsPurchase      = scene.unlock_cost > 0 && !alreadyUnlocked;
  const insufficientBalance = needsPurchase && wallet.balance < scene.unlock_cost;

  return {
    canView: flagsOk && !insufficientBalance,
    needsPurchase,
    missingFlags,
    insufficientBalance,
  };
}
