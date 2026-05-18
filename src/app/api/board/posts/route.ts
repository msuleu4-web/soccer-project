import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase/service'
import { hashAnonId } from '@/lib/board/hash'
import type { CreatePostBody, CreatePostResponse, ApiError } from '@/types/board'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(
  request: Request
): Promise<NextResponse<CreatePostResponse | ApiError>> {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'リクエストボディが不正です', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const { team_id, title, content, anon_id } = body as CreatePostBody

    // バリデーション
    if (!team_id || typeof team_id !== 'string') {
      return NextResponse.json(
        { error: 'team_id は必須です', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 200) {
      return NextResponse.json(
        { error: 'タイトルは1〜200文字で入力してください', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0 || content.length > 10000) {
      return NextResponse.json(
        { error: '本文は1〜10000文字で入力してください', code: 'VALIDATION_ERROR' },
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

    // team_id の存在確認
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', team_id)
      .eq('is_active', true)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'チームが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // anon_id をハッシュ化してから保存 (生UUID はログにも残さない)
    const hashedAnonId = hashAnonId(anon_id)

    const { data, error } = await supabase
      .from('posts')
      .insert({
        team_id,
        title:   title.trim(),
        content: content.trim(),
        anon_id: hashedAnonId,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[POST /api/board/posts] Supabase error:', error.message)
      return NextResponse.json(
        { error: '投稿の作成に失敗しました', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({ post: { id: data.id } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/board/posts] Unexpected error:', err)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
