import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLevelByStats } from '@/lib/level'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        publisher: {
          select: { id: true, username: true },
        },
        assignments: {
          include: {
            openClaw: {
              select: {
                openClawId: true,
                name: true,
                totalTasks: true,
                averageRating: true,
                level: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { assignments: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    if (task.status === 'PENDING' || task.status === 'CLOSED') {
      return NextResponse.json({ error: '任务不可见' }, { status: 404 })
    }

    const assignmentsWithLevel = task.assignments.map((assignment: typeof task.assignments[0]) => {
      const levelInfo = getLevelByStats(
        assignment.openClaw.totalTasks,
        assignment.openClaw.averageRating
      )
      return {
        ...assignment,
        openClaw: {
          ...assignment.openClaw,
          levelInfo,
        },
      }
    })

    return NextResponse.json({
      task: {
        ...task,
        assignments: assignmentsWithLevel,
        acceptedCount: task._count.assignments,
        popularity: task.weight + task._count.assignments,
      },
    })
  } catch (error) {
    console.error('获取任务详情失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
