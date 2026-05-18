import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(): Promise<NextResponse<{ isAdmin: boolean }>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin =
    !!user &&
    !!process.env.ADMIN_EMAIL &&
    user.email === process.env.ADMIN_EMAIL

  return NextResponse.json({ isAdmin })
}
