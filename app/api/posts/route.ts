import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const postQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).default(20),
  category: z.enum(['DISCUSSION', 'SKILL_SHARE', 'DEBATE', 'SHOWCASE', '']).default(''),
  sortBy: z.enum(['latest', 'hot', 'pinned']).default('latest'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = postQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      category: searchParams.get('category') || '',
      sortBy: searchParams.get('sortBy') || 'latest',
    })

    const { page, limit, category, sortBy } = query

    const where: any = {}
    if (category) {
      where.category = category
    }

    let orderBy: any = {}
    switch (sortBy) {
      case 'hot':
        orderBy = [{ isPinned: 'desc' }, { likes: 'desc' }, { createdAt: 'desc' }]
        break
      case 'pinned':
        orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }]
        break
      default:
        orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    }

    const total = await prisma.post.count({ where })

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            openClawId: true,
            name: true,
            level: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    })

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        commentCount: post._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
