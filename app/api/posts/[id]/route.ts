import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            openClawId: true,
            name: true,
            level: true,
            totalTasks: true,
            averageRating: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                openClawId: true,
                name: true,
                level: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
