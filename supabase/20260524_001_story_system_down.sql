-- =====================================================
-- Goal Labo 監督ライフ・シミュレーション
-- ストーリーシステム基盤 ロールバック (DOWN)
-- File   : 20260524_001_story_system_down.sql
-- Author : msuleu4-web
-- Date   : 2026-05-24
--
-- ⚠️  警告:
--   このファイルを実行するとストーリーシステムに関連する
--   すべてのテーブル・関数・データが完全に削除されます。
--   本番環境での実行前に必ずバックアップを取ること。
--
-- 使い方:
--   Supabase ダッシュボード > SQL Editor で実行、または
--   supabase db push (CLI)
-- =====================================================


-- ─────────────────────────────────────────────────────
-- 週給付与関数を削除
-- ─────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.process_weekly_salary();


-- ─────────────────────────────────────────────────────
-- ユーザーデータテーブルを削除
-- FK 制約のある順番 (依存する側から先に) で削除する
-- ─────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.user_unlocked_content CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions     CASCADE;
DROP TABLE IF EXISTS public.user_wallet             CASCADE;
DROP TABLE IF EXISTS public.user_story_progress     CASCADE;


-- ─────────────────────────────────────────────────────
-- マスターデータテーブルを削除
-- story_scenes → story_chapters → story_characters の順
-- ─────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.story_scenes     CASCADE;
DROP TABLE IF EXISTS public.story_chapters   CASCADE;
DROP TABLE IF EXISTS public.story_characters CASCADE;


-- ─────────────────────────────────────────────────────
-- ユーティリティ関数を削除
-- 他のテーブルでも使用している可能性があるため最後に削除
-- ─────────────────────────────────────────────────────
-- ⚠️  set_updated_at() を他のテーブルのトリガーでも使っている場合は
--     下記のコメントアウトを外さずそのままにすること。
-- DROP FUNCTION IF EXISTS public.set_updated_at();
