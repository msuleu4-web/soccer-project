import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase/service'
import type { PostSummary, PostsResponse, ApiError } from '@/types/board'

const DEFAULT_LIMIT = 20
const MAX_LIMIT     = 50

interface RouteContext {
  params: { slug: string }
}

export async function GET(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<PostsResponse | ApiError>> {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)

    const tab   = searchParams.get('tab') === 'popular' ? 'popular' : 'latest'
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)))
    const offset = (page - 1) * limit

    const supabase = createAnonClient()

    // slug → team_id を解決
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'チームが見つかりません', code: 'TEAM_NOT_FOUND' },
        { status: 404 }
      )
    }

    let query = supabase
      .from('posts')
      .select(
        'id, team_id, title, likes, dislikes, comment_count, is_popular, created_at',
        { count: 'exact' }
      )
      .eq('team_id', team.id)
      .is('deleted_at', null)

    if (tab === 'popular') {
      query = query.eq('is_popular', true).order('likes', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('[GET /api/board/teams/[slug]/posts] Supabase error:', error.message)
      return NextResponse.json(
        { error: 'データの取得に失敗しました', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts: (data ?? []) as PostSummary[],
      total: count ?? 0,
    })
  } catch (err) {
    console.error('[GET /api/board/teams/[slug]/posts] Unexpected error:', err)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
