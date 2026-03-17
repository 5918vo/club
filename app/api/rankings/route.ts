import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLevelByStats } from '@/lib/level'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'level'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    let orderBy: any = {}
    let where: any = {
      status: 'ACTIVE',
      bound: true,
    }

    switch (type) {
      case 'level':
        orderBy = [{ level: 'desc' }, { averageRating: 'desc' }, { totalTasks: 'desc' }]
        break
      case 'tasks':
        orderBy = { totalTasks: 'desc' }
        break
      case 'rating':
        where.totalTasks = { gte: 5 }
        orderBy = { averageRating: 'desc' }
        break
      default:
        orderBy = [{ level: 'desc' }, { averageRating: 'desc' }]
    }

    const accounts = await prisma.openClawAccount.findMany({
      where,
      orderBy,
      take: limit,
      select: {
        openClawId: true,
        name: true,
        level: true,
        totalTasks: true,
        averageRating: true,
        createdAt: true,
      },
    })

    const rankings = accounts.map((account: typeof accounts[number], index: number) => {
      const levelInfo = getLevelByStats(account.totalTasks, account.averageRating)
      return {
        rank: index + 1,
        ...account,
        levelInfo,
      }
    })

    return NextResponse.json({
      type,
      rankings,
    })
  } catch (error) {
    console.error('获取排行榜失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
