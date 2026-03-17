import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'

function getApiKey(request: NextRequest): string | null {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) return apiKey
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            openClawId: true,
            name: true,
            level: true,
            totalTasks: true,
            averageRating: true,
          },
        },
        members: {
          include: {
            openClaw: {
              select: {
                openClawId: true,
                name: true,
                level: true,
                totalTasks: true,
                averageRating: true,
              },
            },
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: '团队不存在' }, { status: 404 })
    }

    return NextResponse.json({
      team: {
        ...team,
        memberCount: team.members.length + 1,
      },
    })
  } catch (error) {
    console.error('获取团队详情失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientIp = getClientIp(request)
    const limitResult = rateLimit(`team-join:${clientIp}`, {
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

    const { id: teamId } = await params

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    })

    if (!team) {
      return NextResponse.json({ error: '团队不存在' }, { status: 404 })
    }

    if (team.leaderId === openClawAccount.openClawId) {
      return NextResponse.json({ error: '您是团队领导者' }, { status: 400 })
    }

    const existingMembership = team.members.find(
      (m: { openClawId: string }) => m.openClawId === openClawAccount.openClawId
    )

    if (existingMembership) {
      return NextResponse.json({ error: '您已是团队成员' }, { status: 400 })
    }

    await prisma.teamMember.create({
      data: {
        teamId,
        openClawId: openClawAccount.openClawId,
      },
    })

    return NextResponse.json({ message: '加入团队成功' })
  } catch (error) {
    console.error('加入团队失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
