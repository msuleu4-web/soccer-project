import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
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

    // service client で RLS をバイパス（votes テーブルへの読み書きに必要）
    const supabase = createServiceClient()

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
    } else if (existing.vote_type === vote_type) {
      // 同じボタンを再クリック → 投票取消 (DELETE)
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('id', existing.id)

      if (deleteError) {
        console.error('[POST /api/board/posts/[id]/vote] Delete error:', deleteError.message)
        return NextResponse.json(
          { error: '投票の取消に失敗しました', code: 'SERVER_ERROR' },
          { status: 500 }
        )
      }
    } else {
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

    // votes テーブルから集計して posts を直接更新
    const { data: voteCounts, error: countError } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', post_id)

    if (countError) {
      console.error('[POST /api/board/posts/[id]/vote] Count error:', countError.message)
      return NextResponse.json(
        { error: '投票数の集計に失敗しました', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }

    const likes    = voteCounts?.filter(v => v.vote_type === 'like').length    ?? 0
    const dislikes = voteCounts?.filter(v => v.vote_type === 'dislike').length ?? 0

    // posts の likes/dislikes を更新
    await supabase
      .from('posts')
      .update({ likes, dislikes })
      .eq('id', post_id)

    // 取消の場合は vote_type: null を返す
    const wasCancel = existing?.vote_type === vote_type
    return NextResponse.json({ vote_type: wasCancel ? null : vote_type, likes, dislikes })
  } catch (err) {
    console.error('[POST /api/board/posts/[id]/vote] Unexpected error:', err)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
