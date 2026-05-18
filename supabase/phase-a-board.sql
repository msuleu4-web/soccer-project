-- =====================================================
-- Goal Labo 匿名掲示板 Phase A
-- テーブル作成 + インデックス + トリガー + RLS + 初期データ
--
-- 使い方:
--   Supabase ダッシュボード > SQL Editor にこのファイルの内容を
--   貼り付けて「Run」ボタンを押す。
-- =====================================================


-- ─────────────────────────────────────────────────────
-- 1. teams
-- ─────────────────────────────────────────────────────
CREATE TABLE public.teams (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  slug            text        NOT NULL UNIQUE,
  league          text        NOT NULL,
  logo_url        text,
  thesportsdb_id  integer     UNIQUE,   -- TheSportsDB の idTeam (将来連携用、任意)
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────
-- 2. posts
-- ─────────────────────────────────────────────────────
CREATE TABLE public.posts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid        NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  title         text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  content       text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 10000),
  anon_id       varchar(64) NOT NULL,    -- サーバー側 SHA-256 ハッシュ (hex 64文字)
  likes         integer     NOT NULL DEFAULT 0,
  dislikes      integer     NOT NULL DEFAULT 0,
  comment_count integer     NOT NULL DEFAULT 0,
  is_popular    boolean     NOT NULL DEFAULT false,
  deleted_at    timestamptz,             -- NULL = 表示中、値あり = 削除済み
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_team_id_created_at_idx
  ON public.posts(team_id, created_at DESC);

CREATE INDEX posts_popular_idx
  ON public.posts(team_id, is_popular)
  WHERE is_popular = true AND deleted_at IS NULL;


-- ─────────────────────────────────────────────────────
-- 3. comments
-- ─────────────────────────────────────────────────────
CREATE TABLE public.comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  anon_id    varchar(64) NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX comments_post_id_created_at_idx
  ON public.comments(post_id, created_at ASC);


-- ─────────────────────────────────────────────────────
-- 4. votes
-- ─────────────────────────────────────────────────────
CREATE TABLE public.votes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  anon_id    varchar(64) NOT NULL,
  vote_type  text        NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, anon_id)             -- 1ブラウザにつき1投票
);


-- =====================================================
-- トリガー関数
-- =====================================================

-- comment_count 自動更新
CREATE OR REPLACE FUNCTION public.fn_update_comment_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
      SET comment_count = comment_count + 1
      WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
      SET comment_count = GREATEST(comment_count - 1, 0)
      WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.fn_update_comment_count();


-- likes / dislikes / is_popular 自動更新
-- is_popular 判定: likes >= 10
CREATE OR REPLACE FUNCTION public.fn_update_post_votes()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_post_id uuid;
  v_likes   bigint;
BEGIN
  v_post_id := COALESCE(NEW.post_id, OLD.post_id);

  SELECT COUNT(*) INTO v_likes
    FROM public.votes
    WHERE post_id = v_post_id AND vote_type = 'like';

  UPDATE public.posts
    SET
      likes      = v_likes,
      dislikes   = (SELECT COUNT(*) FROM public.votes
                    WHERE post_id = v_post_id AND vote_type = 'dislike'),
      is_popular = (v_likes >= 10)
    WHERE id = v_post_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_post_votes
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.fn_update_post_votes();


-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.teams    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes    ENABLE ROW LEVEL SECURITY;

-- teams: SELECT のみ公開。書き込みはダッシュボードから手動管理
CREATE POLICY "teams_select_all"
  ON public.teams FOR SELECT
  USING (true);

-- posts: 削除されていない投稿のみ SELECT 可
CREATE POLICY "posts_select_active"
  ON public.posts FOR SELECT
  USING (deleted_at IS NULL);

-- posts: 全員 INSERT 可
CREATE POLICY "posts_insert_all"
  ON public.posts FOR INSERT
  WITH CHECK (true);

-- posts: UPDATE / DELETE は RLS レベルで全 DENY
-- → API ルートが service_role キーで RLS をバイパスして操作する

-- comments: 削除されていないコメントのみ SELECT 可
CREATE POLICY "comments_select_active"
  ON public.comments FOR SELECT
  USING (deleted_at IS NULL);

-- comments: 全員 INSERT 可
CREATE POLICY "comments_insert_all"
  ON public.comments FOR INSERT
  WITH CHECK (true);

-- comments: UPDATE / DELETE は RLS レベルで全 DENY (同上)

-- votes: SELECT / INSERT / UPDATE を公開
CREATE POLICY "votes_select_all"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "votes_insert_all"
  ON public.votes FOR INSERT
  WITH CHECK (true);

-- 投票変更 (推薦 → 非推薦 など) は UPDATE で対応
CREATE POLICY "votes_update_all"
  ON public.votes FOR UPDATE
  USING (true);

-- votes の DELETE は DENY (完全撤回は今回スコープ外)


-- =====================================================
-- 初期データ: チーム
-- =====================================================

INSERT INTO public.teams (name, slug, league) VALUES
  -- Premier League
  ('マンチェスター・ユナイテッド', 'man-utd',       'Premier League'),
  ('マンチェスター・シティ',       'man-city',      'Premier League'),
  ('アーセナル',                   'arsenal',       'Premier League'),
  ('リヴァプール',                 'liverpool',     'Premier League'),
  ('チェルシー',                   'chelsea',       'Premier League'),
  ('トッテナム',                   'tottenham',     'Premier League'),
  ('アストン・ヴィラ',             'aston-villa',   'Premier League'),
  ('ニューカッスル',               'newcastle',     'Premier League'),
  ('ウェストハム',                 'west-ham',      'Premier League'),
  ('エヴァートン',                 'everton',       'Premier League'),
  -- J1リーグ
  ('川崎フロンターレ',             'kawasaki',      'J1リーグ'),
  ('横浜F・マリノス',              'yokohama-fm',   'J1リーグ'),
  ('浦和レッズ',                   'urawa',         'J1リーグ'),
  ('鹿島アントラーズ',             'kashima',       'J1リーグ'),
  ('町田ゼルビア',                 'machida',       'J1リーグ'),
  ('セレッソ大阪',                 'cerezo',        'J1リーグ'),
  ('ガンバ大阪',                   'gamba',         'J1リーグ'),
  ('サンフレッチェ広島',           'sanfrecce',     'J1リーグ'),
  ('ヴィッセル神戸',               'vissel',        'J1リーグ'),
  ('名古屋グランパス',             'nagoya',        'J1リーグ');