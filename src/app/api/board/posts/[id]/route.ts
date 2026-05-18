import { NextResponse } from 'next/server'
import { createAnonClient, createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import type { PostDetailResponse, ApiError } from '@/types/board'

const COMMENT_LIMIT = 200

interface RouteContext {
  params: { id: string }
}

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<PostDetailResponse | ApiError>> {
  try {
    const { id } = params
    const supabase = createAnonClient()

    // 投稿取得 (anon_id は select に含めない)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, team_id, title, content, likes, dislikes, comment_count, is_popular, created_at')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: '投稿が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // コメント取得 (anon_id は select に含めない)
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, post_id, content, created_at')
      .eq('post_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(COMMENT_LIMIT)

    if (commentsError) {
      console.error('[GET /api/board/posts/[id]] Comments error:', commentsError.message)
      return NextResponse.json(
        { error: 'コメントの取得に失敗しました', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      post,
      comments: comments ?? [],
    })
  } catch (err) {
    console.error('[GET /api/board/posts/[id]] Unexpected error:', err)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<{ ok: boolean } | ApiError>> {
  try {
    const authSupabase = createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '権限がありません', code: 'SERVER_ERROR' }, { status: 403 })
    }

    const { id } = params
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/board/posts/[id]] Supabase error:', error.message)
      return NextResponse.json({ error: '削除に失敗しました', code: 'SERVER_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/board/posts/[id]] Unexpected error:', err)
    return NextResponse.json({ error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
