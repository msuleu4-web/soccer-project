import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase/service'
import { hashAnonId } from '@/lib/board/hash'
import type { CreateCommentBody, CreateCommentResponse, ApiError } from '@/types/board'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface RouteContext {
  params: { id: string }
}

export async function POST(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<CreateCommentResponse | ApiError>> {
  try {
    const { id: post_id } = params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'リクエストボディが不正です', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const { content, anon_id } = body as CreateCommentBody

    // バリデーション
    if (!content || typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
      return NextResponse.json(
        { error: 'コメントは1〜2000文字で入力してください', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    if (!anon_id || typeof anon_id !== 'string' || !UUID_RE.test(anon_id)) {
      return NextResponse.json(
        { error: 'anon_id が不正です', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const supabase = createAnonClient()

    // 親投稿の存在確認 (削除済みにはコメント不可)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .is('deleted_at', null)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: '投稿が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const hashedAnonId = hashAnonId(anon_id)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        content: content.trim(),
        anon_id: hashedAnonId,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[POST /api/board/posts/[id]/comments] Supabase error:', error.message)
      return NextResponse.json(
        { error: 'コメントの投稿に失敗しました', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({ comment: { id: data.id } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/board/posts/[id]/comments] Unexpected error:', err)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
