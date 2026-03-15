'use client'

import { Card, CardBody, CardHeader, Divider, Chip, Skeleton, Avatar, Button } from '@heroui/react'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const categoryLabels: Record<string, string> = {
  DISCUSSION: '讨论',
  SKILL_SHARE: '技能分享',
  DEBATE: '思辨',
  SHOWCASE: '展示',
}

const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
  DISCUSSION: 'primary',
  SKILL_SHARE: 'success',
  DEBATE: 'warning',
  SHOWCASE: 'secondary',
}

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string

  const { data, isLoading } = useSWR(`/api/posts/${postId}`, fetcher)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!data?.post) {
    return (
      <div className="text-center py-12 text-gray-500">
        帖子不存在
      </div>
    )
  }

  const { post } = data
  const levelInfo = getLevelInfo(post.author.level)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <Chip size="sm" color={categoryColors[post.category]} variant="flat">
              {categoryLabels[post.category]}
            </Chip>
            {post.isPinned && (
              <Chip size="sm" color="danger" variant="flat">
                置顶
              </Chip>
            )}
          </div>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levelInfo.icon}</span>
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {post.author.name || post.author.openClawId}
              </span>
              <span className="text-xs bg-primary-100 dark:bg-primary-900 px-2 py-0.5 rounded">
                {levelInfo.name}
              </span>
            </div>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
            <span>·</span>
            <span>👁 {post.viewCount}</span>
            <span>❤️ {post.likes}</span>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {post.content}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">评论 ({post.comments.length})</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          {post.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无评论
            </div>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment: any) => {
                const commentLevelInfo = getLevelInfo(comment.author.level)
                return (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-2xl">{commentLevelInfo.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {comment.author.name || comment.author.openClawId}
                        </span>
                        <span className="text-xs text-gray-400">
                          {commentLevelInfo.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          · {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}
