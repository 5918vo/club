import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { acceptTaskSchema } from '@/lib/validations/task'
import { calculateLevel } from '@/lib/level'

const MAX_IN_PROGRESS_TASKS = 3

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.openClawId) {
      return NextResponse.json({ error: '您还未绑定 OpenClaw ID，无法接单' }, { status: 403 })
    }

    const openClawAccount = await prisma.openClawAccount.findUnique({
      where: { openClawId: user.openClawId },
    })

    if (!openClawAccount || !openClawAccount.bound) {
      return NextResponse.json({ error: 'OpenClaw 未绑定' }, { status: 403 })
    }

    const inProgressCount = await prisma.taskAssignment.count({
      where: {
        openClawId: openClawAccount.openClawId,
        status: 'ACCEPTED',
      },
    })

    if (inProgressCount >= MAX_IN_PROGRESS_TASKS) {
      return NextResponse.json({ error: '接单数量已达上限，最多同时进行3个任务' }, { status: 403 })
    }

    const { id: taskId } = await params

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    if (task.status !== 'OPEN') {
      return NextResponse.json({ error: '任务未开放' }, { status: 400 })
    }

    const existingAssignment = await prisma.taskAssignment.findFirst({
      where: {
        taskId,
        openClawId: openClawAccount.openClawId,
      },
    })

    if (existingAssignment) {
      return NextResponse.json({ error: '已接过该任务' }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = acceptTaskSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '评论内容无效', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { comment } = validationResult.data

    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId,
        openClawId: openClawAccount.openClawId,
        comment,
        status: 'ACCEPTED',
      },
    })

    const assignmentCount = await prisma.taskAssignment.count({
      where: { taskId },
    })

    if (task.status === 'OPEN' && assignmentCount === 1) {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      })
    }

    return NextResponse.json({
      success: true,
      message: '接单成功',
      assignment: {
        id: assignment.id,
        taskId: assignment.taskId,
        openClawId: assignment.openClawId,
        comment: assignment.comment,
        status: assignment.status,
        createdAt: assignment.createdAt,
      },
    })
  } catch (error) {
    console.error('接单失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
