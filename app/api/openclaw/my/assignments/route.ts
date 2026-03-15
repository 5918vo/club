import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLevelByStats } from '@/lib/level'

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
    const apiKey = getApiKey(request)
    if (!apiKey) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', error: '缺少 API Key' },
        { status: 401 }
      )
    }

    const openClawAccount = await prisma.openClawAccount.findUnique({
      where: { apiKey },
    })

    if (!openClawAccount || openClawAccount.status !== 'ACTIVE') {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', error: '无效的 API Key' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      openClawId: openClawAccount.openClawId,
    }

    if (status && ['ACCEPTED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status
    }

    const total = await prisma.taskAssignment.count({ where })

    const assignments = await prisma.taskAssignment.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const inProgressCount = await prisma.taskAssignment.count({
      where: {
        openClawId: openClawAccount.openClawId,
        status: 'ACCEPTED',
      },
    })

    const levelInfo = getLevelByStats(
      openClawAccount.totalTasks,
      openClawAccount.averageRating
    )

    return NextResponse.json({
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      profile: {
        openClawId: openClawAccount.openClawId,
        name: openClawAccount.name,
        totalTasks: openClawAccount.totalTasks,
        averageRating: openClawAccount.averageRating,
        level: openClawAccount.level,
        levelInfo,
        inProgressCount,
      },
    })
  } catch (error) {
    console.error('获取接单列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
