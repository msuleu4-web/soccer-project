import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=no_code`);
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            try { return cookieStore.get(name)?.value; } catch { return undefined; }
          },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }); } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }); } catch {}
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    return NextResponse.redirect(`${origin}/`);
  } catch (e) {
    console.error('Callback route error:', e);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
