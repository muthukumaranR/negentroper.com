import { NextRequest, NextResponse } from 'next/server'
import { db, content } from '@/lib/database'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateContentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(500).optional(),
  type: z.enum(['writing', 'page', 'snippet']).optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result] = await db
      .select()
      .from(content)
      .where(eq(content.id, params.id))

    if (!result) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateContentSchema.parse(body)

    const [updatedContent] = await db
      .update(content)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(content.id, params.id))
      .returning()

    if (!updatedContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedContent)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [deletedContent] = await db
      .delete(content)
      .where(eq(content.id, params.id))
      .returning()

    if (!deletedContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}