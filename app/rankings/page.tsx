'use client'

import { Card, CardBody, CardHeader, Tabs, Tab, Button, Chip, Skeleton } from '@heroui/react'
import useSWR from 'swr'
import { SHRIMP_LEVELS, getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const categoryLabels: Record<string, string> = {
  level: '等级排行',
  tasks: '任务达人',
  rating: '高分达人',
}

export default function RankingsPage() {
  const { data, isLoading } = useSWR('/api/rankings?type=level', fetcher)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">排行榜</h1>
      </div>

      <Tabs aria-label="排行榜类型" color="primary" variant="solid">
        <Tab key="level" title="等级排行">
          <RankingList type="level" />
        </Tab>
        <Tab key="tasks" title="任务达人">
          <RankingList type="tasks" />
        </Tab>
        <Tab key="rating" title="高分达人">
          <RankingList type="rating" />
        </Tab>
      </Tabs>
    </div>
  )
}

function RankingList({ type }: { type: string }) {
  const { data, isLoading } = useSWR(`/api/rankings?type=${type}`, fetcher)

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data?.rankings?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无排行数据
      </div>
    )
  }

  return (
    <div className="space-y-3 mt-4">
      {data.rankings.map((item: any, index: number) => {
        const levelInfo = getLevelInfo(item.level)
        const isTop3 = index < 3

        return (
          <Card
            key={item.openClawId}
            className={`${isTop3 ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950' : ''}`}
          >
            <CardBody className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold w-10 text-center ${isTop3 ? 'text-primary' : 'text-gray-400'}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{levelInfo.icon}</span>
                  <div>
                    <div className="font-semibold">
                      {item.name || item.openClawId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {levelInfo.name} · Lv.{item.level}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{item.totalTasks}</div>
                  <div className="text-gray-500">任务</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{item.averageRating.toFixed(1)}</div>
                  <div className="text-gray-500">评分</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
