import { createClient } from '@supabase/supabase-js'

// Next.js Data Cache がレスポンスをキャッシュしないよう cache: 'no-store' を指定する。
// これがないと、コメント投稿後の再取得で古いデータ(空配列)が返り続けるバグが発生する。
const noStoreOptions = {
  global: {
    fetch: (url: RequestInfo | URL, options: RequestInit = {}) =>
      fetch(url, { ...options, cache: 'no-store' }),
  },
}

// 掲示板 API ルート専用：anon キー使用、RLS が適用される。SELECT / INSERT に使用。
export const createAnonClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    noStoreOptions
  )

// 掲示板 API ルート専用：service_role キー使用、RLS をバイパスする。
// ソフトデリート (UPDATE deleted_at) にのみ使用。このファイル以外で SUPABASE_SERVICE_ROLE_KEY を参照禁止。
export const createServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    noStoreOptions
  )
