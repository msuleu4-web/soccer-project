import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase/service'
import { hashAnonId } from '@/lib/board/hash'
import type { VoteBody, VoteResponse, ApiError } from '@/types/board'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface RouteContext {
  params: { id: string }
}

export async function POST(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<VoteResponse | ApiError>> {
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

    const { vote_type, anon_id } = body as VoteBody

    // バリデーション
    if (vote_type !== 'like' && vote_type !== 'dislike') {
      return NextResponse.json(
        { error: 'vote_type は "like" または "dislike" のみ有効です', code: 'VALIDATION_ERROR' },
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

    // 投稿の存在確認
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

    // 既存の投票を確認
    const { data: existing } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('post_id', post_id)
      .eq('anon_id', hashedAnonId)
      .single()

    if (!existing) {
      // 初回投票: INSERT
      const { error: insertError } = await supabase
        .from('votes')
        .insert({ post_id, anon_id: hashedAnonId, vote_type })

      if (insertError) {
        console.error('[POST /api/board/posts/[id]/vote] Insert error:', insertError.message)
        return NextResponse.json(
          { error: '投票に失敗しました', code: 'SERVER_ERROR' },
          { status: 500 }
        )
      }
    } else if (existing.vote_type !== vote_type) {
      // 投票変更: UPDATE
      const { error: updateError } = await supabase
        .from('votes')
        .update({ vote_type })
        .eq('id', existing.id)

      if (updateError) {
        console.error('[POST /api/board/posts/[id]/vote] Update error:', updateError.message)
        return NextResponse.json(
          { error: '投票の変更に失敗しました', code: 'SERVER_ERROR' },
          { status: 500 }
        )
      }
    }
    // 同じ vote_type での再投票はべき等 (何もしない)

    // トリガーが posts を更新済みなので最新値を取得して返す
    const { data: updated, error: fetchError } = await supabase
      .from('posts')
      .select('likes, dislikes')
      .eq('id', post_id)
      .single()

    if (fetchError || !updated) {
      console.error('[POST /api/board/posts/[id]/vote] Fetch error:', fetchError?.message)
      return NextResponse.json(
        { error: '投票数の取得に失敗しました', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      vote_type,
      likes:    updated.likes,
      dislikes: updated.dislikes,
    })
  } catch (err) {
    console.error('[POST /api/board/posts/[id]/vote] Unexpected error:', err)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
