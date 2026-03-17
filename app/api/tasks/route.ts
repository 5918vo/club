import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createTaskSchema, taskQuerySchema } from '@/lib/validations/task'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = taskQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'popularity',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    const where: any = {
      status: { in: ['OPEN', 'IN_PROGRESS', 'COMPLETED'] },
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }

    const total = await prisma.task.count({ where })

    const tasks = await prisma.task.findMany({
      where,
      include: {
        publisher: {
          select: { id: true, username: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: query.sortBy === 'popularity'
        ? [{ weight: query.sortOrder }]
        : [{ createdAt: query.sortOrder }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    })

    const tasksWithPopularity = tasks.map((task: typeof tasks[number]) => ({
      ...task,
      acceptedCount: task._count.assignments,
      popularity: task.weight + task._count.assignments,
    }))

    return NextResponse.json({
      tasks: tasksWithPopularity,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createTaskSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { title, description } = validationResult.data

    const task = await prisma.task.create({
      data: {
        title,
        description,
        publisherId: decoded.userId,
        status: 'PENDING',
      },
      include: {
        publisher: {
          select: { id: true, username: true },
        },
      },
    })

    return NextResponse.json(
      { message: '任务创建成功，等待审核', task },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
