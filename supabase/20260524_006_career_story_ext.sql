-- ================================================================
-- キャリアストーリー拡張: 分岐シーン追加
-- Part 3 Chapter 1 に追加 (既存 101-103, rin 101 の続き)
-- 第2サイクル: misaki 201-203, rin 201
-- 怪我特殊: misaki 301
-- 凛レビュー: rin 301
-- 第3サイクル: misaki 401-403
-- ================================================================

DO $$
DECLARE
  misaki_id  uuid;
  rin_id     uuid;
  ch_id      uuid;

  -- 第2サイクル
  good_02_id   uuid := gen_random_uuid();
  poor_02_id   uuid := gen_random_uuid();
  norm_02_id   uuid := gen_random_uuid();
  trf_02_id    uuid := gen_random_uuid();
  -- 怪我・凛レビュー
  inj_01_id    uuid := gen_random_uuid();
  rin_rev_id   uuid := gen_random_uuid();
  -- 第3サイクル
  good_03_id   uuid := gen_random_uuid();
  poor_03_id   uuid := gen_random_uuid();
  norm_03_id   uuid := gen_random_uuid();

BEGIN
  SELECT id INTO misaki_id FROM public.story_characters WHERE slug = 'misaki-aoi';
  SELECT id INTO rin_id    FROM public.story_characters WHERE slug = 'rin-kurosaki';
  SELECT id INTO ch_id     FROM public.story_chapters
    WHERE part_number = 3 AND chapter_number = 1;

  IF misaki_id IS NULL THEN RAISE EXCEPTION '美咲キャラが見つかりません'; END IF;
  IF rin_id    IS NULL THEN RAISE EXCEPTION '凛キャラが見つかりません';   END IF;
  IF ch_id     IS NULL THEN RAISE EXCEPTION 'Part3 Chapter1 が見つかりません'; END IF;

  -- 既存データのクリア (再実行時の重複防止)
  DELETE FROM public.story_scenes
    WHERE chapter_id = ch_id AND scene_order IN (201, 202, 203, 301, 401, 402, 403);
  DELETE FROM public.story_scenes
    WHERE character_id = rin_id AND chapter_id = ch_id AND scene_order IN (201, 301);

  -- ============================================================
  -- 【第2サイクル】好調シーン misaki 201: 「続く快進撃」
  -- 条件: win_rate >= 0.6, career_good_02=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    good_02_id, ch_id, misaki_id, 201, 'dialogue', '続く快進撃',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'training_ground', 'bgm', 'warm_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',   'text', '好調が続いている。廊下で美咲に呼び止められた。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'happy',   'text', '数字、ずっと追ってるんですけど……正直、驚いてます。'),
        jsonb_build_object('speaker', 'player',                             'text', '気にしてくれてたんですか。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'smile',   'text', 'それが仕事なので。でも……仕事だからじゃなくて、見ていたい、って思ってます。どこまで行くのか。'),
        jsonb_build_object('speaker', 'narration',   'text', '彼女の目には、純粋な興味があった。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_good_02_a', 'text', '「もっと高みを目指します」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_good_02":true}',
          'game_bonus', '{"morale":5}'
        ),
        jsonb_build_object(
          'id', 'career_good_02_b', 'text', '「静かに続けていきます」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_good_02":true}',
          'game_bonus', '{"morale":3,"speed":1}'
        )
      )
    ),
    0, '{}', '{"career_good_02":true}'
  );

  -- ============================================================
  -- 【第2サイクル】不調シーン misaki 202: 「折れない理由」
  -- 条件: win_rate < 0.4, career_poor_02=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    poor_02_id, ch_id, misaki_id, 202, 'dialogue', '折れない理由',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'clubhouse_archive_room', 'bgm', 'sad_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',   'text', '不調が続いている。練習後、体育館に一人でいると美咲が入ってきた。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'anxious', 'text', 'まだいたんですか。'),
        jsonb_build_object('speaker', 'player',                             'text', '止まれなくて。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'serious', 'text', '……私も、最初の頃そういう時期がありました。トレーナーとして何をやっても結果が出なくて。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'neutral', 'text', '楽になるわけじゃないけど……その気持ち、わかります。'),
        jsonb_build_object('speaker', 'narration',   'text', '彼女は隣に座った。珍しいことだった。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_poor_02_a', 'text', '「話してくれてありがとう」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_poor_02":true}',
          'game_bonus', '{"morale":8}'
        ),
        jsonb_build_object(
          'id', 'career_poor_02_b', 'text', '「お互い、続けていきましょう」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_poor_02":true}',
          'game_bonus', '{"morale":6,"stamina":1}'
        )
      )
    ),
    0, '{}', '{"career_poor_02":true}'
  );

  -- ============================================================
  -- 【第2サイクル】普通シーン misaki 203: 「見えない成長」
  -- 条件: フォールバック, career_normal_02=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    norm_02_id, ch_id, misaki_id, 203, 'dialogue', '見えない成長',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'training_ground', 'bgm', 'warm_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',   'text', '練習後、美咲がタブレットを持ってやってきた。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'neutral', 'text', 'ちょっとこれ見てもらえますか。'),
        jsonb_build_object('speaker', 'player',                             'text', '何ですか？'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'smile',   'text', '先週と今週のヒートマップです。動ける範囲が広がってますよね。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'neutral', 'text', '数字は嘘をつかない。スコアに出なくても、成長は確実にある。'),
        jsonb_build_object('speaker', 'narration',   'text', 'データが示した事実に、少し救われた気がした。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_norm_02_a', 'text', '「プロセスを信じます」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_normal_02":true}',
          'game_bonus', '{"morale":4,"stamina":1}'
        ),
        jsonb_build_object(
          'id', 'career_norm_02_b', 'text', '「もっとデータを見せてください」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_normal_02":true}',
          'game_bonus', '{"morale":3,"passing":1}'
        )
      )
    ),
    0, '{}', '{"career_normal_02":true}'
  );

  -- ============================================================
  -- 【第2サイクル】移籍シーン rin 201: 「二度目のオファー」
  -- 条件: had_transfer=true, career_transfer_event_02=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    trf_02_id, ch_id, rin_id, 201, 'dialogue', '二度目のオファー',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'meeting_room_day', 'bgm', 'rin_theme_cold',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', 'また移籍の打診が来た。凛は監督室の前で待ち構えていた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '先に見ました。前回より条件がいい。'),
        jsonb_build_object('speaker', 'player',                              'text', '当然ですね。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '財務的には、移籍が合理的です。でも……'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', 'データに映らないものもある。ここで積み上げた信頼関係、チームの戦術理解……それも資産です。'),
        jsonb_build_object('speaker', 'narration',    'text', '珍しく、少し言葉が詰まったように見えた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_trf_02_a', 'text', '「今回は真剣に考えてみます」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_transfer_event_02":true}',
          'game_bonus', '{"morale":5}'
        ),
        jsonb_build_object(
          'id', 'career_trf_02_b', 'text', '「このチームにいる意味がある」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_transfer_event_02":true}',
          'game_bonus', '{"morale":8,"dribbling":1}'
        )
      )
    ),
    0, '{}', '{"career_transfer_event_02":true}'
  );

  -- ============================================================
  -- 【特殊】怪我シーン misaki 301: 「回復の時間」
  -- 条件: has_injury=true, career_injury_01=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    inj_01_id, ch_id, misaki_id, 301, 'dialogue', '回復の時間',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'clubhouse_archive_room', 'bgm', 'sad_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',   'text', 'リハビリ室。指示通り早めに来ると、美咲はもう準備を始めていた。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'anxious', 'text', '来ましたね。今日の状態、どうですか？'),
        jsonb_build_object('speaker', 'player',                             'text', 'まだ痛みが残ってます。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'serious', 'text', '嘘をつかないでください。歩き方で分かります。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'neutral', 'text', '怪我はサインです。失敗じゃない。体がメッセージを送ってる。それを情報として受け取れる選手は、長くプレーできる。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'smile',   'text', '完全に戻るまで、一緒にいます。'),
        jsonb_build_object('speaker', 'narration',   'text', '彼女の言葉に、焦りが少しだけ和らいだ。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_injury_01_a', 'text', '「あなたのプランに従います」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_injury_01":true}',
          'game_bonus', '{"morale":8,"stamina":2}'
        ),
        jsonb_build_object(
          'id', 'career_injury_01_b', 'text', '「少し早めに復帰できますか？」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_injury_01":true}',
          'game_bonus', '{"morale":5,"stamina":1}'
        )
      )
    ),
    0, '{}', '{"career_injury_01":true}'
  );

  -- ============================================================
  -- 【特殊】凛レビュー rin 301: 「冷静な評価」
  -- 条件: フォールバック (第3サイクル), career_rin_review_01=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    rin_rev_id, ch_id, rin_id, 301, 'dialogue', '冷静な評価',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'meeting_room_day', 'bgm', 'rin_theme_cold',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '凛から珍しく呼び出しが来た。分析室に入ると、大量のグラフが並んでいた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '座ってください。シーズン途中のデータをまとめました。'),
        jsonb_build_object('speaker', 'player',                              'text', 'そんな早く？'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '何週間も集計してます。平均レーティングの推移、シュート精度、プレッシング距離……'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '全体評価は上昇傾向。弱点はあるが、成長曲線は有効です。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……参考になると思って。客観的に。'),
        jsonb_build_object('speaker', 'narration',    'text', '最後に、ほんの少し声が柔らかくなった気がした。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_rin_review_a', 'text', '「ありがとう。何を強化すべきですか？」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_rin_review_01":true}',
          'game_bonus', '{"morale":5,"passing":1}'
        ),
        jsonb_build_object(
          'id', 'career_rin_review_b', 'text', '「データは正直ですね」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_rin_review_01":true}',
          'game_bonus', '{"morale":4,"shooting":1}'
        )
      )
    ),
    0, '{}', '{"career_rin_review_01":true}'
  );

  -- ============================================================
  -- 【第3サイクル】好調シーン misaki 401: 「最高潮」
  -- 条件: win_rate >= 0.6, career_good_03=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    good_03_id, ch_id, misaki_id, 401, 'dialogue', '最高潮',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'clubhouse_corridor', 'bgm', 'warm_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',   'text', 'これほど好調なシーズンは初めてかもしれない。スタッフ全員が何かを感じ取っていた。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'happy',   'text', '伝えなきゃいけないことがあって。私が見てきた選手の中で、今のあなたの数字は……本当に見たことがないレベルです。'),
        jsonb_build_object('speaker', 'player',                             'text', 'それは褒め言葉ですか？'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'smile',   'text', '事実です。そして……その成長の一部に携われたことが、私には嬉しい。'),
        jsonb_build_object('speaker', 'narration',   'text', '飾りのない言葉だった。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_good_03_a', 'text', '「あなたのおかげでもある」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_good_03":true}',
          'game_bonus', '{"morale":6}'
        ),
        jsonb_build_object(
          'id', 'career_good_03_b', 'text', '「まだ終わっていない」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_good_03":true}',
          'game_bonus', '{"morale":4,"speed":1}'
        )
      )
    ),
    0, '{}', '{"career_good_03":true}'
  );

  -- ============================================================
  -- 【第3サイクル】不調シーン misaki 402: 「それでも立つ」
  -- 条件: win_rate < 0.4, career_poor_03=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    poor_03_id, ch_id, misaki_id, 402, 'dialogue', 'それでも立つ',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'clubhouse_archive_room', 'bgm', 'sad_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',   'text', '長い不調。今日、美咲の表情がいつもと違った。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'serious', 'text', '正直に言います。今のデータは、心配なレベルです。'),
        jsonb_build_object('speaker', 'player',                             'text', '……分かってます。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'serious', 'text', 'でも数字より気になるのは、顔です。一人で抱えすぎている。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'neutral', 'text', '全部自分で直そうとしなくていい。それがサポートスタッフがいる意味なので。'),
        jsonb_build_object('speaker', 'narration',   'text', '彼女は一瞬、肩に手を置いてから静かに離れた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_poor_03_a', 'text', '「頼らせてもらいます」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_poor_03":true}',
          'game_bonus', '{"morale":10}'
        ),
        jsonb_build_object(
          'id', 'career_poor_03_b', 'text', '「結果で示します。見ていてください」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_poor_03":true}',
          'game_bonus', '{"morale":7,"stamina":1}'
        )
      )
    ),
    0, '{}', '{"career_poor_03":true}'
  );

  -- ============================================================
  -- 【第3サイクル】普通シーン misaki 403: 「着実に」
  -- 条件: フォールバック, career_normal_03=false
  -- ============================================================
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    norm_03_id, ch_id, misaki_id, 403, 'dialogue', '着実に',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'training_ground', 'bgm', 'warm_theme',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',   'text', 'シーズン終盤。練習の強度が変わってきた。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'neutral', 'text', 'シーズン残りについて、どんな気持ちですか？'),
        jsonb_build_object('speaker', 'player',                             'text', '準備はできています。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'smile',   'text', 'いい答えですね。データだと、この時期あなたの身体的パフォーマンスが最もいい状態にある。'),
        jsonb_build_object('speaker', 'misaki-aoi',  'emotion', 'neutral', 'text', 'この安定感を維持するのって、実は絶好調より難しい。私はそれを尊敬しています。'),
        jsonb_build_object('speaker', 'narration',   'text', '彼女の分析は、いつも核心をつく。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'career_norm_03_a', 'text', '「強く終わります」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_normal_03":true}',
          'game_bonus', '{"morale":4,"shooting":1}'
        ),
        jsonb_build_object(
          'id', 'career_norm_03_b', 'text', '「このやり方を続けます」',
          'cost', 0, 'next_scene_id', null,
          'sets_flags', '{"career_normal_03":true}',
          'game_bonus', '{"morale":5,"defense":1}'
        )
      )
    ),
    0, '{}', '{"career_normal_03":true}'
  );

  RAISE NOTICE 'キャリアストーリー拡張 9シーン挿入完了';

END $$;

-- 確認クエリ
SELECT sc.display_name_ja, s.scene_order, s.title_ja
FROM   public.story_scenes s
JOIN   public.story_characters sc ON sc.id = s.character_id
JOIN   public.story_chapters   ch ON ch.id = s.chapter_id
WHERE  ch.part_number = 3 AND ch.chapter_number = 1
ORDER BY sc.display_name_ja, s.scene_order;
