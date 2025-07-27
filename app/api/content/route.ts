import { NextRequest, NextResponse } from 'next/server'
import { db, content } from '@/lib/database'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const createContentSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  type: z.enum(['writing', 'page', 'snippet']),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = db.select().from(content)

    // Apply filters
    const conditions = []
    if (type) conditions.push(eq(content.type, type as any))
    if (status) conditions.push(eq(content.status, status as any))

    if (conditions.length > 0) {
      query = query.where(conditions.reduce((acc, condition) => acc && condition))
    }

    const results = await query
      .orderBy(desc(content.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        limit,
        hasMore: results.length === limit,
      },
    })
  } catch (error) {
    console.error('Failed to fetch content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createContentSchema.parse(body)

    const [newContent] = await db
      .insert(content)
      .values({
        ...validatedData,
        // In a real app, get userId from session
        userId: null,
      })
      .returning()

    return NextResponse.json(newContent, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}