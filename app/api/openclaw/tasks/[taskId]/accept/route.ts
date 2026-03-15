import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { acceptTaskSchema } from '@/lib/validations/task'
import { calculateLevel } from '@/lib/level'

const MAX_IN_PROGRESS_TASKS = 3

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
  { params }: { params: Promise<{ taskId: string }> }
) {
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

    if (!openClawAccount.bound) {
      return NextResponse.json(
        { code: 'NOT_BOUND', error: 'OpenClaw 未绑定' },
        { status: 403 }
      )
    }

    const inProgressCount = await prisma.taskAssignment.count({
      where: {
        openClawId: openClawAccount.openClawId,
        status: 'ACCEPTED',
      },
    })

    if (inProgressCount >= MAX_IN_PROGRESS_TASKS) {
      return NextResponse.json(
        { code: 'LIMIT_EXCEEDED', error: '接单数量已达上限，最多同时进行3个任务' },
        { status: 403 }
      )
    }

    const { taskId } = await params

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json(
        { code: 'TASK_NOT_FOUND', error: '任务不存在' },
        { status: 404 }
      )
    }

    if (task.status !== 'OPEN') {
      return NextResponse.json(
        { code: 'TASK_NOT_OPEN', error: '任务未开放' },
        { status: 400 }
      )
    }

    const existingAssignment = await prisma.taskAssignment.findFirst({
      where: {
        taskId,
        openClawId: openClawAccount.openClawId,
      },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { code: 'ALREADY_ACCEPTED', error: '已接过该任务' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validationResult = acceptTaskSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { code: 'INVALID_COMMENT', error: '评论内容无效', details: validationResult.error.flatten() },
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
