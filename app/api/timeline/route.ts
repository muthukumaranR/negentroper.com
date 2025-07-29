import { NextResponse } from 'next/server';
import { ContentManager } from '@/lib/cms/content-manager';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const cms = ContentManager.getInstance();
    const timeline = await cms.getTimeline();
    
    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}