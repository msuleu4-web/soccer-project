-- ================================================
-- キャリア週次イベントシーン (scene_order 1001 以上)
-- game-event ルートの TRIGGER_RULES が参照するシーン群
-- 20260524_001_story_system.sql 実行後に実行
-- ================================================

DO $$
DECLARE
  misaki_id    uuid;
  rin_id       uuid;
  koko_id      uuid;
  career_ch_id uuid;
BEGIN
  SELECT id INTO misaki_id FROM public.story_characters WHERE slug = 'misaki-aoi';
  SELECT id INTO rin_id    FROM public.story_characters WHERE slug = 'rin-kurosaki';
  SELECT id INTO koko_id   FROM public.story_characters WHERE slug = 'koko-kirino';

  IF misaki_id IS NULL THEN
    RAISE NOTICE 'misaki-aoi not found. Run story_system_seed.sql first.';
    RETURN;
  END IF;

  -- キャリアイベント専用チャプター (part=1, chapter=99 で衝突回避)
  SELECT id INTO career_ch_id
    FROM public.story_chapters
    WHERE part_number = 1 AND chapter_number = 99;

  IF career_ch_id IS NULL THEN
    INSERT INTO public.story_chapters (part_number, chapter_number, title_ja, required_progress)
    VALUES (1, 99, 'キャリアイベント', '{}')
    RETURNING id INTO career_ch_id;
  END IF;

  -- 既存キャリアシーンをクリア (冪等)
  DELETE FROM public.story_scenes WHERE chapter_id = career_ch_id;

  -- ─────────────────────────────────────────────────────────────────
  -- CYCLE 1
  -- ─────────────────────────────────────────────────────────────────

  -- 1001: みさき 好調 01
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 1001, 'dialogue', '好調なシーズン',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','misaki','text','監督っ！ 最近の調子、ほんとうに素晴らしいですね。スタンドの雰囲気もすごく盛り上がってて。'),
      jsonb_build_object('speaker','player','text','チーム全体がいい流れに乗っているんだ。'),
      jsonb_build_object('speaker','misaki','text','監督の采配のおかげですよ。私、試合を見るたびに「またやってくれた」って……。あ、仕事中でしたね。ふふっ。'),
      jsonb_build_object('speaker','narration','text','彼女の笑顔が、次の試合への力になる気がした。')
    )), 0, '{}', '{}');

  -- 1002: みさき 不調 01
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 1002, 'dialogue', '苦しいシーズン',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','misaki','text','監督……最近、苦しそうですね。何か手伝えることはありますか？'),
      jsonb_build_object('speaker','player','text','結果がなかなかついてこない時期だ。'),
      jsonb_build_object('speaker','misaki','text','でも、監督が諦めないかぎり私たちも諦めません。スランプって、乗り越えた先に大きな成長がありますから。'),
      jsonb_build_object('speaker','narration','text','温かい言葉に、少し肩の力が抜けた気がした。')
    )), 0, '{}', '{}');

  -- 1003: みさき 普通 01
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 1003, 'dialogue', 'クラブハウスで',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','narration','text','クラブハウスのカフェテリアで、葵と鉢合わせになった。'),
      jsonb_build_object('speaker','misaki','text','あ、監督！ ちょうどよかった、今日の練習メニューを確認したくて。'),
      jsonb_build_object('speaker','player','text','いいタイミングだね。少し話せる？'),
      jsonb_build_object('speaker','misaki','text','もちろんです！ いくらでも！')
    )), 0, '{}', '{}');

  -- 1101: りん 移籍 01
  IF rin_id IS NOT NULL THEN
    INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
    VALUES (gen_random_uuid(), career_ch_id, rin_id, 1101, 'dialogue', '移籍オファーの話',
      jsonb_build_object('type','dialogue','lines',jsonb_build_array(
        jsonb_build_object('speaker','rin-kurosaki','text','移籍オファーが届いているとお聞きしました。選手の意向を尊重しながら、クラブとしてどう対応するつもりですか？'),
        jsonb_build_object('speaker','player','text','じっくり話し合う予定だ。'),
        jsonb_build_object('speaker','rin-kurosaki','text','そうですか……あなたなら誠実に向き合ってくれると思っていました。最善の判断を。')
      )), 0, '{}', '{}');
  END IF;

  -- 1201: みさき 怪我 01
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 1201, 'dialogue', '怪我のサポート',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','misaki','text','監督……怪我は大丈夫ですか？ 無理してないですか？'),
      jsonb_build_object('speaker','player','text','大事にはならなかった。でも養生中だ。'),
      jsonb_build_object('speaker','misaki','text','無理しないでくださいね。ちゃんと回復することが一番大事ですから。何かできることがあれば言ってください。'),
      jsonb_build_object('speaker','narration','text','心配そうに見つめる瞳に、不思議と安心感を覚えた。')
    )), 0, '{}', '{}');

  -- 1501: ここ 好調 01
  IF koko_id IS NOT NULL THEN
    INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
    VALUES (gen_random_uuid(), career_ch_id, koko_id, 1501, 'dialogue', 'ここの差し入れ',
      jsonb_build_object('type','dialogue','lines',jsonb_build_array(
        jsonb_build_object('speaker','koko-kirino','text','はーい差し入れでーす！ 最近めちゃくちゃ勝ってるじゃないですかっ！ テレビで全部観てましたよ～！'),
        jsonb_build_object('speaker','player','text','見てたのか。ありがとう。'),
        jsonb_build_object('speaker','koko-kirino','text','えへへ。これ、ここが手作りしたクッキーです！ 必勝クッキー！ ちゃんと勝ってくれないと怒りますよ～？'),
        jsonb_build_object('speaker','narration','text','柔らかな甘さが口に広がった。')
      )), 0, '{}', '{}');
  END IF;

  -- ─────────────────────────────────────────────────────────────────
  -- CYCLE 2
  -- ─────────────────────────────────────────────────────────────────

  -- 2001: みさき 好調 02
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 2001, 'dialogue', '快進撃の夜',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','misaki','text','今日の試合、最高でした！ スタジアムが全員立ち上がった瞬間、私も思わず……。'),
      jsonb_build_object('speaker','player','text','興奮してたね。'),
      jsonb_build_object('speaker','misaki','text','み、見てたんですか！？ うう……恥ずかしい……でも本当に嬉しくて。ずっとこのチームを応援してたんです。'),
      jsonb_build_object('speaker','narration','text','初めて聞いた話に、彼女への親しみが深まった。')
    )), 0, '{}', '{}');

  -- 2002: みさき 不調 02
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 2002, 'dialogue', '踏ん張りどき',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','misaki','text','最近、試合が難しいですよね。でも、こういう時期こそチームの真価が問われると思うんです。'),
      jsonb_build_object('speaker','player','text','そうだな。焦らず積み上げていく。'),
      jsonb_build_object('speaker','misaki','text','そうです！ 監督を信じています。みんなも信じてます。絶対に逆転できますよ！'),
      jsonb_build_object('speaker','narration','text','力強い言葉が、心に刺さった。')
    )), 0, '{}', '{}');

  -- 2003: みさき 普通 02
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 2003, 'dialogue', '仕事帰りに',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','narration','text','練習後、正門を出ようとすると葵がコーヒーを二つ持って立っていた。'),
      jsonb_build_object('speaker','misaki','text','お疲れ様です。いつも遅くまでありがとうございます。良かったらどうぞ。'),
      jsonb_build_object('speaker','player','text','ありがとう。気が利くね。'),
      jsonb_build_object('speaker','misaki','text','ふふ。監督に少しでも喜んでもらえると嬉しいので。')
    )), 0, '{}', '{}');

  -- 2101: りん 移籍 02
  IF rin_id IS NOT NULL THEN
    INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
    VALUES (gen_random_uuid(), career_ch_id, rin_id, 2101, 'dialogue', '交渉の舞台裏',
      jsonb_build_object('type','dialogue','lines',jsonb_build_array(
        jsonb_build_object('speaker','rin-kurosaki','text','また移籍オファーですか。このクラブ、それだけ注目されているということですね。'),
        jsonb_build_object('speaker','player','text','複雑だ。'),
        jsonb_build_object('speaker','rin-kurosaki','text','失いたくない選手ほど、外から評価される。……でも、それが本当の実力の証明でもある。'),
        jsonb_build_object('speaker','rin-kurosaki','text','交渉、私もサポートします。最善の形を見つけましょう。')
      )), 0, '{}', '{}');
  END IF;

  -- 2501: ここ ゴール率 02
  IF koko_id IS NOT NULL THEN
    INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
    VALUES (gen_random_uuid(), career_ch_id, koko_id, 2501, 'dialogue', '点取り屋の監督',
      jsonb_build_object('type','dialogue','lines',jsonb_build_array(
        jsonb_build_object('speaker','koko-kirino','text','ねえねえ！ 最近、点めちゃくちゃ入ってますよね！ ここ、スコアのたびに飛び跳ねちゃって大変でしたよ？'),
        jsonb_build_object('speaker','player','text','飛び跳ねてたのか。'),
        jsonb_build_object('speaker','koko-kirino','text','だって嬉しいんですもん！ 今度試合に呼んでくださいね！ VIP席で！'),
        jsonb_build_object('speaker','narration','text','その無邪気な笑顔に、思わず笑いが込み上げてきた。')
      )), 0, '{}', '{}');
  END IF;

  -- ─────────────────────────────────────────────────────────────────
  -- CYCLE 3
  -- ─────────────────────────────────────────────────────────────────

  -- 3101: りん シーズン中間分析
  IF rin_id IS NOT NULL THEN
    INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
    VALUES (gen_random_uuid(), career_ch_id, rin_id, 3101, 'dialogue', 'シーズン中間分析',
      jsonb_build_object('type','dialogue','lines',jsonb_build_array(
        jsonb_build_object('speaker','rin-kurosaki','text','シーズン折り返しのデータを分析しました。いくつか気になる点があります。少しよろしいですか？'),
        jsonb_build_object('speaker','player','text','ああ、ぜひ聞かせてくれ。'),
        jsonb_build_object('speaker','rin-kurosaki','text','守備の連携に改善の余地があります。特に左サイドのカバーリング。'),
        jsonb_build_object('speaker','narration','text','的確な分析を聞きながら、彼女の仕事への真摯な姿勢が改めて頼もしく思えた。')
      )), 0, '{}', '{}');
  END IF;

  -- 4001: みさき 好調 03
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 4001, 'dialogue', '表彰式の夜',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','misaki','text','監督っ！ 本当におめでとうございます！ ずっと信じてました！'),
      jsonb_build_object('speaker','player','text','みんなのおかげだよ。みさきのサポートにも助かった。'),
      jsonb_build_object('speaker','misaki','text','そんな……！ 私なんて大したことは……でもそう言ってもらえると。あ、なんか目頭が……'),
      jsonb_build_object('speaker','narration','text','きらりと光るものを見せながら笑う彼女を見て、この道を共に歩んできたのだと感じた。')
    )), 0, '{}', '{}');

  -- 4002: みさき 不調 03
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 4002, 'dialogue', '一緒に考える',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','misaki','text','監督、最近かなりしんどそうですよね。少し一緒に考えさせてもらっていいですか？'),
      jsonb_build_object('speaker','player','text','悪いね。でも、ありがとう。'),
      jsonb_build_object('speaker','misaki','text','遠慮しなくていいです！ 私はここにいますから。ひとりで全部抱えないでくださいね。'),
      jsonb_build_object('speaker','narration','text','差し伸べられた言葉の温かさを、ありがたく受け取ることにした。')
    )), 0, '{}', '{}');

  -- 4003: みさき 普通 03
  INSERT INTO public.story_scenes (id, chapter_id, character_id, scene_order, scene_type, title_ja, content, unlock_cost, requires_flags, sets_flags)
  VALUES (gen_random_uuid(), career_ch_id, misaki_id, 4003, 'dialogue', '季節の変わり目に',
    jsonb_build_object('type','dialogue','lines',jsonb_build_array(
      jsonb_build_object('speaker','narration','text','ピッチのそばに立っていると、風が少しだけ変わった気がした。'),
      jsonb_build_object('speaker','misaki','text','監督、最近どうですか？ 身体の調子とか……プライベートとか。'),
      jsonb_build_object('speaker','player','text','まあまあかな。葵はどう？'),
      jsonb_build_object('speaker','misaki','text','私は元気ですよ！ 監督が元気だと、私も元気になれるんです。変かな。……変じゃないですよね？')
    )), 0, '{}', '{}');

  RAISE NOTICE 'キャリア週次シーンを挿入しました (career_chapter_id = %)', career_ch_id;
END $$;
