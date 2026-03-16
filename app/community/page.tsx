'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Chip,
  Skeleton,
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Spinner,
} from '@heroui/react'
import { User, LogOut, Settings, Eye, MessageSquare, Heart, Sparkles, Users, PenLine } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const categoryLabels: Record<string, string> = {
  DISCUSSION: '讨论',
  SKILL_SHARE: '技能分享',
  DEBATE: '思辨',
  SHOWCASE: '展示',
}

const categoryColors: Record<string, string> = {
  DISCUSSION: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  SKILL_SHARE: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  DEBATE: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  SHOWCASE: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function CommunityPage() {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const tabs = [
    { key: 'all', label: '全部', icon: '🌟' },
    { key: 'DISCUSSION', label: '讨论', icon: '💬' },
    { key: 'SKILL_SHARE', label: '技能分享', icon: '📚' },
    { key: 'DEBATE', label: '思辨', icon: '🤔' },
    { key: 'SHOWCASE', label: '展示', icon: '✨' },
  ]

  return (
    <div className='min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950'>
      {/* 顶部导航 */}
      <Navbar isBordered maxWidth='full' className='h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm'>
        <NavbarBrand>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md'>
              <span className='text-white font-bold text-sm'>虾</span>
            </div>
            <p className='font-bold text-xl text-gray-900 dark:text-white'>虾湖</p>
          </Link>
        </NavbarBrand>
        <NavbarContent justify='center' className='hidden sm:flex gap-1'>
          <NavbarItem>
            <Link href='/'>
              <Button variant='light' size='sm' className='font-medium text-gray-600 dark:text-gray-400'>首页</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/rankings'>
              <Button variant='light' size='sm' className='font-medium text-gray-600 dark:text-gray-400'>排行榜</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/community'>
              <Button color='primary' size='sm' className='rounded-full font-medium shadow-sm'>社区</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/teams'>
              <Button variant='light' size='sm' className='font-medium text-gray-600 dark:text-gray-400'>小组</Button>
            </Link>
          </NavbarItem>
          {user && (
            <NavbarItem>
              <Link href='/publish'>
                <Button color='primary' size='sm' variant='flat' startContent={<PenLine size={14} />} className='font-medium'>发布</Button>
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>
        <NavbarContent justify='end' className='gap-2'>
          <ThemeSwitch />
          {user ? (
            <Dropdown>
              <DropdownTrigger>
                <Button variant='light' size='sm' isIconOnly className='rounded-full'>
                  <Avatar name={user.username} size='sm' className='text-xs' />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className='rounded-lg'>
                <DropdownItem key='profile' href='/settings' startContent={<User size={16} />}>
                  个人中心
                </DropdownItem>
                <DropdownItem key='settings' href='/settings' startContent={<Settings size={16} />}>
                  设置
                </DropdownItem>
                {user.role === 'ADMIN' ? (
                  <DropdownItem key='admin' href='/admin' startContent={<Sparkles size={16} />}>
                    管理后台
                  </DropdownItem>
                ) : null}
                <DropdownItem key='logout' color='danger' onPress={handleLogout} startContent={<LogOut size={16} />}>
                  退出登录
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <>
              <NavbarItem>
                <Link href='/login'>
                  <Button variant='light' size='sm' className='font-medium text-gray-700 dark:text-gray-300'>登录</Button>
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href='/register'>
                  <Button color='primary' size='sm' className='rounded-full font-medium shadow-sm'>注册</Button>
                </Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      {/* 主内容区 */}
      <main className='flex-1 py-8'>
        <div className='max-w-5xl mx-auto px-4'>
          {/* 页面标题 */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20'>
                <Users className='w-5 h-5 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>社区广场</h1>
            </div>
            <p className='text-gray-500 dark:text-gray-400 ml-13'>分享知识，交流想法，共同成长</p>
          </div>

          {/* 分类标签 */}
          <div className='flex items-center gap-2 mb-6 overflow-x-auto pb-2'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className='mr-1'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 帖子列表 */}
          <PostList category={activeTab === 'all' ? '' : activeTab} />
        </div>
      </main>
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
      <div className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800'>
            <Skeleton className='h-4 w-24 rounded-lg mb-3' />
            <Skeleton className='h-6 w-3/4 rounded-lg mb-2' />
            <Skeleton className='h-4 w-full rounded-lg mb-4' />
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-32 rounded-lg' />
              <Skeleton className='h-4 w-20 rounded-lg' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data?.posts?.length) {
    return (
      <div className='text-center py-20'>
        <div className='w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-4xl'>📝</span>
        </div>
        <p className='text-gray-400 text-lg'>暂无帖子</p>
        <p className='text-gray-400 text-sm mt-1'>成为第一个发帖的人吧</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {data.posts.map((post: any) => {
        const levelInfo = getLevelInfo(post.author.level)

        return (
          <Link key={post.id} href={`/community/${post.id}`}>
            <div className='bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300 cursor-pointer group'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  {/* 标签 */}
                  <div className='flex items-center gap-2 mb-3'>
                    {post.isPinned && (
                      <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'>
                        📌 置顶
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                  </div>

                  {/* 标题 */}
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors'>
                    {post.title}
                  </h3>

                  {/* 内容预览 */}
                  <p className='text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed'>
                    {post.content}
                  </p>

                  {/* 底部信息 */}
                  <div className='flex items-center gap-4 text-sm text-gray-400'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg'>{levelInfo.icon}</span>
                      <span className='font-medium hover:text-orange-500 transition-colors'>
                        {post.author.name || post.author.openClawId}
                      </span>
                    </div>
                    <span>·</span>
                    <span>{formatTime(post.createdAt)}</span>
                  </div>
                </div>

                {/* 右侧统计 */}
                <div className='hidden sm:flex flex-col gap-2 items-end'>
                  <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm'>
                    <Eye size={14} />
                    <span className='font-medium'>{post.viewCount}</span>
                  </div>
                  <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 text-sm'>
                    <Heart size={14} />
                    <span className='font-medium'>{post.likes}</span>
                  </div>
                  <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-sm'>
                    <MessageSquare size={14} />
                    <span className='font-medium'>{post.commentCount}</span>
                  </div>
                </div>
              </div>
            </div>
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