-- ================================================
-- 黒崎凛ルート 完全版シーンデータ (15シーン)
-- 20260524_001_story_system_seed.sql 実行後に実行
-- ================================================

DO $$
DECLARE
  rin_id   uuid;
  ch1_id   uuid;

  s01_id   uuid := gen_random_uuid();
  r01a_id  uuid := gen_random_uuid();
  r01b_id  uuid := gen_random_uuid();
  s02_id   uuid := gen_random_uuid();
  s03_id   uuid := gen_random_uuid();
  s04_id   uuid := gen_random_uuid();
  s05_id   uuid := gen_random_uuid();
  s06_id   uuid := gen_random_uuid();
  s07_id   uuid := gen_random_uuid();
  s08_id   uuid := gen_random_uuid();
  s09_id   uuid := gen_random_uuid();
  s10w_id  uuid := gen_random_uuid();
  s10l_id  uuid := gen_random_uuid();
  s11_id   uuid := gen_random_uuid();
  s12_id   uuid := gen_random_uuid();

BEGIN
  -- キャラクター追加 (slug が既存なら更新)
  INSERT INTO public.story_characters (
    slug, display_name_ja, role, archetype,
    theme_color, character_image_url, bio_summary_ja,
    unlock_condition, is_hidden
  ) VALUES (
    'rin-kurosaki',
    '黒崎 凛',
    'secretary',
    'sakura',
    '#6B2C5F',
    '/images/characters/rin.png',
    'クラブ経営コンサルタント。冷静沈着な分析官。その冷たさの裏に、兄への深い愛情と、クラブへの複雑な思いを秘めている。',
    '{}',
    false
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ja     = EXCLUDED.display_name_ja,
    theme_color         = EXCLUDED.theme_color,
    character_image_url = EXCLUDED.character_image_url;

  SELECT id INTO rin_id FROM public.story_characters WHERE slug = 'rin-kurosaki';

  IF rin_id IS NULL THEN
    RAISE EXCEPTION '凛キャラクターの挿入に失敗しました';
  END IF;

  -- Part2 Chapter7 を作成
  INSERT INTO public.story_chapters (
    part_number, chapter_number, title_ja, subtitle_ja, description_ja, required_progress
  ) VALUES (
    2, 7,
    '凛ルート 第1章: 冷雨と設計図',
    '「感情論は不要です」',
    '経営コンサルタントとして現れた黒崎凛。冷徹な数字主義者に見えるが、その裏に隠された過去とは。',
    '{}'
  ) ON CONFLICT (part_number, chapter_number) DO NOTHING;

  SELECT id INTO ch1_id FROM public.story_chapters WHERE part_number = 2 AND chapter_number = 7;

  -- 既存データクリア
  DELETE FROM public.story_scenes WHERE character_id = rin_id;

  -- ────────────────────────────────────────────────────────────
  -- SCENE 01: 冷たい初対面
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s01_id, ch1_id, rin_id, 1, 'dialogue', '冷たい初対面',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'meeting_room_rain',
      'bgm', 'rin_theme_cold',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',     'text', '就任から1週間。会議室に呼ばれると、見たことのない女性が資料を広げていた。'),
        jsonb_build_object('speaker', 'narration',     'text', '金髪。黒いコート。こちらを見る目に、温度がない。'),
        jsonb_build_object('speaker', 'rin-kurosaki',  'emotion', 'neutral', 'text', '黒崎凛です。会長顧問として、経営改善を担当しています。'),
        jsonb_build_object('speaker', 'rin-kurosaki',  'emotion', 'neutral', 'text', '単刀直入に申し上げます。このクラブは3シーズン連続赤字。存続には抜本的な改革が必要です。'),
        jsonb_build_object('speaker', 'player',        'text', '……それは、わかっています。'),
        jsonb_build_object('speaker', 'rin-kurosaki',  'emotion', 'neutral', 'text', '本当に? では監督、今季の人件費比率と営業利益率を、今すぐ答えられますか。'),
        jsonb_build_object('speaker', 'narration',     'text', '答えられなかった。彼女はわかっていたように、資料をこちらに滑らせた。'),
        jsonb_build_object('speaker', 'rin-kurosaki',  'emotion', 'neutral', 'text', '勝利だけでは経営は救えません。私の仕事を、邪魔しないでください。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r01_a', 'text', '「わかりました」と引き下がった。',            'next_scene_id', r01a_id::text, 'cost', 0, 'sets_flags', '{"rin_met":true}'),
        jsonb_build_object('id', 'r01_b', 'text', '「邪魔、とは聞き捨てならない」と言い返した。', 'next_scene_id', r01b_id::text, 'cost', 0, 'sets_flags', '{"rin_met":true,"rin_conflict_start":true}')
      )
    ),
    0, '{}', '{"rin_met":true}'
  );

  -- ────────────────────────────────────────────────────────────
  -- REACTION 01A: 引き下がる
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r01a_id, ch1_id, rin_id, 2, 'dialogue', 'R:引き下がる',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'meeting_room_rain',
      'bgm', 'rin_theme_cold',
      'next_scene_id', s02_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '彼女は一瞬だけ眉を上げた。予想外だったらしい。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……賢明です。では、よろしくお願いします。'),
        jsonb_build_object('speaker', 'narration',    'text', '立ち去り際、彼女の足音は一切鳴らなかった。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ────────────────────────────────────────────────────────────
  -- REACTION 01B: 言い返す
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    r01b_id, ch1_id, rin_id, 3, 'dialogue', 'R:言い返す',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'meeting_room_rain',
      'bgm', 'rin_theme_cold',
      'next_scene_id', s02_id::text,
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '静寂が落ちた。彼女はゆっくりとこちらを向いた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'surprised', 'text', '……ほう。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', '感情的な監督ほど、使いやすいものはない。そう思っていましたが。'),
        jsonb_build_object('speaker', 'narration',    'text', '微かに、唇の端が上がった気がした。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{}', '{}'
  );

  -- ────────────────────────────────────────────────────────────
  -- SCENE 02〜12
  -- ────────────────────────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES
  -- SCENE 02: 数字の戦争
  (s02_id, ch1_id, rin_id, 4, 'dialogue', '数字の戦争',
    jsonb_build_object('type', 'dialogue', 'background', 'clubhouse_corridor', 'bgm', 'rin_theme_cold',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '廊下で鉢合わせた。彼女は選手のトレーニングデータを見ながら歩いていた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '監督。第4FWの稼働率が低い。スタメン変更を検討してください。'),
        jsonb_build_object('speaker', 'player',       'text', 'それは戦術的な判断です。コンサルタントの仕事ではない。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '人件費対効果の観点から申し上げています。感情論は不要です。'),
        jsonb_build_object('speaker', 'player',       'text', '選手は数字じゃない。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……では、数字以外で何で評価しますか。'),
        jsonb_build_object('speaker', 'narration',    'text', '答えに詰まった。彼女はそれを待たずに歩き去った。'),
        jsonb_build_object('speaker', 'narration',    'text', 'だが、曲がり角の手前で一度だけ、こちらを振り返った気がした。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r02_a', 'text', '「目に見えないものがある」と追いかけた。', 'next_scene_id', s03_id::text, 'cost', 0, 'sets_flags', '{"rin_clash_01":true,"rin_noticed":true}'),
        jsonb_build_object('id', 'r02_b', 'text', 'その場に立ち尽くした。',                   'next_scene_id', s03_id::text, 'cost', 0, 'sets_flags', '{"rin_clash_01":true}')
      )
    ), 0, '{"rin_met":true}', '{"rin_clash_01":true}'
  ),
  -- SCENE 03: 初めて見せた隙
  (s03_id, ch1_id, rin_id, 5, 'dialogue', '初めて見せた隙',
    jsonb_build_object('type', 'dialogue', 'background', 'stadium_corridor_evening', 'bgm', 'rin_theme_warm',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '試合前、スタジアムの外通路を歩いていると、凛が一人でピッチを見ていた。'),
        jsonb_build_object('speaker', 'narration',    'text', 'いつもの鉄仮面が、わずかに緩んでいた。'),
        jsonb_build_object('speaker', 'player',       'text', '試合、見るんですか。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'surprised', 'text', '……っ。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', 'データ収集です。観戦とは違います。'),
        jsonb_build_object('speaker', 'player',       'text', 'そのわりに、表情が違いますよ。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', '……気のせいです。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女はすぐに踵を返した。だが、その一瞬だけ、ピッチを見る目が——柔らかかった。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r03_a', 'text', '「サッカー、好きなんですね」と言った。', 'next_scene_id', s04_id::text, 'cost', 0, 'sets_flags', '{"rin_weakness_hinted":true,"rin_annoyed":true}'),
        jsonb_build_object('id', 'r03_b', 'text', '何も言わず、隣に立った。',               'next_scene_id', s04_id::text, 'cost', 0, 'sets_flags', '{"rin_weakness_hinted":true,"rin_curious":true}')
      )
    ), 0, '{"rin_clash_01":true}', '{"rin_weakness_hinted":true}'
  ),
  -- SCENE 04: 兄の話
  (s04_id, ch1_id, rin_id, 6, 'dialogue', '兄の話',
    jsonb_build_object('type', 'dialogue', 'background', 'clubhouse_archive_room', 'bgm', 'rin_theme_sad',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '深夜の資料室。古い選手名簿を整理していると、凛が入ってきた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……残業ですか。奇遇ですね。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は棚の一冊を迷わず取り出した。10年前の選手名簿。'),
        jsonb_build_object('speaker', 'player',       'text', 'それ、知ってる選手でも?'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……黒崎 誠。私の兄です。'),
        jsonb_build_object('speaker', 'narration',    'text', '予想外の言葉だった。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'sad',     'text', 'このクラブにいました。DFとして。……経営難による強制的な人件費削減で、契約を切られるまでは。'),
        jsonb_build_object('speaker', 'player',       'text', 'それが、あなたがここに来た理由ですか。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……さあ。私にも、わかりません。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は名簿を静かに棚に戻した。その手が、少しだけ震えていた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r04_a', 'text', '「お兄さんの分まで、このクラブを守りましょう」と言った。', 'next_scene_id', s05_id::text, 'cost', 0,    'sets_flags', '{"rin_past_revealed":true}'),
        jsonb_build_object('id', 'r04_b', 'text', '何も言わず、隣に座った。',                               'next_scene_id', s05_id::text, 'cost', 8000, 'locked_message', '特別な選択肢 (8,000G)', 'sets_flags', '{"rin_past_revealed":true,"rin_close":true}')
      )
    ), 0, '{"rin_weakness_hinted":true}', '{"rin_past_revealed":true}'
  ),
  -- SCENE 05: 攻撃が強くなる理由
  (s05_id, ch1_id, rin_id, 7, 'dialogue', '攻撃が強くなる理由',
    jsonb_build_object('type', 'dialogue', 'background', 'directors_office', 'bgm', 'rin_theme_cold',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '翌週、凛の態度が変わった。もっと冷たくなった。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '監督。ユースの育成コストが予算を超過しています。即時見直しを。'),
        jsonb_build_object('speaker', 'player',       'text', '先日の話の後で、なぜそんな——'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '先日の話は業務に関係ありません。'),
        jsonb_build_object('speaker', 'player',       'text', 'あなたは、何か怖いんですか。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'angry',   'text', '……っ、失礼な。'),
        jsonb_build_object('speaker', 'narration',    'text', '初めて、彼女の声に感情が乗った。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……失礼しました。業務の話に戻りましょう。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は完璧に表情を消した。だが、その数秒間——確かに、動揺していた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r05_a', 'text', '「謝らなくていい。本音が聞きたい」と言った。',      'next_scene_id', s06_id::text, 'cost', 0, 'sets_flags', '{"rin_walls_up":true,"rin_pushed":true}'),
        jsonb_build_object('id', 'r05_b', 'text', '「わかりました、数字の話をしましょう」と引いた。', 'next_scene_id', s06_id::text, 'cost', 0, 'sets_flags', '{"rin_walls_up":true}')
      )
    ), 0, '{"rin_past_revealed":true}', '{"rin_walls_up":true}'
  ),
  -- SCENE 06: 土砂降りの駐車場
  (s06_id, ch1_id, rin_id, 8, 'dialogue', '土砂降りの駐車場',
    jsonb_build_object('type', 'dialogue', 'background', 'stadium_parking_rain', 'bgm', 'rin_theme_sad',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '大雨の駐車場。傘を忘れて走ろうとすると、凛が一人で立っていた。'),
        jsonb_build_object('speaker', 'narration',    'text', '傘はある。でも開かない。ただ雨に打たれていた。'),
        jsonb_build_object('speaker', 'player',       'text', '傘、壊れてますか。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', '……いいえ。'),
        jsonb_build_object('speaker', 'player',       'text', 'じゃあ、なぜ。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'sad',       'text', '……兄が、よく言っていたんです。雨の試合が一番好きだって。'),
        jsonb_build_object('speaker', 'narration',    'text', '雨音だけが続いた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'sad',       'text', '負けた試合の後、いつもこうして雨に打たれていたらしくて。……馬鹿みたいでしょう。'),
        jsonb_build_object('speaker', 'player',       'text', '馬鹿じゃない。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'surprised', 'text', '……っ。'),
        jsonb_build_object('speaker', 'narration',    'text', '傘を差し出した。彼女はしばらく見つめていた。それから、静かに受け取った。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r06_a', 'text', '「一緒に入りましょう」と傘を差し出した。',                 'next_scene_id', s07_id::text, 'cost', 0,    'sets_flags', '{"rin_breaking_point":true,"rin_close":true}'),
        jsonb_build_object('id', 'r06_b', 'text', '「お兄さんに、ちゃんと会いに行ってあげてください」と言った。', 'next_scene_id', s07_id::text, 'cost', 5000, 'locked_message', '特別な選択肢 (5,000G)', 'sets_flags', '{"rin_breaking_point":true,"rin_close":true,"rin_brother_mentioned":true}')
      )
    ), 0, '{"rin_walls_up":true}', '{"rin_breaking_point":true}'
  ),
  -- SCENE 07: 売却計画の暴露
  (s07_id, ch1_id, rin_id, 9, 'dialogue', '売却計画の暴露',
    jsonb_build_object('type', 'dialogue', 'background', 'meeting_room_day', 'bgm', 'rin_theme_tense',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', 'クラブ売却の話が、スタッフの間で囁かれ始めた。'),
        jsonb_build_object('speaker', 'player',       'text', '凛さん、売却計画を主導していると聞きました。本当ですか。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……はい。会長からの依頼です。'),
        jsonb_build_object('speaker', 'player',       'text', 'あなたが。兄さんを追い出したクラブを、他人に売る。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……感情論です。'),
        jsonb_build_object('speaker', 'player',       'text', '違う。あなたの本心じゃない。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'angry',   'text', '……私の本心を、あなたに決めつける権利はありません。'),
        jsonb_build_object('speaker', 'narration',    'text', '声が、わずかに震えていた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……失礼します。'),
        jsonb_build_object('speaker', 'narration',    'text', 'ドアが閉まった。廊下に、彼女の足音が消えていく。今度は鳴っていた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r07_a', 'text', '「待ってください」と廊下に出た。', 'next_scene_id', s08_id::text, 'cost', 0, 'sets_flags', '{"rin_betrayal_revealed":true,"rin_chased":true}'),
        jsonb_build_object('id', 'r07_b', 'text', 'その場で、信じることにした。',     'next_scene_id', s08_id::text, 'cost', 0, 'sets_flags', '{"rin_betrayal_revealed":true}')
      )
    ), 0, '{"rin_breaking_point":true}', '{"rin_betrayal_revealed":true}'
  ),
  -- SCENE 08: 夜の告白
  (s08_id, ch1_id, rin_id, 10, 'dialogue', '夜の告白',
    jsonb_build_object('type', 'dialogue', 'background', 'stadium_rooftop_night_stars', 'bgm', 'rin_theme_emotional',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '屋上に凛がいた。星を見ていた。珍しく、コートを脱いでいた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……追ってきたんですか。'),
        jsonb_build_object('speaker', 'player',       'text', '売却を止めるために何が必要か、教えてほしい。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '業績です。シンプルな話です。'),
        jsonb_build_object('speaker', 'player',       'text', '本当にそれだけですか。'),
        jsonb_build_object('speaker', 'narration',    'text', '長い沈黙。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'sad',     'text', '……兄は、ここで最後の試合をしました。引退試合もなく、ただ契約終了の通知だけが届いて。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'sad',     'text', '私が優秀なコンサルタントになれば、こんなことは防げると思っていた。でも、私がここに来たのは——'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は星を見たまま、続けた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'crying',  'text', 'このクラブを、もう一度ちゃんとしたクラブにしたかったから。兄が愛したクラブを。'),
        jsonb_build_object('speaker', 'narration',    'text', '初めて見た。黒崎凛が、泣いているところを。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r08_a', 'text', '「一緒に、そのクラブにしましょう」と言った。', 'next_scene_id', s09_id::text, 'cost', 0, 'sets_flags', '{"rin_confession":true}'),
        jsonb_build_object('id', 'r08_b', 'text', '何も言わず、隣に立った。',                     'next_scene_id', s09_id::text, 'cost', 0, 'sets_flags', '{"rin_confession":true,"rin_close":true}')
      )
    ), 0, '{"rin_betrayal_revealed":true}', '{"rin_confession":true}'
  ),
  -- SCENE 09: 共闘宣言
  (s09_id, ch1_id, rin_id, 11, 'dialogue', '共闘宣言',
    jsonb_build_object('type', 'dialogue', 'background', 'directors_office_morning', 'bgm', 'rin_theme_warm',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '翌朝。凛が監督室に来た。今度は資料なしで。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', '昨夜のことは、忘れてください。'),
        jsonb_build_object('speaker', 'player',       'text', '忘れません。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'surprised', 'text', '……っ。'),
        jsonb_build_object('speaker', 'player',       'text', '一緒に戦いましょう。売却を止める実績を、今季中に作る。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', '……条件があります。'),
        jsonb_build_object('speaker', 'player',       'text', '聞きます。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', '私の分析を、戦術に反映させること。選手個人の感情論より数字を優先する場面では、私の意見を尊重すること。'),
        jsonb_build_object('speaker', 'player',       'text', 'わかった。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',   'text', '……では。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は右手を差し出した。握手。それだけ。でも、その手は温かかった。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id', 'r09_a', 'text', '握手した。', 'cost', 0,
          'sets_flags', '{"rin_alliance":true}',
          'branch_by_match', true,
          'next_scene_id',      s10w_id::text,
          'next_scene_id_win',  s10w_id::text,
          'next_scene_id_lose', s10l_id::text
        )
      )
    ), 0, '{"rin_confession":true}', '{"rin_alliance":true}'
  ),
  -- SCENE 10W: 最終節 勝利
  (s10w_id, ch1_id, rin_id, 12, 'dialogue', '最終節 勝利',
    jsonb_build_object('type', 'dialogue', 'background', 'pitch_sunset_celebration', 'bgm', 'rin_theme_climax', 'match_condition', 'win',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '終了のホイッスル。スタンドが沸いた。'),
        jsonb_build_object('speaker', 'narration',    'text', '凛はピッチサイドで、スコアボードを見ていた。微動だにしない。'),
        jsonb_build_object('speaker', 'player',       'text', '凛さん。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral', 'text', '……目標達成です。売却は撤回させます。'),
        jsonb_build_object('speaker', 'player',       'text', 'それだけですか。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は長い間、黙っていた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'happy',   'text', '……兄に、報告してきます。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は振り返らずに歩き出した。でも、その背中が——震えていた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r10w_a', 'text', '「お疲れ様でした」と、その背中に声をかけた。', 'next_scene_id', s11_id::text, 'cost', 0, 'sets_flags', '{"rin_route_win":true}')
      )
    ), 0, '{"rin_alliance":true}', '{"rin_route_win":true}'
  ),
  -- SCENE 10L: 最終節 敗戦
  (s10l_id, ch1_id, rin_id, 13, 'dialogue', '最終節 敗戦',
    jsonb_build_object('type', 'dialogue', 'background', 'clubhouse_corridor_night_rain', 'bgm', 'rin_theme_sad', 'match_condition', 'lose',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '敗戦。降格が決まった。廊下で凛が待っていた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',    'text', '……売却を止める根拠が、なくなりました。'),
        jsonb_build_object('speaker', 'player',       'text', '凛さん。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',    'text', 'でも——'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は静かに、続けた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'determined', 'text', '来季の昇格計画を、私が作ります。数字で、このクラブを守ってみせます。'),
        jsonb_build_object('speaker', 'player',       'text', '一緒に作りましょう。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',    'text', '……はい。'),
        jsonb_build_object('speaker', 'narration',    'text', '初めて、彼女から「はい」が来た。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r10l_a', 'text', '「来季、もう一度」と手を差し出した。', 'next_scene_id', s11_id::text, 'cost', 0, 'sets_flags', '{"rin_route_lose":true}')
      )
    ), 0, '{"rin_alliance":true}', '{"rin_route_lose":true}'
  ),
  -- SCENE 11: ノーガード
  (s11_id, ch1_id, rin_id, 14, 'dialogue', 'ノーガード',
    jsonb_build_object('type', 'dialogue', 'background', 'clubhouse_rooftop_sunset', 'bgm', 'rin_theme_warm',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', 'シーズンが終わり、クラブに静けさが戻った。屋上で凛が夕日を見ていた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',     'text', '……またここですか。'),
        jsonb_build_object('speaker', 'player',       'text', '凛さんがいたから。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'embarrassed', 'text', '……っ、そういうことを言わないでください。'),
        jsonb_build_object('speaker', 'player',       'text', '本当のことですよ。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'embarrassed', 'text', '……監督は、本当に——'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は夕日に目を向けたまま、続けた。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',     'text', '……私の分析が、役に立っていると思いますか。'),
        jsonb_build_object('speaker', 'player',       'text', 'あなたがいないと困ります。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'embarrassed', 'text', '……そう。'),
        jsonb_build_object('speaker', 'narration',    'text', 'ほんの少し、耳が赤かった。彼女は気づいていないふりをしていた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object('id', 'r11_a', 'text', '「来季も、よろしく」と言った。', 'next_scene_id', s12_id::text, 'cost', 0, 'sets_flags', '{"rin_unguarded":true}')
      )
    ), 0, '{}', '{"rin_unguarded":true}'
  ),
  -- SCENE 12: エンディング — 二人の設計図
  (s12_id, ch1_id, rin_id, 15, 'dialogue', 'エンディング — 二人の設計図',
    jsonb_build_object(
      'type', 'dialogue', 'background', 'directors_office_winter_morning', 'bgm', 'rin_theme_ending',
      'is_ending', true,
      'ending_text', '黒崎凛ルート クリア' || chr(10) || '「冷雨のスタジアム、冬晴れの設計図」' || chr(10) || chr(10) || '彼女はまだ「好き」とは言わない。でも、隣にいる。',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker', 'narration',    'text', '新シーズンに向けた準備が始まった朝。監督室の机に、分厚い資料が置かれていた。'),
        jsonb_build_object('speaker', 'narration',    'text', '来季の経営計画書。手書きのメモが余白を埋め尽くしている。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',     'text', '……見てください。今季の反省点と来季の戦力プランです。'),
        jsonb_build_object('speaker', 'player',       'text', '一緒に作ったんですか。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',     'text', '私が作りました。ただ、監督の戦術思想を、数字に落とし込んだだけです。'),
        jsonb_build_object('speaker', 'narration',    'text', '資料の端に、小さな付箋があった。「兄が好きだった4-3-3について」と書いてある。'),
        jsonb_build_object('speaker', 'player',       'text', '凛さん。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'neutral',     'text', '……なんですか。'),
        jsonb_build_object('speaker', 'player',       'text', 'ありがとう。'),
        jsonb_build_object('speaker', 'rin-kurosaki', 'emotion', 'embarrassed', 'text', '……どういたしまして。'),
        jsonb_build_object('speaker', 'narration',    'text', '彼女は窓の外を向いた。冬の朝日が差し込んでくる。その横顔は、初めて会った日とは、少し違った。')
      ),
      'choices', jsonb_build_array()
    ), 0, '{"rin_unguarded":true}', '{"rin_route_cleared":true}'
  );

  RAISE NOTICE '黒崎凛ルート 15シーン挿入完了';

END $$;

-- 確認クエリ
SELECT scene_order, title_ja, scene_type
FROM public.story_scenes
WHERE character_id = (SELECT id FROM story_characters WHERE slug = 'rin-kurosaki')
ORDER BY scene_order;
