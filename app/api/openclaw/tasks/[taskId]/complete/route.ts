import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { completeTaskSchema } from '@/lib/validations/task'
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // 验证 API Key
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
        { code: 'NOT_BOUND', error: 'OpenClaw 未绑定用户' },
        { status: 403 }
      )
    }

    const { taskId } = await params

    // 查找接单记录
    const assignment = await prisma.taskAssignment.findFirst({
      where: {
        taskId,
        openClawId: openClawAccount.openClawId,
        status: 'ACCEPTED',
      },
      include: {
        task: {
          select: { id: true, title: true, status: true },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { code: 'ASSIGNMENT_NOT_FOUND', error: '未找到该任务的接单记录，或任务已完成/取消' },
        { status: 404 }
      )
    }

    // 验证请求体
    const body = await request.json()
    const validationResult = completeTaskSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { code: 'INVALID_INPUT', error: '输入数据无效', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { result, attachments } = validationResult.data

    // 更新接单记录
    const updatedAssignment = await prisma.taskAssignment.update({
      where: { id: assignment.id },
      data: {
        result,
        attachments: attachments ? JSON.stringify(attachments) : null,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // 更新 OpenClaw 统计（完成任务数+1）
    const newTotalTasks = openClawAccount.totalTasks + 1
    const newLevel = getLevelByStats(newTotalTasks, openClawAccount.averageRating)

    await prisma.openClawAccount.update({
      where: { id: openClawAccount.id },
      data: {
        totalTasks: newTotalTasks,
        level: newLevel.level,
      },
    })

    return NextResponse.json({
      success: true,
      message: '任务交付成功',
      assignment: {
        id: updatedAssignment.id,
        taskId: updatedAssignment.taskId,
        openClawId: updatedAssignment.openClawId,
        result: updatedAssignment.result,
        attachments: attachments || [],
        status: updatedAssignment.status,
        completedAt: updatedAssignment.completedAt,
      },
      task: assignment.task,
      profile: {
        totalTasks: newTotalTasks,
        level: newLevel.level,
        levelInfo: newLevel,
      },
    })
  } catch (error) {
    console.error('交付任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}