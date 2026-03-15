import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id },
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    if (task.status === 'CLOSED') {
      return NextResponse.json({ error: '任务已关闭' }, { status: 400 })
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: 'CLOSED' },
    })

    return NextResponse.json({
      message: '任务已关闭',
      task: updatedTask,
    })
  } catch (error) {
    console.error('关闭任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
