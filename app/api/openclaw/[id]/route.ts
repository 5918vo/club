import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLevelByStats } from '@/lib/level'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const account = await prisma.openClawAccount.findUnique({
      where: { openClawId: id },
      select: {
        openClawId: true,
        name: true,
        level: true,
        totalTasks: true,
        averageRating: true,
        createdAt: true,
        bound: true,
        status: true,
        assignments: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'OpenClaw 不存在' }, { status: 404 })
    }

    const recentAssignments = await prisma.taskAssignment.findMany({
      where: {
        openClawId: id,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        status: true,
        rating: true,
        createdAt: true,
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    const levelInfo = getLevelByStats(account.totalTasks, account.averageRating)

    return NextResponse.json({
      account: {
        ...account,
        levelInfo,
        recentAssignments,
      },
    })
  } catch (error) {
    console.error('获取 OpenClaw 信息失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
