-- ================================================
-- 葵美咲ルート リアクションシーン追加
-- 選択肢ごとに 2〜3 行の短いリアクションを挟む
-- 20260524_002_misaki_route_full.sql 実行後に実行
-- ================================================
--
-- 仕組み:
--   選択肢 A → リアクションシーン A (next_scene_id 明示) → 次メインシーン
--   選択肢 B → リアクションシーン B (next_scene_id 明示) → 次メインシーン
--
-- リアクションシーンは scene_order 101〜108 (メインルートと干渉しない)
-- 「次へ」ボタンで advance → content.next_scene_id へ遷移
-- ================================================

DO $$
DECLARE
  misaki_id uuid;
  ch1_id    uuid;

  -- 既存シーンIDを title_ja で取得
  s01_id   uuid;
  s02_id   uuid;
  s03w_id  uuid;
  s04_id   uuid;
  s05_id   uuid;
  s06_id   uuid;
  s07_id   uuid;

  -- リアクションシーン UUID (事前生成)
  r01a_id  uuid := gen_random_uuid();   -- S01 選択A → S02
  r01b_id  uuid := gen_random_uuid();   -- S01 選択B → S02
  r03a_id  uuid := gen_random_uuid();   -- S03W 選択A → S04
  r03b_id  uuid := gen_random_uuid();   -- S03W 選択B → S04
  r04a_id  uuid := gen_random_uuid();   -- S04 選択A(無料) → S05
  r04b_id  uuid := gen_random_uuid();   -- S04 選択B(有料) → S05
  r06a_id  uuid := gen_random_uuid();   -- S06 選択A(無料) → S07
  r06b_id  uuid := gen_random_uuid();   -- S06 選択B(有料) → S07

BEGIN
  SELECT id INTO misaki_id FROM public.story_characters WHERE slug = 'misaki-aoi';
  SELECT id INTO ch1_id    FROM public.story_chapters   WHERE chapter_number = 1 AND part_number = 1;

  IF misaki_id IS NULL OR ch1_id IS NULL THEN
    RAISE NOTICE 'misaki-aoi またはチャプターが見つかりません。';
    RETURN;
  END IF;

  -- 既存シーン ID 取得
  SELECT id INTO s01_id  FROM public.story_scenes WHERE character_id = misaki_id AND title_ja = 'はじめての出会い';
  SELECT id INTO s02_id  FROM public.story_scenes WHERE character_id = misaki_id AND title_ja = 'スタジアムの秘密';
  SELECT id INTO s03w_id FROM public.story_scenes WHERE character_id = misaki_id AND title_ja = '初勝利の夜';
  SELECT id INTO s04_id  FROM public.story_scenes WHERE character_id = misaki_id AND title_ja = '父の戦術ノート';
  SELECT id INTO s05_id  FROM public.story_scenes WHERE character_id = misaki_id AND title_ja = '練習場の夕暮れ';
  SELECT id INTO s06_id  FROM public.story_scenes WHERE character_id = misaki_id AND title_ja = '病院の帰り道';
  SELECT id INTO s07_id  FROM public.story_scenes WHERE character_id = misaki_id AND title_ja = '決戦前夜';

  IF s01_id IS NULL THEN
    RAISE NOTICE 'メインシーンが見つかりません。20260524_002_misaki_route_full.sql を先に実行してください。';
    RETURN;
  END IF;

  -- 既存リアクションシーンを削除 (再実行対応)
  DELETE FROM public.story_scenes WHERE chapter_id = ch1_id AND scene_order BETWEEN 101 AND 108;

  -- ════════════════════════════════════════
  -- R01A: 「よろしくお願いします」→ 丁寧に受け取る
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r01a_id, ch1_id, misaki_id, 101, 'dialogue', 'R:丁寧な挨拶',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_entrance_day',
      'bgm', 'misaki_theme_light',
      'next_scene_id', s02_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','misaki','emotion','smile',
          'text','はい、こちらこそ。……なんか、やっと言えた気がします。'),
        jsonb_build_object('speaker','narration',
          'text','彼女は少し肩の力が抜けたように見えた。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- R01B: 「何でも？」→ 焦って否定する
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r01b_id, ch1_id, misaki_id, 102, 'dialogue', 'R:からかわれて慌てる',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_entrance_day',
      'bgm', 'misaki_theme_light',
      'next_scene_id', s02_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','misaki','emotion','embarrassed',
          'text','え、ええっ！　そ、そういう意味じゃ……っ！'),
        jsonb_build_object('speaker','misaki','emotion','neutral',
          'text','……も、もちろん、クラブのことで困ったことがあれば、ということです。'),
        jsonb_build_object('speaker','narration',
          'text','彼女の耳が少し赤くなっていた。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- R03A: 「心配になった」→ 内省
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r03a_id, ch1_id, misaki_id, 103, 'reflection', 'R:廊下に残る',
    jsonb_build_object(
      'type', 'reflection',
      'background', 'clubhouse_corridor_night',
      'bgm', 'misaki_theme_warm',
      'next_scene_id', s04_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration',
          'text','廊下の空気が、少し重い気がした。'),
        jsonb_build_object('speaker','narration',
          'text','彼女の背中が遠ざかるのを、ただ見ていた。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- R03B: 「また一緒に勝ちましょう」→ 嬉しそうに頷く
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r03b_id, ch1_id, misaki_id, 104, 'dialogue', 'R:一緒に勝とう',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_corridor_night',
      'bgm', 'misaki_theme_warm',
      'next_scene_id', s04_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration',
          'text','彼女は少し驚いた顔をして、それからゆっくりと頷いた。'),
        jsonb_build_object('speaker','misaki','emotion','happy',
          'text','……はい。また一緒に、勝ちましょう。'),
        jsonb_build_object('speaker','narration',
          'text','その言葉は、思ったより真剣だった。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- R04A: 「借りてもいいですか」→ 静かに渡す
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r04a_id, ch1_id, misaki_id, 105, 'dialogue', 'R:ノートを渡す',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_archive_room',
      'bgm', 'misaki_theme_mysterious',
      'next_scene_id', s05_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','misaki','emotion','neutral',
          'text','……どうぞ。大切に、してください。'),
        jsonb_build_object('speaker','narration',
          'text','彼女はそっとノートを差し出した。少し迷ってから、手を離した。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- R04B: (有料)「いつか完成させましょう」→ 震える指でノートを渡す
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r04b_id, ch1_id, misaki_id, 106, 'dialogue', 'R:ノートを完成させる約束',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_archive_room',
      'bgm', 'misaki_theme_mysterious',
      'next_scene_id', s05_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration',
          'text','彼女の目が、一瞬だけ揺れた。'),
        jsonb_build_object('speaker','misaki','emotion','crying',
          'text','……っ。……お願いします。'),
        jsonb_build_object('speaker','narration',
          'text','それだけ言って、俯いた。ノートを両手で渡してくる指が、少し震えていた。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- R06A: 「また来ます」→ 言葉が出なかった
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r06a_id, ch1_id, misaki_id, 107, 'reflection', 'R:立ち去る背中',
    jsonb_build_object(
      'type', 'reflection',
      'background', 'hospital_road_evening',
      'bgm', 'misaki_theme_sad',
      'next_scene_id', s07_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration',
          'text','彼女は小さく頭を下げた。'),
        jsonb_build_object('speaker','narration',
          'text','歩きながら、うまく言葉が出なかった自分に気づいた。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- R06B: (有料)「今度一緒に来ていいですか」→ 涙をこらえる
  -- ════════════════════════════════════════
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r06b_id, ch1_id, misaki_id, 108, 'dialogue', 'R:一緒に来てもいい?',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'hospital_road_evening',
      'bgm', 'misaki_theme_sad',
      'next_scene_id', s07_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','misaki','emotion','surprised',
          'text','……えっ。'),
        jsonb_build_object('speaker','narration',
          'text','しばらく、彼女は私の顔を見ていた。'),
        jsonb_build_object('speaker','misaki','emotion','happy',
          'text','……本当に、いいんですか?'),
        jsonb_build_object('speaker','narration',
          'text','目が、少し潤んでいた。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ════════════════════════════════════════
  -- 既存シーンの choices を更新
  -- → リアクションシーンを経由するよう変更
  -- ════════════════════════════════════════

  -- S01: 選択肢をリアクションシーンへ
  UPDATE public.story_scenes
  SET content = jsonb_set(content, '{choices}', jsonb_build_array(
    jsonb_build_object(
      'id','s01_a',
      'text','よろしくお願いします、葵さん。',
      'next_scene_id', r01a_id::text,
      'cost', 0,
      'sets_flags', '{"misaki_met":true}'
    ),
    jsonb_build_object(
      'id','s01_b',
      'text','「何でも」って、どんなことでも?',
      'next_scene_id', r01b_id::text,
      'cost', 0,
      'sets_flags', '{"misaki_met":true,"misaki_curious":true}'
    )
  ))
  WHERE id = s01_id;

  -- S03W: 選択肢をリアクションシーンへ
  UPDATE public.story_scenes
  SET content = jsonb_set(content, '{choices}', jsonb_build_array(
    jsonb_build_object(
      'id','s03w_a',
      'text','彼女のことが、少し心配になった。',
      'next_scene_id', r03a_id::text,
      'cost', 0,
      'sets_flags', '{"misaki_opened_up":true}'
    ),
    jsonb_build_object(
      'id','s03w_b',
      'text','「また一緒に勝ちましょう」と声をかける。',
      'next_scene_id', r03b_id::text,
      'cost', 0,
      'sets_flags', '{"misaki_opened_up":true,"misaki_close":true}'
    )
  ))
  WHERE id = s03w_id;

  -- S04: 選択肢をリアクションシーンへ
  UPDATE public.story_scenes
  SET content = jsonb_set(content, '{choices}', jsonb_build_array(
    jsonb_build_object(
      'id','s04_a',
      'text','ノートを借りてもいいですか。',
      'next_scene_id', r04a_id::text,
      'cost', 0,
      'sets_flags', '{"notebook_discovered":true,"notebook_borrowed":true}'
    ),
    jsonb_build_object(
      'id','s04_b',
      'text','そのノートを、いつか完成させましょう。',
      'next_scene_id', r04b_id::text,
      'cost', 5000,
      'sets_flags', '{"notebook_discovered":true,"notebook_borrowed":true,"misaki_close":true}',
      'locked_message', '特別な選択肢 (5,000G)'
    )
  ))
  WHERE id = s04_id;

  -- S06: 選択肢をリアクションシーンへ
  UPDATE public.story_scenes
  SET content = jsonb_set(content, '{choices}', jsonb_build_array(
    jsonb_build_object(
      'id','s06_a',
      'text','「また来ます」と言って、その場を後にした。',
      'next_scene_id', r06a_id::text,
      'cost', 0,
      'sets_flags', '{"misaki_father_story":true}'
    ),
    jsonb_build_object(
      'id','s06_b',
      'text','「今度、一緒に来てもいいですか」と聞いた。',
      'next_scene_id', r06b_id::text,
      'cost', 8000,
      'sets_flags', '{"misaki_father_story":true,"misaki_hospital_invite":true}',
      'locked_message', '特別な選択肢 (8,000G)'
    )
  ))
  WHERE id = s06_id;

  RAISE NOTICE '完了: リアクションシーン 8 件挿入 + 既存 4 シーンの choices 更新';
  RAISE NOTICE 'R01A: % | R01B: %', r01a_id, r01b_id;
  RAISE NOTICE 'R03A: % | R03B: %', r03a_id, r03b_id;
  RAISE NOTICE 'R04A: % | R04B: %', r04a_id, r04b_id;
  RAISE NOTICE 'R06A: % | R06B: %', r06a_id, r06b_id;

END $$;

-- 確認クエリ
SELECT scene_order, title_ja, scene_type
FROM public.story_scenes
ORDER BY scene_order;
