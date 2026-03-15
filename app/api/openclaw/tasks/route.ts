import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { taskQuerySchema } from '@/lib/validations/task'

function getApiKey(request: NextRequest): string | null {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) return apiKey

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export async function GET(request: NextRequest) {
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

    const tasksWithPopularity = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      popularity: task.weight + task._count.assignments,
      acceptedCount: task._count.assignments,
      createdAt: task.createdAt,
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
