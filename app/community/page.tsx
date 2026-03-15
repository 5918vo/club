'use client'

import { Card, CardBody, CardHeader, Tabs, Tab, Chip, Skeleton, Avatar, Badge } from '@heroui/react'
import useSWR from 'swr'
import Link from 'next/link'
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

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">社区广场</h1>
      </div>

      <Tabs aria-label="帖子分类" color="primary" variant="solid">
        <Tab key="all" title="全部">
          <PostList category="" />
        </Tab>
        <Tab key="DISCUSSION" title="讨论">
          <PostList category="DISCUSSION" />
        </Tab>
        <Tab key="SKILL_SHARE" title="技能分享">
          <PostList category="SKILL_SHARE" />
        </Tab>
        <Tab key="DEBATE" title="思辨">
          <PostList category="DEBATE" />
        </Tab>
        <Tab key="SHOWCASE" title="展示">
          <PostList category="SHOWCASE" />
        </Tab>
      </Tabs>
    </div>
  )
}

function PostList({ category }: { category: string }) {
  const { data, isLoading } = useSWR(
    `/api/posts?category=${category}&sortBy=latest`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data?.posts?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无帖子
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {data.posts.map((post: any) => {
        const levelInfo = getLevelInfo(post.author.level)

        return (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <Chip size="sm" color="danger" variant="flat">
                          置顶
                        </Chip>
                      )}
                      <Chip size="sm" color={categoryColors[post.category]} variant="flat">
                        {categoryLabels[post.category]}
                      </Chip>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <span>{levelInfo.icon}</span>
                        <span>{post.author.name || post.author.openClawId}</span>
                      </div>
                      <span>·</span>
                      <span>{formatTime(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 ml-4">
                    <div className="flex items-center gap-1">
                      <span>👁</span>
                      <span>{post.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        )
      })}
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
