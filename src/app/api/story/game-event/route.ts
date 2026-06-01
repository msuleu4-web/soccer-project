// POST /api/story/game-event
// ゲームイベント (週ストーリー) を受け、story_flags を更新してトリガーシーンを返す
// Body: { event_type, win, win_rate, goal_rate, had_transfer, has_injury, morale, current_league }
// Response: { scene_id: string | null, flags_updated: Record<string, boolean> }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { mergeFlags } from '@/lib/story/flags';

interface GameEventBody {
  event_type:      'match_cycle';
  win:             boolean;
  win_rate:        number;    // 0〜1 (seasonRating / 10)
  goal_rate:       number;    // 1試合平均得点
  had_transfer:    boolean;
  has_injury:      boolean;
  morale:          number;
  current_league:  string;
}

// priority 昇順で評価し、最初にマッチしたルールのシーンを返す
interface TriggerRule {
  priority:           number;
  requiredFlagAbsent: string;
  condition:          (body: GameEventBody) => boolean;
  characterSlug:      string;
  sceneOrder:         number;
}

// キャリアイベントシーンは scene_order 10000 番台以上を使用
// 設計: 特殊イベント(最優先) → 好調シーン群 → 苦境シーン群 → 通常フォールバック
// 好調/苦境は複数シーン用意し、ゲーム状態に応じて毎週連続して出るようにする
const TRIGGER_RULES: TriggerRule[] = [
  // 特殊イベント (条件付き・最優先)
  { priority: 1,  requiredFlagAbsent: 'career_transfer_event_01', condition: b => b.had_transfer,       characterSlug: 'rin-kurosaki', sceneOrder: 11001 },
  { priority: 2,  requiredFlagAbsent: 'career_injury_01',         condition: b => b.has_injury,          characterSlug: 'misaki-aoi',   sceneOrder: 12001 },
  { priority: 3,  requiredFlagAbsent: 'career_koko_01',           condition: b => b.win_rate >= 0.8,     characterSlug: 'koko-kirino',  sceneOrder: 15001 },
  { priority: 4,  requiredFlagAbsent: 'career_transfer_event_02', condition: b => b.had_transfer,        characterSlug: 'rin-kurosaki', sceneOrder: 21001 },
  { priority: 5,  requiredFlagAbsent: 'career_koko_02',           condition: b => b.goal_rate >= 1.5,    characterSlug: 'koko-kirino',  sceneOrder: 25001 },

  // 好調シーン (win_rate >= 0.6 のとき優先的に出る)
  { priority: 10, requiredFlagAbsent: 'career_good_01',           condition: b => b.win_rate >= 0.6,     characterSlug: 'misaki-aoi',   sceneOrder: 10001 },
  { priority: 11, requiredFlagAbsent: 'career_good_02',           condition: b => b.win_rate >= 0.6,     characterSlug: 'misaki-aoi',   sceneOrder: 20001 },
  { priority: 12, requiredFlagAbsent: 'career_good_03',           condition: b => b.win_rate >= 0.6,     characterSlug: 'misaki-aoi',   sceneOrder: 40001 },
  { priority: 13, requiredFlagAbsent: 'career_good_04',           condition: b => b.win_rate >= 0.6,     characterSlug: 'misaki-aoi',   sceneOrder: 60001 },

  // 苦境シーン (win_rate < 0.4 のとき優先的に出る)
  { priority: 20, requiredFlagAbsent: 'career_poor_01',           condition: b => b.win_rate < 0.4,      characterSlug: 'misaki-aoi',   sceneOrder: 10002 },
  { priority: 21, requiredFlagAbsent: 'career_poor_02',           condition: b => b.win_rate < 0.4,      characterSlug: 'misaki-aoi',   sceneOrder: 20002 },
  { priority: 22, requiredFlagAbsent: 'career_poor_03',           condition: b => b.win_rate < 0.4,      characterSlug: 'misaki-aoi',   sceneOrder: 40002 },
  { priority: 23, requiredFlagAbsent: 'career_poor_04',           condition: b => b.win_rate < 0.4,      characterSlug: 'misaki-aoi',   sceneOrder: 60002 },

  // 通常フォールバック (always・好調/苦境シーンが全部使い切られた後)
  { priority: 30, requiredFlagAbsent: 'career_rin_review_01',     condition: () => true,                 characterSlug: 'rin-kurosaki', sceneOrder: 31001 },
  { priority: 31, requiredFlagAbsent: 'career_normal_01',         condition: () => true,                 characterSlug: 'misaki-aoi',   sceneOrder: 10003 },
  { priority: 32, requiredFlagAbsent: 'career_normal_02',         condition: () => true,                 characterSlug: 'misaki-aoi',   sceneOrder: 20003 },
  { priority: 33, requiredFlagAbsent: 'career_normal_03',         condition: () => true,                 characterSlug: 'misaki-aoi',   sceneOrder: 40003 },
  { priority: 34, requiredFlagAbsent: 'career_normal_04',         condition: () => true,                 characterSlug: 'misaki-aoi',   sceneOrder: 50001 },
  { priority: 35, requiredFlagAbsent: 'career_normal_05',         condition: () => true,                 characterSlug: 'misaki-aoi',   sceneOrder: 50002 },
  { priority: 36, requiredFlagAbsent: 'career_normal_06',         condition: () => true,                 characterSlug: 'rin-kurosaki', sceneOrder: 50003 },
  { priority: 37, requiredFlagAbsent: 'career_normal_07',         condition: () => true,                 characterSlug: 'misaki-aoi',   sceneOrder: 50004 },
];

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json() as Partial<GameEventBody>;
  if (!body.event_type) {
    return NextResponse.json({ error: 'event_type が必要です' }, { status: 400 });
  }

  const db = createServiceClient();

  const progress = user ? (await db
    .from('user_story_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()).data : null;

  const currentFlags: Record<string, boolean> = (progress?.story_flags ?? {}) as Record<string, boolean>;

  const winRate = body.win_rate ?? 0.5;
  // 可変な試合状態フラグは mergeFlags の「true固定」保護を使わず直接上書きする
  const mutableFlagUpdate: Record<string, boolean> = {
    last_match_win: body.win === true,
    perf_good:      winRate >= 0.6,
    perf_poor:      winRate < 0.4,
    had_transfer:   body.had_transfer === true,
    has_injury:     body.has_injury === true,
  };
  const updatedFlags = { ...mergeFlags(currentFlags, {}), ...mutableFlagUpdate };

  // priority 順にルールを評価してシーンを探す
  // マッチしたルールのキャリアフラグを即座に updatedFlags に反映 (重複トリガー防止)
  const typedBody = body as GameEventBody;
  const sorted = [...TRIGGER_RULES].sort((a, b) => a.priority - b.priority);
  let sceneId: string | null = null;
  let triggeredFlag: string | null = null;

  for (const rule of sorted) {
    if (updatedFlags[rule.requiredFlagAbsent] === true) continue;
    if (!rule.condition(typedBody)) continue;

    const { data: character } = await db
      .from('story_characters')
      .select('id')
      .eq('slug', rule.characterSlug)
      .maybeSingle();
    if (!character) continue;

    const { data: triggerScene } = await db
      .from('story_scenes')
      .select('id')
      .eq('character_id', character.id)
      .eq('scene_order', rule.sceneOrder)
      .maybeSingle();

    if (triggerScene) {
      sceneId = triggerScene.id;
      triggeredFlag = rule.requiredFlagAbsent;
      updatedFlags[rule.requiredFlagAbsent] = true;
      break;
    }
  }

  // キャリアフラグ込みで DB に保存（ログイン済みのみ）
  if (user) {
    if (!progress) {
      const { data: firstChapter } = await db
        .from('story_chapters')
        .select('id')
        .order('part_number')
        .order('chapter_number')
        .limit(1)
        .maybeSingle();
      await db.from('user_story_progress').insert({
        user_id:            user.id,
        current_chapter_id: firstChapter?.id ?? null,
        current_scene_id:   null,
        story_flags:        updatedFlags,
      });
    } else {
      await db
        .from('user_story_progress')
        .update({ story_flags: updatedFlags, last_played_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }
  }

  const responseFlags = triggeredFlag
    ? { ...mutableFlagUpdate, [triggeredFlag]: true }
    : mutableFlagUpdate;

  return NextResponse.json({ scene_id: sceneId, flags_updated: responseFlags });
}
