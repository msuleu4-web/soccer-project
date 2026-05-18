import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supa = createServiceClient();
  await supa.rpc('increment_share_count', { sim_id: params.id });
  return NextResponse.json({ ok: true });
}
