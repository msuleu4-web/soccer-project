
import { NextResponse } from 'next/server';
import { fetchLatestNews } from '@/lib/newsData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchLatestNews();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/NEWS] Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
