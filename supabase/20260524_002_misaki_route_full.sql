-- ================================================
-- 葵美咲ルート 完全版シーンデータ (12シーン)
-- 20260524_001_story_system.sql と
-- 20260524_001_story_system_seed.sql 実行後に実行
-- ================================================

DO $$
DECLARE
  misaki_id uuid;
  ch1_id    uuid;

  -- 12シーン分のUUID (事前宣言で相互参照可能)
  s01_id  uuid := gen_random_uuid();
  s02_id  uuid := gen_random_uuid();
  s03w_id uuid := gen_random_uuid();
  s03l_id uuid := gen_random_uuid();
  s04_id  uuid := gen_random_uuid();
  s05_id  uuid := gen_random_uuid();
  s06_id  uuid := gen_random_uuid();
  s07_id  uuid := gen_random_uuid();
  s08w_id uuid := gen_random_uuid();
  s08l_id uuid := gen_random_uuid();
  s09_id  uuid := gen_random_uuid();
  s10_id  uuid := gen_random_uuid();

BEGIN
  SELECT id INTO misaki_id FROM public.story_characters WHERE slug = 'misaki-aoi';
  SELECT id INTO ch1_id    FROM public.story_chapters   WHERE chapter_number = 1 AND part_number = 1;

  IF misaki_id IS NULL THEN
    RAISE NOTICE 'misaki-aoi not found. Run story_system_seed.sql first.';
    RETURN;
  END IF;
  IF ch1_id IS NULL THEN
    RAISE NOTICE 'chapter (part=1, chapter=1) not found.';
    RETURN;
  END IF;

  -- 既存データクリア (再実行対応)
  -- chapter_id 全体を削除: 別キャラのシーンが同chapter内に残っている場合も対応
  DELETE FROM public.story_scenes WHERE chapter_id = ch1_id;

  -- ────────────────────────────────────────
  -- SCENE 01: はじめての出会い
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s01_id, ch1_id, misaki_id, 1, 'dialogue',
    'はじめての出会い',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_entrance_day',
      'bgm', 'misaki_theme_light',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','クラブハウスに着いた初日。段ボール箱を抱えて廊下を歩いていると、角を曲がった瞬間、誰かにぶつかった。'),
        jsonb_build_object('speaker','misaki','emotion','surprised','text','わっ——！'),
        jsonb_build_object('speaker','narration','text','書類が宙を舞う。慌てて拾おうとした先に、同じように手を伸ばしている女性がいた。'),
        jsonb_build_object('speaker','misaki','emotion','embarrassed','text','す、すみません！ 私、前見てなくて……あれ。もしかして新しい監督さん、ですか?'),
        jsonb_build_object('speaker','player','text','そうです。今日からお世話になります。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','本当に来てくれたんですね。……よかった。このクラブに、また誰かが来てくれた。'),
        jsonb_build_object('speaker','narration','text','彼女は書類を丁寧に重ね直しながら、少し照れたように笑った。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','葵 美咲といいます。広報担当です。クラブのこと、何でも聞いてください。……本当に、何でも。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s01_a','text','よろしくお願いします、葵さん。',
          'next_scene_id', s02_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_met":true}'
        ),
        jsonb_build_object(
          'id','s01_b','text','「何でも」って、どんなことでも?',
          'next_scene_id', s02_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_met":true,"misaki_curious":true}'
        )
      )
    ),
    0, '{}', '{"misaki_met":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 02: スタジアムの秘密
  -- branch_by_match で S03W(WIN) / S03L(LOSE) に分岐
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s02_id, ch1_id, misaki_id, 2, 'dialogue',
    'スタジアムの秘密',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'stadium_stands_morning',
      'bgm', 'misaki_theme_light',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','試合前の静かなスタジアム。ピッチを見下ろす観客席に、美咲が一人でいた。'),
        jsonb_build_object('speaker','player','text','こんな朝早くから?'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','毎試合の前にここに来るんです。なんとなく、習慣で。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','昔、父がよく連れてきてくれた場所なので。'),
        jsonb_build_object('speaker','narration','text','彼女の視線はピッチの中央を見つめている。何かを探しているような、懐かしんでいるような目だった。'),
        jsonb_build_object('speaker','player','text','お父さんも、サッカー関係の方?'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','……昔、ここで監督をしていました。もうずっと前の話ですけど。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','さ、試合の準備しなきゃですね。監督さん、今日よろしくお願いします!')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s02_a',
          'text','気にしておこう。(心の中で)',
          'next_scene_id', null,
          'next_scene_id_win',  s03w_id::text,
          'next_scene_id_lose', s03l_id::text,
          'branch_by_match', true,
          'cost', 0,
          'sets_flags', '{"misaki_father_hinted":true}'
        )
      )
    ),
    0, '{"misaki_met":true}', '{"misaki_father_hinted":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 03W: 初勝利の夜 (WIN版)
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s03w_id, ch1_id, misaki_id, 3, 'dialogue',
    '初勝利の夜',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_corridor_night',
      'bgm', 'misaki_theme_warm',
      'match_condition', 'win',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','試合終了のホイッスル。スタジアムに歓声が響いた。廊下に戻ると、美咲が待っていた。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','勝ちましたね……! 本当に、勝ちましたね!'),
        jsonb_build_object('speaker','narration','text','彼女の目が少し赤い。泣いていたのかもしれない。'),
        jsonb_build_object('speaker','misaki','emotion','embarrassed','text','あ、ごめんなさい。広報がこんな顔しちゃダメですよね。でも……嬉しくて。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','最後にここで勝ったのって、もう何シーズン前だろう。父が監督だった頃かな。'),
        jsonb_build_object('speaker','player','text','お父さんに教えてあげたいですね。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','……今日のこと、病院に行って話してきます。ちゃんと聞こえてるかわからないけど。'),
        jsonb_build_object('speaker','narration','text','彼女は小さく頭を下げて、夜の廊下に消えていった。父親が病床にある——そのことを、こんな形で知ることになるとは思っていなかった。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s03w_a','text','彼女のことが、少し心配になった。',
          'next_scene_id', s04_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_opened_up":true}'
        ),
        jsonb_build_object(
          'id','s03w_b','text','「また一緒に勝ちましょう」と声をかける。',
          'next_scene_id', s04_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_opened_up":true,"misaki_close":true}'
        )
      )
    ),
    0, '{"misaki_father_hinted":true}', '{"misaki_opened_up":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 03L: 敗戦の夜 (LOSE版)
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s03l_id, ch1_id, misaki_id, 4, 'dialogue',
    '敗戦の夜',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'stadium_exit_night_rain',
      'bgm', 'misaki_theme_sad',
      'match_condition', 'lose',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','雨が降り始めた夜。スタジアムを出ると、美咲が傘も差さずに立っていた。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','……監督さん。お疲れ様でした。'),
        jsonb_build_object('speaker','player','text','傘、持っていなかったんですか?'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','あ。忘れてました。……負けた日って、なぜか雨が多いんですよね、このスタジアム。'),
        jsonb_build_object('speaker','misaki','emotion','determined','text','でも大丈夫です。父も、最初のシーズンは全然勝てなかったって言ってました。それでも最後には——'),
        jsonb_build_object('speaker','narration','text','彼女は言葉を切った。雨が少し強くなる。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','……ごめんなさい。今日のこと、うまく言葉にできなくて。'),
        jsonb_build_object('speaker','player','text','傘、一緒に入りますか。'),
        jsonb_build_object('speaker','misaki','emotion','surprised','text','……はい。ありがとうございます。'),
        jsonb_build_object('speaker','narration','text','雨の中、二人並んで歩いた。彼女は何も言わなかったが、それでよかった気がした。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s03l_a','text','次は勝とう、と心に決めた。',
          'next_scene_id', s04_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_opened_up":true,"misaki_close":true}'
        )
      )
    ),
    0, '{"misaki_father_hinted":true}', '{"misaki_opened_up":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 04: 父の戦術ノート
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s04_id, ch1_id, misaki_id, 5, 'dialogue',
    '父の戦術ノート',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_archive_room',
      'bgm', 'misaki_theme_mysterious',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','古い資料室の整理を手伝っていると、美咲が埃のかかったノートを取り出した。'),
        jsonb_build_object('speaker','misaki','emotion','surprised','text','あ……これ。'),
        jsonb_build_object('speaker','player','text','何ですか、それ?'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','父の、戦術ノートです。このクラブにいた頃の。……最後まで書き終えられなかったやつ。'),
        jsonb_build_object('speaker','narration','text','ノートを開くと、丁寧な字でフォーメーション図や走路のメモが並んでいた。途中のページから、ペンの跡が急に乱れている。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','ここで倒れたんです、父が。試合中に。……だから、最後のページは白紙のまま。'),
        jsonb_build_object('speaker','player','text','続きを書くのは、私かもしれない。'),
        jsonb_build_object('speaker','misaki','emotion','surprised','text','……え。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','そう、ですね。……そうかもしれない。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s04_a','text','ノートを借りてもいいですか。',
          'next_scene_id', s05_id::text,
          'cost', 0,
          'sets_flags', '{"notebook_discovered":true,"notebook_borrowed":true}'
        ),
        jsonb_build_object(
          'id','s04_b','text','そのノートを、いつか完成させましょう。',
          'next_scene_id', s05_id::text,
          'cost', 5000,
          'sets_flags', '{"notebook_discovered":true,"notebook_borrowed":true,"misaki_close":true}',
          'locked_message', '特別な選択肢 (5,000G)'
        )
      )
    ),
    0, '{"misaki_opened_up":true}', '{"notebook_discovered":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 05: 練習場の夕暮れ
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s05_id, ch1_id, misaki_id, 6, 'dialogue',
    '練習場の夕暮れ',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'training_ground_sunset',
      'bgm', 'misaki_theme_warm',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','練習が終わった河川敷。選手たちが引き上げた後、美咲がフィールドの端に座っていた。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','監督さん、今日の練習、選手たちの顔が違いましたね。'),
        jsonb_build_object('speaker','player','text','そう見えましたか。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','はい。なんか……信じてもらってる感じ、するんですよね、監督さんのことを。'),
        jsonb_build_object('speaker','misaki','emotion','embarrassed','text','あ、私も、です。なんか最近、話しやすくなったな、って。'),
        jsonb_build_object('speaker','narration','text','夕日が川面に反射して、オレンジ色が広がっている。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','父にも、こんな風に話せていたら良かったな。……私、忙しそうにしてる父に、遠慮してて。'),
        jsonb_build_object('speaker','player','text','今からでも、話せますよ。'),
        jsonb_build_object('speaker','misaki','emotion','surprised','text','……うん。そうですね。'),
        jsonb_build_object('speaker','narration','text','彼女は草の上に膝を抱えて、川をしばらく眺めていた。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s05_a','text','隣に座って、一緒に川を見た。',
          'next_scene_id', s06_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_trusts_player":true}'
        )
      )
    ),
    0, '{"notebook_discovered":true}', '{"misaki_trusts_player":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 06: 病院の帰り道 ★核心シーン
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s06_id, ch1_id, misaki_id, 7, 'dialogue',
    '病院の帰り道',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'hospital_road_evening',
      'bgm', 'misaki_theme_sad',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','偶然、病院の前で美咲に会った。今日、父の見舞いに来ていたらしい。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','監督さん……こんなところで。'),
        jsonb_build_object('speaker','player','text','お父さん、どうでしたか。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','変わらないです。意識はあるんですけど……話すのが辛そうで。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','今日ね、勝ち試合のこと話したんです。そしたら父、少し口の端が上がって。……笑ったのかな、って。'),
        jsonb_build_object('speaker','narration','text','彼女の声が少し震えた。'),
        jsonb_build_object('speaker','misaki','emotion','crying','text','私、ずっと思ってたんです。あのクラブが降格した時、父が引退した時、私が何かできたんじゃないかって。もっと側にいればって。'),
        jsonb_build_object('speaker','player','text','美咲さん。あなたは今、できることをしてる。'),
        jsonb_build_object('speaker','misaki','emotion','surprised','text','……監督さん。'),
        jsonb_build_object('speaker','player','text','毎試合、スタジアムに立って、クラブを守っている。それがお父さんへの答えだと思う。'),
        jsonb_build_object('speaker','narration','text','しばらく沈黙が続いた。曇り空から、細い光が漏れていた。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','……ありがとうございます。なんか、少し楽になった気がします。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s06_a','text','「また来ます」と言って、その場を後にした。',
          'next_scene_id', s07_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_father_story":true}'
        ),
        jsonb_build_object(
          'id','s06_b','text','「今度、一緒に来てもいいですか」と聞いた。',
          'next_scene_id', s07_id::text,
          'cost', 8000,
          'sets_flags', '{"misaki_father_story":true,"misaki_hospital_invite":true}',
          'locked_message', '特別な選択肢 (8,000G)'
        )
      )
    ),
    0, '{"misaki_trusts_player":true}', '{"misaki_father_story":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 07: 決戦前夜
  -- branch_by_match で S08W(WIN) / S08L(LOSE) に分岐
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s07_id, ch1_id, misaki_id, 8, 'dialogue',
    '決戦前夜',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'stadium_rooftop_night_stars',
      'bgm', 'misaki_theme_emotional',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','最終節の前夜。眠れなくてスタジアムの屋上に来ると、美咲がいた。'),
        jsonb_build_object('speaker','misaki','emotion','surprised','text','あ……監督さんも、眠れないですか。'),
        jsonb_build_object('speaker','player','text','美咲さんこそ。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','明日のこと、考えてたら。……このクラブで、こんなに緊張した前夜は久しぶりです。'),
        jsonb_build_object('speaker','misaki','emotion','determined','text','勝ちたいです。父に、続きを見せたい。'),
        jsonb_build_object('speaker','narration','text','星空の下、二人で並んでピッチを見下ろした。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','監督さんが来てくれて、よかった。このクラブに、また光が来た気がします。'),
        jsonb_build_object('speaker','player','text','明日、一緒に戦いましょう。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','……はい。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s07_a',
          'text','そのまま、しばらく並んで立っていた。',
          'next_scene_id', null,
          'next_scene_id_win',  s08w_id::text,
          'next_scene_id_lose', s08l_id::text,
          'branch_by_match', true,
          'cost', 0,
          'sets_flags', '{"misaki_final_eve":true}'
        )
      )
    ),
    0, '{"misaki_father_story":true}', '{"misaki_final_eve":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 08W: 残留達成 (WIN版)
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s08w_id, ch1_id, misaki_id, 9, 'dialogue',
    '残留達成',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'pitch_sunset_celebration',
      'bgm', 'misaki_theme_climax',
      'match_condition', 'win',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','最終節、終了のホイッスル。残留決定。選手たちが抱き合い、スタンドから歓声が降り注ぐ。'),
        jsonb_build_object('speaker','narration','text','気づくと美咲がピッチの端に立っていた。手で口元を押さえて、肩が震えている。'),
        jsonb_build_object('speaker','misaki','emotion','crying','text','……やった。やりましたね、監督さん。'),
        jsonb_build_object('speaker','player','text','葵さん。泣いてる。'),
        jsonb_build_object('speaker','misaki','emotion','crying','text','泣いてないです。……泣いてます。ごめんなさい。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','父に電話します。試合中もずっとスマホ握ってて。……報告したくて。'),
        jsonb_build_object('speaker','narration','text','彼女はポケットからスマホを取り出し、震える手で発信した。少しして、繋がったのかもしれない。彼女がそっと微笑んだ。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','お父さん。勝ったよ。……うん。監督さんが、来てくれたから。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s08w_a','text','その場を離れ、二人の時間を作った。',
          'next_scene_id', s09_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_survived_win":true}'
        )
      )
    ),
    0, '{"misaki_final_eve":true}', '{"misaki_survived_win":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 08L: 降格の夜 (LOSE版)
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s08l_id, ch1_id, misaki_id, 10, 'dialogue',
    '降格の夜',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_corridor_night_rain',
      'bgm', 'misaki_theme_sad',
      'match_condition', 'lose',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','終了のホイッスルが、重く響いた。降格が決まった瞬間だった。'),
        jsonb_build_object('speaker','narration','text','廊下で美咲が壁に背をもたせかけていた。泣いていない。ただ、天井を見上げていた。'),
        jsonb_build_object('speaker','misaki','emotion','sad','text','……また、か。'),
        jsonb_build_object('speaker','player','text','美咲さん。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','大丈夫です。……父が降格した時も、こうだったから。慣れてます。'),
        jsonb_build_object('speaker','misaki','emotion','determined','text','でも、来季も残ってくれますよね。監督さん。'),
        jsonb_build_object('speaker','player','text','もちろん。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','……よかった。じゃあ、一緒に上がりましょう。今度こそ。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s08l_a','text','「必ず昇格しましょう」と約束した。',
          'next_scene_id', s09_id::text,
          'cost', 0,
          'sets_flags', '{"misaki_survived_lose":true,"next_season_promised":true}'
        )
      )
    ),
    0, '{"misaki_final_eve":true}', '{"misaki_survived_lose":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 09: ノートの最後のページ
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s09_id, ch1_id, misaki_id, 11, 'dialogue',
    'ノートの最後のページ',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'clubhouse_archive_room_sunny',
      'bgm', 'misaki_theme_peaceful',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','シーズンが終わり、資料室の整理をしていると、美咲がノートを持ってきた。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','監督さん、これ。父に見せたら……書いてほしいって。'),
        jsonb_build_object('speaker','narration','text','白紙だった最後のページ。そこに父親の弱々しい字で一行だけ書いてあった。「続きは、次の監督へ」'),
        jsonb_build_object('speaker','player','text','……。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','書いてくれますか。今季やってみた戦術、選手のこと、なんでも。'),
        jsonb_build_object('speaker','narration','text','ペンを手に取り、白紙のページに向かった。このクラブの物語の、続きを書くために。')
      ),
      'choices', jsonb_build_array(
        jsonb_build_object(
          'id','s09_a','text','ページいっぱいに、今季のことを書いた。',
          'next_scene_id', s10_id::text,
          'cost', 0,
          'sets_flags', '{"notebook_continued":true}'
        )
      )
    ),
    0, '{}', '{"notebook_continued":true}'
  );

  -- ────────────────────────────────────────
  -- SCENE 10: エンディング — 春のスタジアム
  -- ────────────────────────────────────────
  INSERT INTO public.story_scenes
    (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (
    s10_id, ch1_id, misaki_id, 12, 'dialogue',
    'エンディング — 春のスタジアム',
    jsonb_build_object(
      'type', 'dialogue',
      'background', 'stadium_stands_spring',
      'bgm', 'misaki_theme_ending',
      'is_ending', true,
      'ending_text', '葵美咲ルート クリア' || chr(10) || '「春風のスタジアム」' || chr(10) || chr(10) || '次のシーズン、また彼女と共に戦おう。',
      'lines', jsonb_build_array(
        jsonb_build_object('speaker','narration','text','新シーズンが始まる前日。あのスタジアムの観客席に、二人でいた。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','今日も来ちゃいました。習慣で。'),
        jsonb_build_object('speaker','player','text','一人じゃなくて、よかった。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','……うん。'),
        jsonb_build_object('speaker','narration','text','春の光がピッチを染めている。父がかつて見た風景を、今は二人で見ている。'),
        jsonb_build_object('speaker','misaki','emotion','neutral','text','父がね、先週少しだけ話せたんです。「あのクラブに、いい監督が来た」って。'),
        jsonb_build_object('speaker','misaki','emotion','happy','text','私も、そう思います。'),
        jsonb_build_object('speaker','narration','text','彼女が隣で笑う。ピッチには新しいシーズンの空気が満ちていた。ノートはまだ続く。物語は、まだ終わらない。')
      ),
      'choices', jsonb_build_array()
    ),
    0, '{"notebook_continued":true}', '{"misaki_route_cleared":true}'
  );

  RAISE NOTICE '葵美咲ルート 12シーン挿入完了';
  RAISE NOTICE 'S01: % | S02: %', s01_id, s02_id;
  RAISE NOTICE 'S03W: % | S03L: %', s03w_id, s03l_id;
  RAISE NOTICE 'S04: % | S05: % | S06: % | S07: %', s04_id, s05_id, s06_id, s07_id;
  RAISE NOTICE 'S08W: % | S08L: % | S09: % | S10: %', s08w_id, s08l_id, s09_id, s10_id;

END $$;

-- 確認クエリ
SELECT
  scene_order,
  title_ja,
  scene_type,
  unlock_cost,
  requires_flags,
  sets_flags
FROM public.story_scenes
ORDER BY scene_order;
