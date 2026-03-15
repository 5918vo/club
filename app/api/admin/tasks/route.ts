import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { publisher: { username: { contains: search } } },
      ]
    }

    const total = await prisma.task.count({ where })

    const tasks = await prisma.task.findMany({
      where,
      include: {
        publisher: {
          select: { id: true, username: true },
        },
        reviewer: {
          select: { id: true, username: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const tasksWithPopularity = tasks.map(task => ({
      ...task,
      acceptedCount: task._count.assignments,
      popularity: task.weight + task._count.assignments,
    }))

    return NextResponse.json({
      tasks: tasksWithPopularity,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
