import { NextRequest, NextResponse } from 'next/server';
import { ContentManager } from '@/lib/cms/content-manager';
import { ContentFilter } from '@/lib/cms/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filter: ContentFilter = {
      type: searchParams.get('type') as any,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      category: searchParams.get('category') || undefined,
      featured: searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined,
      draft: searchParams.get('draft') ? searchParams.get('draft') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };
    
    const cms = ContentManager.getInstance();
    const content = await cms.getAllContent(filter);
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json();
    
    if (!type || !['writing', 'project'].includes(type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }
    
    const cms = ContentManager.getInstance();
    await cms.saveContent(content, type);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}