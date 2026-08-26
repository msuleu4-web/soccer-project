-- ================================================
-- キャリアストーリー: 5試合ごとに発動するゲーム連動シーン
-- scene_order 101〜103 を使用 (既存ルートと競合しない)
-- game_bonus フィールドで育成ゲームにボーナスを反映
-- ================================================

DO $$
DECLARE
  misaki_id  uuid;
  rin_id     uuid;
  ch_id      uuid;

  -- 好調シーン (misaki 101)
  good_01_id uuid := gen_random_uuid();
  -- 不調シーン (misaki 102)
  poor_01_id uuid := gen_random_uuid();
  -- 普通シーン (misaki 103)
  norm_01_id uuid := gen_random_uuid();
  -- 移籍シーン (rin 101)
  trf_01_id  uuid := gen_random_uuid();

BEGIN
  SELECT id INTO misaki_id FROM public.story_characters WHERE slug = 'misaki-aoi';
  SELECT id INTO rin_id    FROM public.story_characters WHERE slug = 'rin-kurosaki';

  IF misaki_id IS NULL THEN RAISE EXCEPTION '美咲キャラが見つかりません'; END IF;
  IF rin_id    IS NULL THEN RAISE EXCEPTION '凛キャラが見つかりません';   END IF;

  -- Part3 Chapter1: キャリアストーリー
  INSERT INTO public.story_chapters (
    part_number, chapter_number, title_ja, subtitle_ja, description_ja, required_progress
  ) VALUES (
    3, 1,
    'キャリアストーリー',
    '5試合ごとに届く声',
    '試合を重ねるたびに、クラブの人たちがあなたのキャリアに関わってくる。',
    '{}'
  ) ON CONFLICT (part_number, chapter_number) DO NOTHING;

  SELECT id INTO ch_id FROM public.story_chapters WHERE part_number = 3 AND chapter_number = 1;

  -- 既存キャリアシーンをクリア
  DELETE FROM public.story_scenes
    WHERE chapter_id = ch_id AND scene_order IN (101, 102, 103);
  DELETE FROM public.story_scenes
    WHERE character_id = rin_id AND chapter_id = ch_id AND scene_order = 101;

  -- ────────────────────────────────────────────────────────────
  -- 好調シーン: scene_order=101, character=misaki-aoi
  -- トリガー条件: perf_good=true, career_good_01=false
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    good_01_id, ch_id, misaki_id, 101, 'dialogue', '好調の報告',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'clubhouse_corridor', 'bgm', 'warm_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', 'トレーニングルームを出ると、美咲が待っていた。'),
        jsonb_build_object('speaker', 'misaki-aoi',   'emotion', 'happy',   'text', '最近の試合、すごくいいですよ！ 数字を見てたら、思わず声が出ちゃいました。'),
        jsonb_build_object('speaker', 'player',        'text', '……気づいてたんですか。'),
        jsonb_build_object('speaker', 'misaki-aoi',   'emotion', 'smile',   'text', 'もちろん。フィジカルの数値も上がってる。この調子でいけば、もっと上に行けます。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女はリハビリボードを抱えながら、笑った。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_good_a',
          'text', '「ありがとう、続けます」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_good_01":true}',
          'game_bonus', '{"morale":6}'
        ),
        jsonb_build_object(
          'id', 'career_good_b',
          'text', '「まだシュートが甘い、もっと練習する」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_good_01":true}',
          'game_bonus', '{"morale":3,"shooting":1}'
        )
      )
    ),
    0, '{}', '{"career_good_01":true}'
  );

  -- ────────────────────────────────────────────────────────────
  -- 不調シーン: scene_order=102, character=misaki-aoi
  -- トリガー条件: perf_poor=true, career_poor_01=false
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    poor_01_id, ch_id, misaki_id, 102, 'dialogue', 'スランプの夜',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'clubhouse_archive_room', 'bgm', 'sad_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '練習後、一人でいると美咲が声をかけてきた。'),
        jsonb_build_object('speaker', 'misaki-aoi',   'emotion', 'anxious', 'text', '……最近、体が重そうですね。'),
        jsonb_build_object('speaker', 'player',        'text', 'わかりますか。'),
        jsonb_build_object('speaker', 'misaki-aoi',   'emotion', 'serious', 'text', 'フィジカルの専門家ですから。でも数字だけじゃなく……なんか、気持ちの問題な気もして。'),
        jsonb_build_object('speaker', 'misaki-aoi',   'emotion', 'neutral', 'text', '話したくなければ話さなくていいです。でも、聞きますよ。'),
        jsonb_build_object('speaker', 'narration',    'text', '静かな部屋に、彼女の言葉が残った。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_poor_a',
          'text', '「大丈夫、自分で立て直す」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_poor_01":true}',
          'game_bonus', '{"morale":8}'
        ),
        jsonb_build_object(
          'id', 'career_poor_b',
          'text', '「正直、キツイです」と打ち明けた',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_poor_01":true}',
          'game_bonus', '{"morale":10,"stamina":1}'
        )
      )
    ),
    0, '{}', '{"career_poor_01":true}'
  );

  -- ────────────────────────────────────────────────────────────
  -- 普通シーン: scene_order=103, character=misaki-aoi
  -- トリガー条件: career_normal_01=false (フォールバック)
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    norm_01_id, ch_id, misaki_id, 103, 'dialogue', '練習後の会話',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'training_ground', 'bgm', 'warm_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '練習後のグラウンド。美咲がストレッチを手伝ってくれた。'),
        jsonb_build_object('speaker', 'misaki-aoi',   'emotion', 'neutral', 'text', '最近、試合の入り方が変わりましたね。'),
        jsonb_build_object('speaker', 'player',        'text', 'そうですか？'),
        jsonb_build_object('speaker', 'misaki-aoi',   'emotion', 'smile',   'text', '立ち上がりが早い。ウォームアップの成果だと思います。地味だけど、ちゃんと積み重なってる。'),
        jsonb_build_object('speaker', 'narration',    'text', '地道な日々に、意味があると思えた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_norm_a',
          'text', '「続けます」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_normal_01":true}',
          'game_bonus', '{"morale":4,"stamina":1}'
        ),
        jsonb_build_object(
          'id', 'career_norm_b',
          'text', '「パスの練習も増やしたい」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_normal_01":true}',
          'game_bonus', '{"morale":4,"passing":1}'
        )
      )
    ),
    0, '{}', '{"career_normal_01":true}'
  );

  -- ────────────────────────────────────────────────────────────
  -- 移籍シーン: scene_order=101, character=rin-kurosaki
  -- トリガー条件: had_transfer=true, career_transfer_event_01=false
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    trf_01_id, ch_id, rin_id, 101, 'dialogue', '移籍の打診',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'meeting_room_day', 'bgm', 'rin_theme_cold',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '廊下を歩いていると、凛が待ち構えていた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '移籍のオファーが来ていますね。把握しています。'),
        jsonb_build_object('speaker', 'player',        'text', 'データが、もう？'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '私の仕事です。……あなたのスタット推移から見れば、上位リーグでも通用する時期に来ています。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', 'ただ、決めるのはあなたです。数字が示すのは可能性だけで、選択はあなたの問題です。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は珍しく、何も言わずに待った。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_trf_a',
          'text', '「ここで続ける」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_transfer_event_01":true}',
          'game_bonus', '{"morale":5}'
        ),
        jsonb_build_object(
          'id', 'career_trf_b',
          'text', '「移籍も視野に入れている」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_transfer_event_01":true}',
          'game_bonus', '{"morale":4,"passing":1}'
        )
      )
    ),
    0, '{}', '{"career_transfer_event_01":true}'
  );

  RAISE NOTICE 'キャリアストーリー4シーン挿入完了';

END $$;

-- 確認
SELECT sc.display_name_ja, s.scene_order, s.title_ja
FROM   public.story_scenes s
JOIN   public.story_characters sc ON sc.id = s.character_id
JOIN   public.story_chapters   ch ON ch.id = s.chapter_id
WHERE  ch.part_number = 3 AND ch.chapter_number = 1
ORDER BY s.character_id, s.scene_order;
