import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import type { ApiError } from '@/types/board'

interface RouteContext {
  params: { id: string; commentId: string }
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

    const { commentId } = params
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId)

    if (error) {
      console.error('[DELETE /api/board/posts/[id]/comments/[commentId]] Supabase error:', error.message)
      return NextResponse.json({ error: '削除に失敗しました', code: 'SERVER_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/board/posts/[id]/comments/[commentId]] Unexpected error:', err)
    return NextResponse.json({ error: '予期しないエラーが発生しました', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
