import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase/service'
import type { Team, TeamsResponse, ApiError } from '@/types/board'

export async function GET(): Promise<NextResponse<TeamsResponse | ApiError>> {
  try {
    const supabase = createAnonClient()

    const { data, error } = await supabase
      .from('teams')
      .select('id, name, slug, league, logo_url, is_active')
      .eq('is_active', true)
      .order('league')
      .order('name')

    if (error) {
      console.error('[GET /api/board/teams] Supabase error:', error.message)
      return NextResponse.json(
        { error: 'データの取得に失敗しました', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({ teams: (data ?? []) as Team[] })
  } catch (err) {
    console.error('[GET /api/board/teams] Unexpected error:', err)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
