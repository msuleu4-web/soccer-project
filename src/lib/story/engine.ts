// シーン取得・遷移・フラグ更新のコアロジック
// service_role クライアントで RLS をバイパスして全ユーザーのデータを操作する

import { createServiceClient } from '@/lib/supabase/service';
import { mergeFlags } from './flags';
import type { StoryScene, UserStoryProgress, AdvanceResponse } from '@/lib/types/story';

export async function fetchScene(sceneId: string): Promise<StoryScene | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('story_scenes')
    .select('*')
    .eq('id', sceneId)
    .single();
  if (error || !data) return null;
  return data as StoryScene;
}

export async function fetchProgress(userId: string): Promise<UserStoryProgress | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('user_story_progress')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data as UserStoryProgress;
}

/**
 * 選択肢のない dialogue / reflection / match_event シーンを進める
 * 同じ chapter 内の次の scene_order を取得して進行状況を更新
 */
export async function advanceScene(
  userId: string,
  currentSceneId: string,
): Promise<AdvanceResponse> {
  const db = createServiceClient();

  const current = await fetchScene(currentSceneId);
  if (!current) throw new Error('シーンが見つかりません');

  const progress = await fetchProgress(userId);
  if (!progress) throw new Error('進行状況が見つかりません');

  const updatedFlags = mergeFlags(progress.story_flags, current.sets_flags);

  // content.next_scene_id が明示されていれば優先 (リアクションシーン → 次シーンへのブリッジ)
  const rawContent = current.content as unknown as Record<string, unknown>;
  const explicitNextId = rawContent.next_scene_id as string | undefined;

  let nextScene: StoryScene | null = null;
  if (explicitNextId) {
    nextScene = await fetchScene(explicitNextId);
  } else {
    // 同 chapter 内で scene_order が次のシーンを取得
    const { data } = await db
      .from('story_scenes')
      .select('*')
      .eq('chapter_id', current.chapter_id)
      .gt('scene_order', current.scene_order)
      .order('scene_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    nextScene = data as StoryScene | null;
  }

  const nextSceneId = nextScene ? nextScene.id : current.id;

  const { data: updated, error } = await db
    .from('user_story_progress')
    .update({
      current_scene_id: nextSceneId,
      story_flags: updatedFlags,
      last_played_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !updated) throw new Error('進行状況の更新に失敗しました');

  return {
    next_scene: nextScene,
    progress: updated as UserStoryProgress,
    flags_updated: current.sets_flags,
  };
}

/**
 * 選択肢を選んだ後のフラグ更新 + 遷移先を記録
 * currentSceneId: 選択元シーンのID (scene.sets_flags も自動適用するため)
 * next_scene_id は選択肢の content から渡す (chapter をまたいでもよい)
 */
export async function processChoice(
  userId: string,
  currentSceneId: string,
  nextSceneId: string | null,
  setsFlags: Record<string, boolean>,
): Promise<UserStoryProgress> {
  const db = createServiceClient();

  const progress = await fetchProgress(userId);
  if (!progress) throw new Error('進行状況が見つかりません');

  // 選択元シーンのシーンレベル sets_flags も適用 (misaki_met: true など)
  const currentScene = await fetchScene(currentSceneId);
  const sceneSetsFlags = currentScene?.sets_flags ?? {};

  const updatedFlags = mergeFlags(
    mergeFlags(progress.story_flags, sceneSetsFlags),
    setsFlags,
  );

  const { data, error } = await db
    .from('user_story_progress')
    .update({
      current_scene_id: nextSceneId ?? progress.current_scene_id,
      story_flags: updatedFlags,
      last_played_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) throw new Error('フラグ更新に失敗しました');
  return data as UserStoryProgress;
}
