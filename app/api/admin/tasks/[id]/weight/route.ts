import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const weightSchema = z.object({
  weight: z.number().int().min(0).max(1000),
})

export async function PATCH(
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

    const body = await request.json()
    const validationResult = weightSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: '权重值无效' }, { status: 400 })
    }

    const { weight } = validationResult.data

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { weight },
    })

    return NextResponse.json({
      message: '权重已更新',
      task: updatedTask,
    })
  } catch (error) {
    console.error('更新权重失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
