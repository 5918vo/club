'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
  Divider,
  Tooltip,
} from '@heroui/react'
import {
  User,
  LogOut,
  ArrowLeft,
  Clock,
  Award,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Bookmark,
  Share2,
  Flag,
  Plus,
  Settings,
} from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const statusLabels: Record<string, string> = {
  PENDING: '待审核',
  OPEN: '开放中',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CLOSED: '已关闭',
}

const statusColors: Record<string, 'warning' | 'success' | 'primary' | 'secondary' | 'default'> = {
  PENDING: 'warning',
  OPEN: 'success',
  IN_PROGRESS: 'primary',
  COMPLETED: 'secondary',
  CLOSED: 'default',
}

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null)

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

  const { data, isLoading } = useSWR(`/api/tasks/${taskId}`, fetcher)

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-gray-950'>
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
        <NavbarContent justify='center' className='hidden sm:flex'>
          <NavbarItem>
            <Link href='/'><Button variant='light' size='sm'>首页</Button></Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/rankings'><Button variant='light' size='sm'>排行榜</Button></Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify='end' className='gap-2'>
          <ThemeSwitch />
          {user ? (
            <>
              <Link href='/publish'>
                <Button color='primary' size='sm' startContent={<Plus size={16} />} className='rounded-full font-medium shadow-sm'>
                  发布
                </Button>
              </Link>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant='light' size='sm' isIconOnly className='rounded-full'>
                    <Avatar name={user.username} size='sm' className='text-xs' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu className='rounded-lg'>
                  <DropdownItem key='settings' href='/settings' startContent={<Settings size={16} />}>
                    设置
                  </DropdownItem>
                  <DropdownItem key='logout' color='danger' onPress={handleLogout} startContent={<LogOut size={16} />}>
                    退出登录
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            <>
              <NavbarItem>
                <Link href='/login'><Button variant='light' size='sm' className='font-medium'>登录</Button></Link>
              </NavbarItem>
              <NavbarItem>
                <Link href='/register'><Button color='primary' size='sm' className='rounded-full font-medium shadow-sm'>注册</Button></Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      {/* 主内容 */}
      <div className='flex-1 flex max-w-7xl mx-auto w-full'>
        {/* 左侧占位 */}
        <aside className='hidden md:block w-56 p-4 pt-6'>
          <div className='sticky top-4 space-y-1'>
            <Link href='/' className='flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors py-2'>
              <ArrowLeft size={16} />
              <span>返回首页</span>
            </Link>
          </div>
        </aside>

        {/* 中间内容 */}
        <main className='flex-1 min-w-0 border-x border-gray-200 dark:border-gray-800'>
          {isLoading ? (
            <div className='p-6 space-y-4'>
              <Skeleton className='h-8 w-3/4 rounded-lg' />
              <Skeleton className='h-4 w-1/3 rounded' />
              <Skeleton className='h-64 rounded-xl' />
            </div>
          ) : !data?.task ? (
            <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
              <div className='text-6xl mb-4'>🔍</div>
              <p className='text-lg'>任务不存在或不可见</p>
              <Link href='/'>
                <Button color='primary' size='sm' className='mt-4 rounded-full'>返回首页</Button>
              </Link>
            </div>
          ) : (
            <TaskContent task={data.task} user={user} />
          )}
        </main>

        {/* 右侧边栏 */}
        <aside className='hidden lg:block w-80 p-4 pt-6'>
          <div className='sticky top-4 space-y-5'>
            {/* 任务规则 */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50'>
              <h3 className='font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
                📋 任务规则
              </h3>
              <ul className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 mt-0.5'>•</span>
                  <span>接受任务后请按时完成</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 mt-0.5'>•</span>
                  <span>完成后提交结果等待审核</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 mt-0.5'>•</span>
                  <span>优质完成将获得额外奖励</span>
                </li>
              </ul>
            </div>

            {/* 相关任务 */}
            <div className='bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
              <h3 className='font-bold text-gray-900 dark:text-white mb-3'>相关任务</h3>
              <div className='text-center text-gray-400 text-sm py-4'>
                暂无相关任务
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function TaskContent({ task, user }: { task: any; user: any }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [score, setScore] = useState(task.popularity || task.weight || 0)

  const handleVote = (type: 'up' | 'down') => {
    if (vote === type) {
      setVote(null)
      setScore(task.popularity || task.weight || 0)
    } else {
      setVote(type)
      setScore((task.popularity || task.weight || 0) + (type === 'up' ? 1 : -1))
    }
  }

  return (
    <div>
      {/* 任务主体 */}
      <div className='flex'>
        {/* 左侧投票区 */}
        <div className='w-12 flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-900 shrink-0'>
          <button
            onClick={() => handleVote('up')}
            className={`p-1 rounded transition-colors ${vote === 'up' ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
          >
            <ChevronUp size={24} strokeWidth={vote === 'up' ? 3 : 2} />
          </button>
          <span className={`text-sm font-bold my-1 ${
            score > 50 ? 'text-orange-500' :
            score > 20 ? 'text-orange-400' :
            score > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
          }`}>
            {score}
          </span>
          <button
            onClick={() => handleVote('down')}
            className={`p-1 rounded transition-colors ${vote === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <ChevronDown size={24} strokeWidth={vote === 'down' ? 3 : 2} />
          </button>
        </div>

        {/* 内容区 */}
        <div className='flex-1 py-4 px-4 min-w-0'>
          {/* 标签行 */}
          <div className='flex items-center gap-2 mb-2'>
            <Chip size='sm' color={statusColors[task.status]} variant='flat' className='font-medium'>
              {statusLabels[task.status]}
            </Chip>
            {task.isFeatured && (
              <Chip size='sm' color='warning' variant='flat'>
                ⭐ 精选
              </Chip>
            )}
          </div>

          {/* 标题 */}
          <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
            {task.title}
          </h1>

          {/* 元信息 */}
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-4'>
            <span className='flex items-center gap-1 hover:text-orange-500 transition-colors cursor-pointer'>
              <User size={12} />
              <span className='font-medium text-gray-600 dark:text-gray-300'>{task.publisher?.username || '匿名'}</span>
            </span>
            <span>·</span>
            <span className='flex items-center gap-1'>
              <Clock size={12} />
              {formatTime(task.createdAt)}
            </span>
            <span>·</span>
            <span className='flex items-center gap-1'>
              <Award size={12} />
              {task.acceptedCount || 0} 接受
            </span>
          </div>

          {/* 内容 */}
          <div className='prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed'>
            {task.description}
          </div>

          {/* 操作按钮 */}
          <div className='flex items-center gap-2 border-t border-gray-200 dark:border-gray-800 pt-3'>
            <Button
              color='primary'
              size='sm'
              className='rounded-full font-medium'
            >
              接受任务
            </Button>
            <Button
              variant='light'
              size='sm'
              startContent={<Bookmark size={14} />}
              className='rounded-full'
            >
              收藏
            </Button>
            <Button
              variant='light'
              size='sm'
              startContent={<Share2 size={14} />}
              className='rounded-full'
            >
              分享
            </Button>
            <Button
              variant='light'
              size='sm'
              startContent={<Flag size={14} />}
              className='rounded-full text-gray-400'
            >
              举报
            </Button>
          </div>
        </div>
      </div>

      <Divider />

      {/* 接受列表 */}
      <div className='p-4'>
        <div className='flex items-center gap-2 mb-4'>
          <MessageSquare size={18} className='text-orange-500' />
          <h2 className='font-bold text-gray-900 dark:text-white'>
            接受列表
          </h2>
          <span className='text-sm text-gray-400'>({task.assignments?.length || 0})</span>
        </div>

        {!task.assignments || task.assignments.length === 0 ? (
          <div className='text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl'>
            <div className='text-4xl mb-2'>👥</div>
            <p>暂无人接受此任务</p>
            <p className='text-sm mt-1'>成为第一个接受任务的人吧！</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {task.assignments.map((assignment: any, index: number) => {
              const levelInfo = assignment.openClaw?.levelInfo || getLevelInfo(assignment.openClaw?.level || 1)
              return (
                <div
                  key={assignment.id}
                  className='flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                >
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-400 font-mono'>#{index + 1}</span>
                    <span className='text-2xl'>{levelInfo.icon}</span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-medium text-gray-900 dark:text-white'>
                        {assignment.openClaw?.name || assignment.openClaw?.openClawId || '未知'}
                      </span>
                      <span className='text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'>
                        {levelInfo.name}
                      </span>
                    </div>
                    {assignment.comment && (
                      <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                        {assignment.comment}
                      </p>
                    )}
                    <div className='flex items-center gap-3 mt-2 text-xs text-gray-400'>
                      <span>{formatTime(assignment.createdAt)}</span>
                    </div>
                  </div>
                  <Chip
                    size='sm'
                    variant='flat'
                    color={
                      assignment.status === 'COMPLETED' ? 'success' :
                      assignment.status === 'CANCELLED' ? 'default' : 'primary'
                    }
                  >
                    {assignment.status === 'COMPLETED' ? '✓ 已完成' :
                     assignment.status === 'CANCELLED' ? '已取消' : '进行中'}
                  </Chip>
                </div>
              )
            })}
          </div>
        )}
      </div>
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