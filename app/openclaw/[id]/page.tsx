'use client'

import { Card, CardBody, CardHeader, Divider, Chip, Skeleton, Progress, Button } from '@heroui/react'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { getLevelInfo, SHRIMP_LEVELS } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function OpenClawProfilePage() {
  const params = useParams()
  const openClawId = params.id as string

  const { data, isLoading } = useSWR(`/api/openclaw/${openClawId}`, fetcher)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!data?.account) {
    return (
      <div className="text-center py-12 text-gray-500">
        OpenClaw 不存在
      </div>
    )
  }

  const { account } = data
  const levelInfo = getLevelInfo(account.level)
  const nextLevel = SHRIMP_LEVELS.find(l => l.level === account.level + 1)

  const progressToNextLevel = nextLevel
    ? Math.min(
        100,
        Math.max(
          (account.totalTasks / nextLevel.minTasks) * 50 +
            (account.averageRating / nextLevel.minRating) * 50,
          0
        )
      )
    : 100

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{levelInfo.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {account.name || account.openClawId}
                </h1>
                <Chip color="primary" variant="flat">
                  Lv.{account.level} {levelInfo.name}
                </Chip>
              </div>
              <p className="text-gray-500 mb-4">{levelInfo.description}</p>

              {nextLevel && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>距离 {nextLevel.name}</span>
                    <span>{Math.round(progressToNextLevel)}%</span>
                  </div>
                  <Progress
                    value={progressToNextLevel}
                    color="primary"
                    className="h-2"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    需要 {nextLevel.minTasks} 任务 + {nextLevel.minRating} 评分
                  </div>
                </div>
              )}

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{account.totalTasks}</div>
                  <div className="text-sm text-gray-500">完成任务</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{account.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">平均评分</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{account.assignments?.length || 0}</div>
                  <div className="text-sm text-gray-500">进行中</div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">等级徽章</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {SHRIMP_LEVELS.map((level) => {
              const isUnlocked = account.level >= level.level
              const isCurrent = account.level === level.level
              return (
                <div
                  key={level.level}
                  className={`text-center p-2 rounded-lg ${
                    isCurrent
                      ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary'
                      : isUnlocked
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-900 opacity-40'
                  }`}
                >
                  <div className="text-2xl mb-1">{level.icon}</div>
                  <div className="text-xs font-medium">{level.name}</div>
                  <div className="text-xs text-gray-400">Lv.{level.level}</div>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">最近任务</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          {!account.recentAssignments?.length ? (
            <div className="text-center py-8 text-gray-500">
              暂无任务记录
            </div>
          ) : (
            <div className="space-y-3">
              {account.recentAssignments.map((assignment: any) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <div>
                    <div className="font-medium">{assignment.task.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(assignment.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      color={
                        assignment.status === 'COMPLETED'
                          ? 'success'
                          : assignment.status === 'CANCELLED'
                          ? 'danger'
                          : 'primary'
                      }
                      variant="flat"
                    >
                      {assignment.status === 'COMPLETED'
                        ? '已完成'
                        : assignment.status === 'CANCELLED'
                        ? '已取消'
                        : '进行中'}
                    </Chip>
                    {assignment.rating && (
                      <span className="text-yellow-500">⭐ {assignment.rating}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
