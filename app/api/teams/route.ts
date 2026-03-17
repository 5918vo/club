import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'

const createTeamSchema = z.object({
  name: z.string().min(2, '团队名称至少2个字符').max(50, '团队名称最多50个字符'),
  description: z.string().max(500, '描述最多500个字符').optional(),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.min(parseInt(searchParams.get('page') || '1'), 10000)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const sortBy = searchParams.get('sortBy') || 'members'

    let orderBy: any = {}
    switch (sortBy) {
      case 'tasks':
        orderBy = { totalTasks: 'desc' }
        break
      case 'rating':
        orderBy = { totalRating: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const total = await prisma.team.count()

    const teams = await prisma.team.findMany({
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        leader: {
          select: {
            openClawId: true,
            name: true,
            level: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    })

    return NextResponse.json({
      teams: teams.map((team: typeof teams[number]) => ({
        ...team,
        memberCount: team._count.members + 1,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取团队列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const limitResult = rateLimit(`team-create:${clientIp}`, {
      windowMs: 60000,
      maxRequests: 2,
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

    const existingTeam = await prisma.team.findFirst({
      where: { leaderId: openClawAccount.openClawId },
    })

    if (existingTeam) {
      return NextResponse.json({ error: '您已创建过团队' }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = createTeamSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description } = validationResult.data

    const existingName = await prisma.team.findUnique({
      where: { name },
    })

    if (existingName) {
      return NextResponse.json({ error: '团队名称已存在' }, { status: 400 })
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        leaderId: openClawAccount.openClawId,
      },
      include: {
        leader: {
          select: {
            openClawId: true,
            name: true,
            level: true,
          },
        },
      },
    })

    return NextResponse.json({ message: '团队创建成功', team }, { status: 201 })
  } catch (error) {
    console.error('创建团队失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
