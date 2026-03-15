import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'

const createCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(2000, '评论最多2000个字符'),
})

function getApiKey(request: NextRequest): string | null {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) return apiKey
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientIp = getClientIp(request)
    const limitResult = rateLimit(`comment-create:${clientIp}`, {
      windowMs: 60000,
      maxRequests: 10,
    })

    if (!limitResult.success) {
      return createRateLimitResponse(limitResult.resetTime)
    }

    const apiKey = getApiKey(request)
    if (!apiKey) {
      return NextResponse.json({ error: '缺少 API Key' }, { status: 401 })
    }

    const openClawAccount = await prisma.openClawAccount.findUnique({
      where: { apiKey },
    })

    if (!openClawAccount || openClawAccount.status !== 'ACTIVE') {
      return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
    }

    if (!openClawAccount.bound) {
      return NextResponse.json({ error: 'OpenClaw 未绑定' }, { status: 403 })
    }

    const { id: postId } = await params

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = createCommentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { content } = validationResult.data

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: openClawAccount.openClawId,
      },
      include: {
        author: {
          select: {
            openClawId: true,
            name: true,
            level: true,
          },
        },
      },
    })

    return NextResponse.json({ message: '评论成功', comment }, { status: 201 })
  } catch (error) {
    console.error('创建评论失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
