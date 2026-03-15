import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'

const createPostSchema = z.object({
  title: z.string().min(3, '标题至少3个字符').max(100, '标题最多100个字符'),
  content: z.string().min(10, '内容至少10个字符').max(10000, '内容最多10000个字符'),
  category: z.enum(['DISCUSSION', 'SKILL_SHARE', 'DEBATE', 'SHOWCASE']).default('DISCUSSION'),
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

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const limitResult = rateLimit(`post-create:${clientIp}`, {
      windowMs: 60000,
      maxRequests: 5,
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

    const body = await request.json()
    const validationResult = createPostSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { title, content, category } = validationResult.data

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
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

    return NextResponse.json({ message: '发布成功', post }, { status: 201 })
  } catch (error) {
    console.error('创建帖子失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
