-- =====================================================
-- Goal Labo 監督ライフ・シミュレーション
-- ストーリーシステム基盤 マイグレーション (UP)
-- File   : 20260524_001_story_system.sql
-- Author : msuleu4-web
-- Date   : 2026-05-24
--
-- 使い方:
--   Supabase ダッシュボード > SQL Editor にこのファイルの内容を
--   貼り付けて「Run」ボタンを押す。
--   または: supabase db push (CLI)
-- =====================================================


-- ─────────────────────────────────────────────────────
-- ユーティリティ: updated_at 自動更新トリガー関数
-- ─────────────────────────────────────────────────────
-- 設計判断: 複数テーブルで共有するため OR REPLACE で定義。
-- 既に存在する場合は上書きされるので冪等性がある。
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 1. story_characters (ヒロイン/重要キャラクター)
-- =====================================================
-- 設計判断:
--   is_hidden=true のキャラは SELECT でも全カラムが返る。
--   「??」のような隠し表示はフロントで制御する方針にした。
--   RLS で完全に隠すと存在確認すらできなくなり、
--   シーン側の FK 整合性チェックが困難になるため。
CREATE TABLE public.story_characters (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text        NOT NULL UNIQUE,         -- 'misaki-aoi' など URL-safe
  display_name_ja     text        NOT NULL,
  role                text        NOT NULL CHECK (role IN (
                        'pr_staff', 'captain', 'analyst',
                        'youth_fw', 'secretary', 'mystery'
                      )),
  archetype           text        NOT NULL CHECK (archetype IN (
                        'nagisa', 'tomoyo', 'kotomi',
                        'misuzu', 'sakura', 'fuko'
                      )),
  theme_color         text        NOT NULL DEFAULT '#4A90D9',
  character_image_url text,
  bio_summary_ja      text,
  unlock_condition    jsonb       NOT NULL DEFAULT '{}',
  is_hidden           boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER story_characters_updated_at
  BEFORE UPDATE ON public.story_characters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX story_characters_slug_idx ON public.story_characters(slug);
CREATE INDEX story_characters_role_idx ON public.story_characters(role);

-- RLS: キャラクター情報は全員閲覧可 (解放条件はフロントで判定)
ALTER TABLE public.story_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "story_characters_select_public"
  ON public.story_characters FOR SELECT
  USING (true);


-- =====================================================
-- 2. story_chapters (章構造: 全3部 × 複数章)
-- =====================================================
-- 設計判断:
--   第1部 = 共通ルート (全員分岐前)
--   第2部 = ヒロイン個別ルート
--   第3部 = True End / After Story
--   part_number + chapter_number の複合ユニーク制約で
--   「第2部1章」を2度作成する事故を防止。
CREATE TABLE public.story_chapters (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number       int         NOT NULL CHECK (part_number BETWEEN 1 AND 3),
  chapter_number    int         NOT NULL,
  title_ja          text        NOT NULL,
  subtitle_ja       text,
  description_ja    text,
  required_progress jsonb       NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (part_number, chapter_number)
);

-- 部・章番号での昇順取得 (ストーリー進行順)
CREATE INDEX story_chapters_part_chapter_idx
  ON public.story_chapters(part_number, chapter_number);

ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "story_chapters_select_public"
  ON public.story_chapters FOR SELECT
  USING (true);


-- =====================================================
-- 3. story_scenes (個別シーン)
-- =====================================================
-- 設計判断:
--   content JSONB の想定スキーマ:
--   {
--     "dialogue": [{"speaker": "みさき", "text": "...", "emotion": "smile"}],
--     "choices":  [{"label": "一緒に行く", "next_scene_id": "<uuid>",
--                   "sets_flags": {"went_with_misaki": true}}],
--     "background": "stadium_night",
--     "bgm": "theme_misaki",
--     "cg": null
--   }
--   Groq SDK で生成したセリフもここに格納する。
--   requires_flags / sets_flags は
--   {"met_misaki": true, "season_1_ended": true} のような平坦な boolean マップ。
CREATE TABLE public.story_scenes (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id     uuid        NOT NULL REFERENCES public.story_chapters(id) ON DELETE CASCADE,
  character_id   uuid        REFERENCES public.story_characters(id) ON DELETE SET NULL,
  scene_order    int         NOT NULL,
  scene_type     text        NOT NULL CHECK (scene_type IN (
                   'dialogue', 'choice', 'match_event', 'reflection'
                 )),
  title_ja       text,
  content        jsonb       NOT NULL DEFAULT '{}',
  unlock_cost    int         NOT NULL DEFAULT 0 CHECK (unlock_cost >= 0),
  requires_flags jsonb       NOT NULL DEFAULT '{}',
  sets_flags     jsonb       NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, scene_order)
);

-- 章内のシーン順読み込み (最頻アクセスパターン)
CREATE INDEX story_scenes_chapter_order_idx
  ON public.story_scenes(chapter_id, scene_order);

-- キャラクター別シーン一覧 (ルート管理画面用)
CREATE INDEX story_scenes_character_id_idx
  ON public.story_scenes(character_id);

-- 有料シーン一覧 (管理・プレビュー用)
CREATE INDEX story_scenes_unlock_cost_idx
  ON public.story_scenes(unlock_cost)
  WHERE unlock_cost > 0;

ALTER TABLE public.story_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "story_scenes_select_public"
  ON public.story_scenes FOR SELECT
  USING (true);


-- =====================================================
-- 4. user_story_progress (プレイヤー進行状況)
-- =====================================================
-- 設計判断:
--   user_id を PK にして1ユーザー = 1セーブデータを強制。
--   複数セーブは将来 story_slots テーブルで対応予定。
--   gameweek は J リーグ相当の 38 節制を想定。
--   unlocked_routes はデフォルト '["misaki"]' とし、
--   初回ログイン時にみさきルートのみ開放済みにする。
CREATE TABLE public.user_story_progress (
  user_id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_part       int         NOT NULL DEFAULT 1 CHECK (current_part BETWEEN 1 AND 3),
  current_chapter_id uuid        REFERENCES public.story_chapters(id) ON DELETE SET NULL,
  current_scene_id   uuid        REFERENCES public.story_scenes(id)   ON DELETE SET NULL,
  season_number      int         NOT NULL DEFAULT 1 CHECK (season_number >= 1),
  gameweek           int         NOT NULL DEFAULT 1 CHECK (gameweek BETWEEN 1 AND 38),
  story_flags        jsonb       NOT NULL DEFAULT '{}',
  completed_routes   jsonb       NOT NULL DEFAULT '[]',
  unlocked_routes    jsonb       NOT NULL DEFAULT '["misaki"]',
  last_played_at     timestamptz NOT NULL DEFAULT now(),
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- 管理画面でのアクティブユーザー降順ソート用
CREATE INDEX user_story_progress_last_played_idx
  ON public.user_story_progress(last_played_at DESC);

ALTER TABLE public.user_story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_story_progress_select_own"
  ON public.user_story_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_story_progress_insert_own"
  ON public.user_story_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_story_progress_update_own"
  ON public.user_story_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- 5. user_wallet (週給システム)
-- =====================================================
-- 設計判断:
--   ゲーム内通貨「G (ゴールド)」を bigint で管理。
--   balance に CHECK (>= 0) を設けて残高マイナスを DB レベルで防止。
--   balance / total_earned / total_spent の UPDATE は service_role のみ。
--   フロントから直接 balance を書き換えられないよう、
--   UPDATE ポリシーはあえて設定しない (service_role バイパスに委ねる)。
--   初期週給は 50,000G = 試合1節あたりの報酬感を設計すること。
CREATE TABLE public.user_wallet (
  user_id        uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance        bigint      NOT NULL DEFAULT 0       CHECK (balance >= 0),
  weekly_salary  bigint      NOT NULL DEFAULT 50000   CHECK (weekly_salary > 0),
  last_payday_at timestamptz NOT NULL DEFAULT now(),
  total_earned   bigint      NOT NULL DEFAULT 0       CHECK (total_earned >= 0),
  total_spent    bigint      NOT NULL DEFAULT 0       CHECK (total_spent >= 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_wallet_updated_at
  BEFORE UPDATE ON public.user_wallet
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 週給付与対象者の抽出 (last_payday_at が古い順)
-- now() は VOLATILE のためインデックス述語に使えない → WHERE なしで定義し
-- process_weekly_salary() 関数側のクエリで絞り込む
CREATE INDEX user_wallet_payday_idx
  ON public.user_wallet(last_payday_at);

ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_wallet_select_own"
  ON public.user_wallet FOR SELECT
  USING (auth.uid() = user_id);

-- 初回セーブデータ作成 (新規登録フロー) のみ INSERT 許可
CREATE POLICY "user_wallet_insert_own"
  ON public.user_wallet FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE は service_role のみ (不正な残高操作を防止)
-- ※ service_role は RLS をバイパスするため明示的ポリシー不要


-- =====================================================
-- 6. wallet_transactions (取引履歴)
-- =====================================================
-- 設計判断:
--   amount は正負両方を許容。収入=正値、支出=負値で統一する。
--   INSERT は service_role のみに制限し、残高の整合性をサーバー側で保証。
--   フロントからは SELECT のみ許可し、改ざんを防止する。
CREATE TABLE public.wallet_transactions (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type     text        NOT NULL CHECK (transaction_type IN (
                          'salary', 'unlock_scene', 'gift', 'training', 'refund'
                        )),
  amount               bigint      NOT NULL,
  description_ja       text        NOT NULL,
  related_content_type text        CHECK (related_content_type IN ('scene', 'character', 'item')),
  related_content_id   uuid,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- 取引履歴の新しい順取得 (ウォレット画面用)
CREATE INDEX wallet_transactions_user_created_idx
  ON public.wallet_transactions(user_id, created_at DESC);

-- 週給の最終付与日検索 (Edge Function での重複付与防止チェック用)
CREATE INDEX wallet_transactions_salary_type_idx
  ON public.wallet_transactions(user_id, created_at DESC)
  WHERE transaction_type = 'salary';

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_transactions_select_own"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT は service_role のみ (RLS バイパスに委ねる)


-- =====================================================
-- 7. user_unlocked_content (解放済みコンテンツ)
-- =====================================================
-- 設計判断:
--   (user_id, content_type, content_id) の複合 UNIQUE 制約で
--   DB レベルでの二重解放を防止。
--   INSERT は service_role のみとし、購入処理は必ず
--   API Route または Edge Function を経由させる。
--   これにより「残高チェック → 解放登録 → 残高減算 → 取引記録」の
--   一連の処理をトランザクションで保証できる。
CREATE TABLE public.user_unlocked_content (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text        NOT NULL CHECK (content_type IN (
                 'scene', 'route', 'ending', 'extra_choice'
               )),
  content_id   uuid        NOT NULL,
  unlocked_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

-- コンテンツタイプ別の解放済み一覧 (解放チェック用)
CREATE INDEX user_unlocked_content_user_type_idx
  ON public.user_unlocked_content(user_id, content_type);

ALTER TABLE public.user_unlocked_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_unlocked_content_select_own"
  ON public.user_unlocked_content FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT は service_role のみ (購入処理はサーバーサイドで実行)


-- =====================================================
-- 週給自動付与関数 (Edge Function から呼び出す)
-- =====================================================
-- 設計判断:
--   SECURITY DEFINER で実行し RLS をバイパスすることで
--   全ユーザーのウォレットを一括更新する。
--   FOR UPDATE SKIP LOCKED により複数 Edge Function インスタンスが
--   同時実行されても同一ユーザーへの二重付与を防ぐ。
--
--   Edge Function 側の呼び出しイメージ:
--     const { data } = await supabase.rpc('process_weekly_salary')
--
--   Supabase Cron (pg_cron) 設定例:
--     SELECT cron.schedule(
--       'weekly-salary-cron',
--       '0 9 * * 1',  -- 毎週月曜 09:00 UTC
--       'SELECT process_weekly_salary()'
--     );
CREATE OR REPLACE FUNCTION public.process_weekly_salary()
RETURNS TABLE (
  processed_user_id uuid,
  credited_amount   bigint,
  new_balance       bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wallet_row public.user_wallet%ROWTYPE;
  season_str text;
BEGIN
  FOR wallet_row IN
    SELECT *
    FROM public.user_wallet
    WHERE last_payday_at <= now() - INTERVAL '7 days'
    FOR UPDATE SKIP LOCKED
  LOOP
    -- シーズン番号を取得 (進行データがない場合は '1' を使用)
    SELECT COALESCE(season_number::text, '1') INTO season_str
    FROM public.user_story_progress
    WHERE user_id = wallet_row.user_id;

    season_str := COALESCE(season_str, '1');

    -- 残高・統計・最終支給日を更新
    UPDATE public.user_wallet
    SET
      balance        = balance + weekly_salary,
      total_earned   = total_earned + weekly_salary,
      last_payday_at = now()
    WHERE user_id = wallet_row.user_id;

    -- 取引履歴を記録
    INSERT INTO public.wallet_transactions (
      user_id,
      transaction_type,
      amount,
      description_ja
    ) VALUES (
      wallet_row.user_id,
      'salary',
      wallet_row.weekly_salary,
      'シーズン' || season_str || ' 週給支給'
    );

    RETURN QUERY SELECT
      wallet_row.user_id,
      wallet_row.weekly_salary,
      (wallet_row.balance + wallet_row.weekly_salary);
  END LOOP;
END;
$$;

-- authenticated ロールからの直接呼び出しを禁止
-- service_role (Edge Function) 経由のみ許可
REVOKE ALL ON FUNCTION public.process_weekly_salary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_weekly_salary() TO service_role;
