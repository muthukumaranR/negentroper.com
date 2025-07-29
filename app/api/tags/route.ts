import { NextResponse } from 'next/server';
import { ContentManager } from '@/lib/cms/content-manager';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const cms = ContentManager.getInstance();
    const tags = await cms.getAllTags();
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}