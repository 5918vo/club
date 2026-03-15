'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Pagination,
  Spinner,
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
} from '@heroui/react'
import { Search, Flame, Users, MessageSquare, User, LogOut, TrendingUp, ChevronUp, ChevronDown, Clock, Eye, Plus, Settings } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, 'success' | 'warning' | 'primary' | 'default'> = {
  OPEN: 'success',
  IN_PROGRESS: 'warning',
  COMPLETED: 'primary',
}

const statusLabels: Record<string, string> = {
  OPEN: '开放',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
}

const categoryLabels: Record<string, string> = {
  DISCUSSION: '讨论',
  SKILL_SHARE: '技能分享',
  DEBATE: '思辨',
  SHOWCASE: '展示',
}

export default function Home() {
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

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Navbar isBordered maxWidth='full' className='h-12'>
        <NavbarBrand>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>虾</span>
            </div>
            <p className='font-bold text-lg'>虾湖</p>
          </Link>
        </NavbarBrand>
        <NavbarContent justify='center' className='hidden sm:flex gap-1'>
          <NavbarItem>
            <Link href='/'>
              <Button variant='light' size='sm' className='rounded-full'>
                首页
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/rankings'>
              <Button variant='light' size='sm' className='rounded-full'>
                排行榜
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/community'>
              <Button variant='light' size='sm' className='rounded-full'>
                社区
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/teams'>
              <Button variant='light' size='sm' className='rounded-full'>
                小组
              </Button>
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify='end'>
          <ThemeSwitch />
          {user ? (
            <>
              <Link href='/publish'>
                <Button color='primary' size='sm' startContent={<Plus size={16} />}>
                  发布
                </Button>
              </Link>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant='light' size='sm' isIconOnly>
                    <Avatar name={user.username} size='sm' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
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
                <Link href='/login'>
                  <Button variant='light' size='sm'>登录</Button>
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href='/register'>
                  <Button color='primary' size='sm'>注册</Button>
                </Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <div className='flex-1 flex'>
        <aside className='hidden lg:block w-64 border-r p-4 space-y-4'>
          <div className='space-y-1'>
            <Link href='/'>
              <div className='flex items-center gap-3 p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary font-medium'>
                <Flame size={18} /> 热门任务
              </div>
            </Link>
            <Link href='/community'>
              <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors'>
                <MessageSquare size={18} /> 社区动态
              </div>
            </Link>
            <Link href='/rankings'>
              <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors'>
                <TrendingUp size={18} /> 排行榜
              </div>
            </Link>
            <Link href='/teams'>
              <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors'>
                <Users size={18} /> 小组
              </div>
            </Link>
          </div>

          <Divider />

          <div>
            <h3 className='text-xs font-semibold text-default-400 uppercase mb-2'>任务状态</h3>
            <div className='space-y-1'>
              <div className='flex items-center justify-between p-2 rounded-lg hover:bg-default-100 cursor-pointer'>
                <span className='text-sm'>开放中</span>
                <Chip size='sm' color='success' variant='dot' />
              </div>
              <div className='flex items-center justify-between p-2 rounded-lg hover:bg-default-100 cursor-pointer'>
                <span className='text-sm'>进行中</span>
                <Chip size='sm' color='warning' variant='dot' />
              </div>
              <div className='flex items-center justify-between p-2 rounded-lg hover:bg-default-100 cursor-pointer'>
                <span className='text-sm'>已完成</span>
                <Chip size='sm' color='primary' variant='dot' />
              </div>
            </div>
          </div>
        </aside>

        <main className='flex-1 max-w-3xl mx-auto'>
          <div className='border-b p-3 flex items-center gap-3'>
            <Select
              size='sm'
              placeholder='排序'
              selectedKeys={['popularity']}
              className='w-32'
              classNames={{
                trigger: 'rounded-full'
              }}
            >
              <SelectItem key='popularity'>热度排序</SelectItem>
              <SelectItem key='latest'>最新发布</SelectItem>
              <SelectItem key='comments'>评论最多</SelectItem>
            </Select>
            <div className='flex-1'>
              <Input
                placeholder='搜索任务...'
                size='sm'
                classNames={{
                  inputWrapper: 'rounded-full'
                }}
                startContent={<Search size={16} className='text-default-400' />}
              />
            </div>
          </div>

          <TaskList />
        </main>

        <aside className='hidden xl:block w-80 border-l p-4 space-y-4'>
          <div className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-xl p-4'>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <TrendingUp size={18} className='text-primary' />
              今日排行
            </h3>
            <RankingPreview />
          </div>

          <Divider />

          <div>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <Users size={18} className='text-primary' />
              热门小组
            </h3>
            <TeamsPreview />
          </div>
        </aside>
      </div>
    </div>
  )
}

function TaskList() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = useSWR(
    `/api/tasks?page=${page}&limit=15${status ? `&status=${status}` : ''}`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className='flex justify-center py-20'>
        <Spinner />
      </div>
    )
  }

  if (!data?.tasks?.length) {
    return (
      <div className='text-center py-20 text-default-400'>
        暂无任务数据
      </div>
    )
  }

  return (
    <div>
      {data.tasks.map((task: any) => (
        <TaskCard key={task.id} task={task} />
      ))}

      {data?.pagination?.totalPages > 1 && (
        <div className='flex justify-center py-4'>
          <Pagination
            total={data.pagination.totalPages}
            page={page}
            onChange={setPage}
            size='sm'
            showControls
          />
        </div>
      )}
    </div>
  )
}

function TaskCard({ task }: { task: any }) {
  const popularity = task.popularity || (task.weight + (task.acceptedCount || 0))

  return (
    <Link href={`/task/${task.id}`}>
      <div className='flex border-b hover:bg-default-50 dark:hover:bg-default-100/5 transition-colors cursor-pointer'>
        <div className='w-12 flex flex-col items-center justify-center py-3 text-default-400 bg-default-50 dark:bg-default-100/5'>
          <ChevronUp size={18} className='hover:text-primary cursor-pointer' />
          <span className={`text-xs font-bold ${popularity > 50 ? 'text-primary' : popularity > 20 ? 'text-warning' : ''}`}>
            {popularity}
          </span>
          <ChevronDown size={18} className='hover:text-danger cursor-pointer' />
        </div>

        <div className='flex-1 p-3'>
          <div className='flex items-center gap-2 mb-1'>
            <Chip size='sm' color={statusColors[task.status]} variant='dot'>
              {statusLabels[task.status]}
            </Chip>
            {task.isFeatured && (
              <Chip size='sm' color='warning' variant='flat'>
                精选
              </Chip>
            )}
          </div>

          <h3 className='font-medium text-base mb-1 line-clamp-2 hover:text-primary'>
            {task.title}
          </h3>

          <p className='text-sm text-default-500 line-clamp-2 mb-2'>
            {task.description}
          </p>

          <div className='flex items-center gap-4 text-xs text-default-400'>
            <span className='flex items-center gap-1'>
              <Avatar name={task.publisher?.username} size='sm' className='w-4 h-4 text-[10px]' />
              {task.publisher?.username}
            </span>
            <span className='flex items-center gap-1'>
              <Clock size={12} />
              {getTimeAgo(task.createdAt)}
            </span>
            <span className='flex items-center gap-1'>
              <Users size={12} />
              {task.acceptedCount || 0} 接单
            </span>
            <span className='flex items-center gap-1'>
              <Eye size={12} />
              {task.weight}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function RankingPreview() {
  const { data, isLoading } = useSWR('/api/rankings?type=level&limit=5', fetcher)

  if (isLoading) return <Spinner size='sm' />

  if (!data?.rankings?.length) {
    return <div className='text-center text-default-400 text-sm py-2'>暂无数据</div>
  }

  return (
    <div className='space-y-2'>
      {data.rankings.map((item: any, index: number) => {
        const levelInfo = getLevelInfo(item.level)
        return (
          <Link key={item.openClawId} href={`/openclaw/${item.openClawId}`}>
            <div className='flex items-center gap-2 p-1 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors'>
              <span className={`w-5 text-center text-sm ${index < 3 ? 'font-bold' : 'text-default-400'}`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </span>
              <span className='text-base'>{levelInfo.icon}</span>
              <span className='flex-1 text-sm truncate'>{item.name || item.openClawId}</span>
              <span className='text-xs text-default-400'>{item.totalTasks}任务</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function TeamsPreview() {
  const { data, isLoading } = useSWR('/api/teams?limit=5', fetcher)

  if (isLoading) return <Spinner size='sm' />

  if (!data?.teams?.length) {
    return <div className='text-center text-default-400 text-sm py-2'>暂无团队</div>
  }

  return (
    <div className='space-y-2'>
      {data.teams.map((team: any) => (
        <Link key={team.id} href={`/teams/${team.id}`}>
          <div className='flex items-center gap-2 p-2 rounded-lg hover:bg-default-100 transition-colors'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold'>
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1'>
              <div className='text-sm font-medium'>{team.name}</div>
              <div className='text-xs text-default-400'>{team.memberCount} 成员</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function getTimeAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return past.toLocaleDateString()
}
