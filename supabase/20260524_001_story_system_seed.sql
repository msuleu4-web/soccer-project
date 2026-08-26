-- =====================================================
-- Goal Labo 監督ライフ・シミュレーション
-- 初期データ投入 (Seed)
-- File   : 20260524_001_story_system_seed.sql
-- Author : msuleu4-web
-- Date   : 2026-05-24
--
-- 前提条件:
--   20260524_001_story_system.sql が実行済みであること。
--
-- 収録データ:
--   - story_characters : ヒロイン/重要キャラクター 6 人
--   - story_chapters   : 全 3 部の章構造 (Part 1: 3章 / Part 2: 6章 / Part 3: 1章)
--   - story_scenes     : 各章の冒頭シーン (サンプル)
--
-- テストデータ:
--   ファイル末尾の DO $$ ... END $$ ブロックに記載。
--   実行前に test_user_id を実際の UUID に書き換えること。
-- =====================================================


-- ─────────────────────────────────────────────────────
-- 1. story_characters (ヒロイン 6 人)
-- ─────────────────────────────────────────────────────
-- 設計判断:
--   Key 作品の三部構成に対応した 6 つのアーキタイプを採用。
--   各キャラはサッカークラブに実在するロールに紐づけており
--   監督(プレイヤー)との接点を自然に設計している。
--
--   アーキタイプ対応:
--     nagisa  → 碧井みさき  (PR担当 / 明るく芯が強い)
--     tomoyo  → 氷室 玲     (主将  / 孤高のクールビューティ)
--     kotomi  → 桐島琴音    (分析官 / 天才型・社会不適応)
--     misuzu  → 羽鳥美鈴    (ユースFW / 夢追い人・悲劇的過去)
--     sakura  → 桜庭 咲     (事務局長補佐 / 献身的・隠された強さ)
--     fuko    → 不知火冬花  (謎の人物 / 季節外れの存在感)

INSERT INTO public.story_characters (
  slug, display_name_ja, role, archetype,
  theme_color, character_image_url, bio_summary_ja,
  unlock_condition, is_hidden
) VALUES

-- ① 碧井みさき (Aoi Misaki) ─ nagisa ─ PR担当
-- 第1部から登場するメインヒロイン。
-- クラブの広報として情熱を持って働く新人スタッフ。
-- 持病を抱えながらも諦めない姿が監督の心を動かす。
(
  'misaki-aoi',
  '碧井 みさき',
  'pr_staff',
  'nagisa',
  '#F4A7B9',
  NULL,
  'クラブ広報の新人スタッフ。ドジで天然だけれど誰よりも熱くクラブを愛している。'
  || '幼い頃から身体が弱く、病院通いが多かった彼女には誰にも言えない夢がある。',
  '{}',
  false
),

-- ② 氷室 玲 (Himuro Rei) ─ tomoyo ─ 主将
-- DF として鉄壁の守備を誇るキャプテン。
-- 寡黙で近寄りがたいが、チームへの責任感は誰よりも強い。
-- 監督との対立を経て互いを認め合うルート。
(
  'rei-himuro',
  '氷室 玲',
  'captain',
  'tomoyo',
  '#7B9EC1',
  NULL,
  'クラブ最年長の女性キャプテン。ピッチ上では氷の守護者、ロッカーでは無口な番長。'
  || '若い頃の傷が彼女を人から遠ざけているが、その根底には深い優しさが眠っている。',
  '{}',
  false
),

-- ③ 桐島琴音 (Kirishima Kotone) ─ kotomi ─ データ分析官
-- 映像・統計解析の天才。人との会話より数字と対話するのが得意。
-- バイオリンの代わりにモニターを何十台も並べて作業する。
-- 特定フラグ (データ共有イベント) で解放。
(
  'kotone-kirishima',
  '桐島 琴音',
  'analyst',
  'kotomi',
  '#A8C5A0',
  NULL,
  '戦術分析室に引きこもるデータの魔女。挨拶はできないが相手の行動パターンは'
  || '全て予測済み。亡き父が遺した未完成の戦術論文を完成させることが彼女の使命。',
  '{"type": "flag", "flag": "shared_tactics_data", "value": true}',
  false
),

-- ④ 羽鳥美鈴 (Hatori Misuzu) ─ misuzu ─ ユースFW
-- ユースチームの快足ストライカー。トップ昇格を夢見ている。
-- しかし毎シーズン怪我が続き、夢が遠ざかる。
-- AIR の美鈴のように「夢の向こう側」を象徴するキャラクター。
(
  'misuzu-hatori',
  '羽鳥 美鈴',
  'youth_fw',
  'misuzu',
  '#F7D794',
  NULL,
  'ユースチームのエースストライカー。誰よりも速く、誰よりも高く飛べる。'
  || 'しかし毎年夏になると決まって身体が悲鳴を上げる。それでも彼女は笑って走り続ける。',
  '{"type": "season", "min_season": 2}',
  false
),

-- ⑤ 桜庭 咲 (Sakuraba Saki) ─ sakura ─ 事務局長補佐
-- クラブ運営を影で支える縁の下の力持ち。
-- 誰にでも献身的で自分を後回しにするが、その優しさの裏に深い孤独がある。
-- Fate/Sakura のように「隠された過去」が最大の見せ場。
(
  'saki-sakuraba',
  '桜庭 咲',
  'secretary',
  'sakura',
  '#D7A4C8',
  NULL,
  'クラブ事務局の守護天使。どんな書類も24時間以内に処理し、コーヒーは砂糖なし。'
  || '完璧に見える彼女の手帳には、誰にも見せたことのないページが1枚だけある。',
  '{}',
  false
),

-- ⑥ 不知火冬花 (Shiranui Fuyuka) ─ fuko ─ 謎の存在
-- is_hidden=true: 2ルート以上クリアするまで UI 上は「???」表示。
-- スタジアムの廊下で突然現れ、ヒトデならぬ「芝の切れ端」を配るミステリアスな少女。
-- 彼女の正体を知る者はクラブにいない。
(
  'fuyuka-shiranui',
  '不知火 冬花',
  'mystery',
  'fuko',
  '#B8C5E0',
  NULL,
  'スタジアムの暗がりでひとり芝生の切れ端を拾い集める謎の少女。'
  || '試合終了後のピッチにだけ現れる彼女は、果たして本当にこのクラブに存在しているのか。',
  '{"type": "complete_routes", "min_count": 2}',
  true  -- 2ルートクリアまで UI 上で「???」表示
);


-- ─────────────────────────────────────────────────────
-- 2. story_chapters (章構造)
-- ─────────────────────────────────────────────────────
-- Part 1: 共通ルート「新任監督、就任」
-- Part 2: ヒロイン個別ルート (各キャラ1章)
-- Part 3: True End「最終節の奇跡」(共通)

INSERT INTO public.story_chapters (
  part_number, chapter_number, title_ja, subtitle_ja,
  description_ja, required_progress
) VALUES

-- ─── Part 1 (共通ルート) ───────────────────────────────

(1, 1,
  '第1章: 就任',
  '「あなたが新しい監督ですか?」',
  '地方の弱小クラブに新任監督として赴任した初日。'
  || 'グラウンドでは練習もせず雑談するスタッフ、ボロボロのロッカールーム。'
  || 'そして無愛想な主将、玲との最初の邂逅。',
  '{}'
),

(1, 2,
  '第2章: 最初の公式戦',
  '「監督、本当に戦えるんですか?」',
  'シーズン開幕戦。選手の士気は低く、スカウトデータもない。'
  || 'みさきが作った手書きの応援幕だけが頼りの試合が始まる。',
  '{"flag": "chapter_1_1_cleared", "value": true}'
),

(1, 3,
  '第3章: 分岐点',
  '「あなたは誰のために戦う?」',
  '3節を終えて最下位。フロントからの解任圧力が高まる中、'
  || '各ヒロインとの深い接点が生まれ、物語が個別ルートへと分岐していく。',
  '{"flag": "chapter_1_2_cleared", "value": true}'
),

-- ─── Part 2 (個別ルート) ───────────────────────────────

(2, 1,
  'みさきルート 第1章: 届かない声',
  '「応援の言葉ってどこまで届くんですかね」',
  'PRスタッフとして奮闘するみさきだが、身体の限界が近づいていた。'
  || '監督だけが気づく彼女の異変。二人だけの秘密が始まる。',
  '{"flag": "route_misaki_unlocked", "value": true}'
),

(2, 2,
  '玲ルート 第1章: 氷の理由',
  '「仲間を信じることが怖い理由、教えましょうか」',
  '無口な主将・玲の過去に、監督が偶然触れてしまう。'
  || '彼女がキャプテンマークを巻き続ける本当の理由とは。',
  '{"flag": "route_rei_unlocked", "value": true}'
),

(2, 3,
  '琴音ルート 第1章: データの向こう側',
  '「この数字は全部、あなたへのラブレターです」',
  '分析室に閉じこもる琴音と週1回のデータ共有会議。'
  || '徐々に言葉を交わすようになった二人が辿り着く、父の遺した答え。',
  '{"flag": "route_kotone_unlocked", "value": true}'
),

(2, 4,
  '美鈴ルート 第1章: 夏の向こうへ',
  '「今年こそトップに上がれますかね、監督」',
  '毎夏繰り返される怪我。それでも笑い続ける美鈴の傍に、'
  || '監督は寄り添い続けることを選ぶ。夢と現実の間にある答え。',
  '{"flag": "route_misuzu_unlocked", "value": true}'
),

(2, 5,
  '咲ルート 第1章: 手帳の最後のページ',
  '「これ、誰にも見せたことなかったんです」',
  'ある夜残業中に見つけた咲の手帳。そこに書かれていた一行が、'
  || '監督と彼女の関係を静かに、しかし決定的に変えてしまう。',
  '{"flag": "route_saki_unlocked", "value": true}'
),

(2, 6,
  '冬花ルート 第1章: 存在の証明',
  '「私がここにいるって、信じてもらえますか?」',
  '2ルートを経た監督だけが解放できる特別ルート。'
  || '不知火冬花は本当に実在するのか。スタジアムの謎と彼女の記憶が交差する。',
  '{"completed_routes_min": 2}'
),

-- ─── Part 3 (True End) ──────────────────────────────

(3, 1,
  '終章: 最終節の奇跡',
  '「全員揃ったら、無敵だって言ったじゃないですか」',
  '全ルートが繋がる最終章。シーズン最終節、降格圏との直接対決。'
  || 'これまでのすべての選択が、この90分に収束する。',
  '{"completed_routes_min": 1, "season_number_min": 2}'
);


-- ─────────────────────────────────────────────────────
-- 3. story_scenes (冒頭シーン: 各章 Scene 1 のみ)
-- ─────────────────────────────────────────────────────
-- 設計判断:
--   ここではフロントの動作確認用に最低限の冒頭シーンのみ投入する。
--   本格的なシーン投入は Groq SDK を用いた生成バッチで行う想定。
--   content JSONB の構造は gachaSystem.ts 側の型定義と合わせること。

INSERT INTO public.story_scenes (
  chapter_id, character_id, scene_order, scene_type,
  title_ja, content, unlock_cost, requires_flags, sets_flags
)
SELECT
  -- Part 1, Chapter 1 の冒頭シーン
  ch.id AS chapter_id,
  NULL  AS character_id,  -- ナレーションのため character_id なし
  1     AS scene_order,
  'dialogue' AS scene_type,
  '就任の朝' AS title_ja,
  jsonb_build_object(
    'background', 'club_entrance_morning',
    'bgm', 'theme_opening',
    'dialogue', jsonb_build_array(
      jsonb_build_object('speaker', 'ナレーション', 'text',
        '地方都市の片隅に、ひっそりと存在するサッカークラブ。'
        || 'FC ゴールラボ。J3 最下位常連の、誰も期待しないクラブに、'
        || 'あなたは今日から監督として赴任する。'),
      jsonb_build_object('speaker', '???', 'text',
        '「……あなたが新しい監督ですか?」')
    )
  ),
  0     AS unlock_cost,
  '{}'  AS requires_flags,
  '{"chapter_1_1_scene_1_seen": true}'::jsonb AS sets_flags
FROM public.story_chapters ch
WHERE ch.part_number = 1 AND ch.chapter_number = 1;


INSERT INTO public.story_scenes (
  chapter_id, character_id, scene_order, scene_type,
  title_ja, content, unlock_cost, requires_flags, sets_flags
)
SELECT
  ch.id   AS chapter_id,
  sc.id   AS character_id,
  2       AS scene_order,
  'dialogue' AS scene_type,
  '廊下の出会い' AS title_ja,
  jsonb_build_object(
    'background', 'club_corridor',
    'bgm', 'theme_misaki',
    'dialogue', jsonb_build_array(
      jsonb_build_object('speaker', 'みさき', 'emotion', 'surprised', 'text',
        '「あ! びっくりした……もしかして新任監督さんですか!?'
        || ' 私、クラブ広報の碧井みさきといいます! よろしくお願いします!」'),
      jsonb_build_object('speaker', 'みさき', 'emotion', 'smile', 'text',
        '「あの、えっと……あ、これ。就任祝いに作ったんです。'
        || ' 手作りなので恥ずかしいですけど……」')
    )
  ),
  0       AS unlock_cost,
  '{}'    AS requires_flags,
  '{"met_misaki": true}'::jsonb AS sets_flags
FROM public.story_chapters ch
CROSS JOIN public.story_characters sc
WHERE ch.part_number = 1 AND ch.chapter_number = 1
  AND sc.slug = 'misaki-aoi';


INSERT INTO public.story_scenes (
  chapter_id, character_id, scene_order, scene_type,
  title_ja, content, unlock_cost, requires_flags, sets_flags
)
SELECT
  ch.id   AS chapter_id,
  sc.id   AS character_id,
  3       AS scene_order,
  'choice' AS scene_type,
  '最初の選択' AS title_ja,
  jsonb_build_object(
    'background', 'club_corridor',
    'bgm', 'theme_misaki',
    'dialogue', jsonb_build_array(
      jsonb_build_object('speaker', 'みさき', 'emotion', 'anxious', 'text',
        '「あの……監督って、このクラブをどんなチームにしたいですか?」')
    ),
    'choices', jsonb_build_array(
      jsonb_build_object(
        'label', '「勝てるチームだ」',
        'sets_flags', '{"director_goal_win": true}',
        'next_scene_order', 4
      ),
      jsonb_build_object(
        'label', '「選手が輝けるチームだ」',
        'sets_flags', '{"director_goal_players": true}',
        'next_scene_order', 4
      ),
      jsonb_build_object(
        'label', '「……まだわからない」',
        'sets_flags', '{"director_goal_unknown": true}',
        'next_scene_order', 4
      )
    )
  ),
  0       AS unlock_cost,
  '{"met_misaki": true}'::jsonb AS requires_flags,
  '{}'::jsonb AS sets_flags
FROM public.story_chapters ch
CROSS JOIN public.story_characters sc
WHERE ch.part_number = 1 AND ch.chapter_number = 1
  AND sc.slug = 'misaki-aoi';


-- ─────────────────────────────────────────────────────
-- テストデータ (開発環境のみ実行すること)
-- ─────────────────────────────────────────────────────
-- ⚠️  使い方:
--   1. 下記の test_user_id を Supabase Auth のテストユーザー UUID に書き換える
--   2. SQL Editor で実行する
--   3. user_wallet.last_payday_at を 8 日前に設定しているため
--      すぐに process_weekly_salary() を呼び出すと週給が入金される

DO $$
DECLARE
  test_user_id     uuid := '00000000-0000-0000-0000-000000000001'; -- ← 実際の UUID に差し替え
  first_chapter_id uuid;
  first_scene_id   uuid;
BEGIN
  -- auth.users に存在しない UUID ならスキップ
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
    RAISE NOTICE '⚠️  テストユーザーが見つかりません。';
    RAISE NOTICE '    seed.sql の test_user_id を Supabase Auth の実際の UUID に書き換えてください。';
    RAISE NOTICE '    確認方法: Supabase ダッシュボード > Authentication > Users';
    RETURN;
  END IF;

  -- 最初の章・シーンを取得
  SELECT id INTO first_chapter_id
  FROM public.story_chapters
  ORDER BY part_number, chapter_number
  LIMIT 1;

  SELECT id INTO first_scene_id
  FROM public.story_scenes
  ORDER BY scene_order
  LIMIT 1;

  -- user_story_progress: 初期状態 (第1部第1章)
  INSERT INTO public.user_story_progress (
    user_id,
    current_part,
    current_chapter_id,
    current_scene_id,
    season_number,
    gameweek,
    story_flags,
    completed_routes,
    unlocked_routes
  ) VALUES (
    test_user_id,
    1,
    first_chapter_id,
    first_scene_id,
    1,
    1,
    '{}',
    '[]',
    '["misaki"]'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- user_wallet: 残高 150,000G (テスト用に多めに設定)
  -- last_payday_at を 8 日前にすることで即座に週給テスト可能
  INSERT INTO public.user_wallet (
    user_id,
    balance,
    weekly_salary,
    last_payday_at,
    total_earned,
    total_spent
  ) VALUES (
    test_user_id,
    150000,
    50000,
    now() - INTERVAL '8 days',  -- 週給テスト用に意図的に古い日付
    150000,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'テストデータ投入完了: user_id = %', test_user_id;
  RAISE NOTICE '週給テスト: SELECT * FROM process_weekly_salary(); を実行してください';
END $$;
