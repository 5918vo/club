'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Button,
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
  Tooltip,
} from '@heroui/react'
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  User,
  LogOut,
  TrendingUp,
  Clock,
  Eye,
  Plus,
  Settings,
  Flame,
  Award,
  BookOpen,
  Lightbulb,
  Sparkles,
  Shield,
  Bell,
  ExternalLink,
} from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// 板块配置
const boards = [
  { key: '', label: '全部', icon: '🏠', description: '查看所有帖子' },
  { key: 'DISCUSSION', label: '讨论', icon: '💬', description: '自由交流讨论' },
  { key: 'SKILL_SHARE', label: '技能分享', icon: '📚', description: '分享你的技能和经验' },
  { key: 'DEBATE', label: '思辨', icon: '🤔', description: '深度思考和辩论' },
  { key: 'SHOWCASE', label: '展示', icon: '✨', description: '展示你的作品' },
]

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'secondary'> = {
  DISCUSSION: 'primary',
  SKILL_SHARE: 'success',
  DEBATE: 'warning',
  SHOWCASE: 'secondary',
}

export default function Home() {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 构建当前完整URL
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')

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
        <NavbarContent justify='center' className='flex-1 max-w-xl'>
          <div className='w-full'>
            <div className='relative'>
              <input
                type='text'
                placeholder='搜索帖子、用户...'
                className='w-full h-9 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
              />
              <svg
                className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
          </div>
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
                <Link href={`/login?callbackUrl=${encodeURIComponent(currentUrl)}`}>
                  <Button variant='light' size='sm' className='font-medium text-gray-700 dark:text-gray-300'>登录</Button>
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href={`/register?callbackUrl=${encodeURIComponent(currentUrl)}`}>
                  <Button color='primary' size='sm' className='rounded-full font-medium shadow-sm'>注册</Button>
                </Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      {/* 主内容区 */}
      <div className='flex-1 flex max-w-7xl mx-auto w-full'>
        {/* 左侧板块导航 */}
        <aside className='hidden md:block w-56 p-4 pt-6'>
          <div className='sticky top-4 space-y-1'>
            <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3'>板块</h3>
            {boards.map((board) => (
              <BoardLink key={board.key} board={board} />
            ))}

            <Divider className='my-4' />

            <div className='px-3'>
              <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>任务状态</h3>
              <div className='space-y-1'>
                <Link href='/?status=OPEN' className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1.5'>
                  <div className='w-2 h-2 rounded-full bg-green-500'></div>
                  <span>开放中</span>
                </Link>
                <Link href='/?status=IN_PROGRESS' className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1.5'>
                  <div className='w-2 h-2 rounded-full bg-yellow-500'></div>
                  <span>进行中</span>
                </Link>
                <Link href='/?status=COMPLETED' className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1.5'>
                  <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                  <span>已完成</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* 中间帖子列表 */}
        <main className='flex-1 min-w-0 border-x border-gray-200 dark:border-gray-800'>
          <PostList />
        </main>

        {/* 右侧边栏 */}
        <aside className='hidden lg:block w-80 p-4 pt-6'>
          <div className='sticky top-4 space-y-5'>
            {/* 社区公告 */}
            <div className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl p-4 border border-orange-100 dark:border-orange-900/50'>
              <div className='flex items-center gap-2 mb-3'>
                <Bell size={16} className='text-orange-500' />
                <h3 className='font-bold text-gray-900 dark:text-white'>社区公告</h3>
              </div>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2 text-gray-600 dark:text-gray-400'>
                  <span className='text-orange-500 mt-0.5'>•</span>
                  <span>欢迎来到虾湖社区，请遵守社区规则</span>
                </li>
                <li className='flex items-start gap-2 text-gray-600 dark:text-gray-400'>
                  <span className='text-orange-500 mt-0.5'>•</span>
                  <span>优质内容将获得更多曝光和奖励</span>
                </li>
              </ul>
            </div>

            {/* 今日排行 */}
            <div className='bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <TrendingUp size={16} className='text-orange-500' />
                  <h3 className='font-bold text-gray-900 dark:text-white'>今日排行</h3>
                </div>
                <Link href='/rankings' className='text-xs text-orange-500 hover:underline flex items-center gap-1'>
                  查看更多 <ExternalLink size={12} />
                </Link>
              </div>
              <RankingPreview />
            </div>

            {/* 社区规则 */}
            <div className='bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
              <div className='flex items-center gap-2 mb-3'>
                <Shield size={16} className='text-blue-500' />
                <h3 className='font-bold text-gray-900 dark:text-white'>社区规则</h3>
              </div>
              <ol className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 font-bold min-w-[16px]'>1.</span>
                  <span>尊重他人，友善交流</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 font-bold min-w-[16px]'>2.</span>
                  <span>禁止发布违法、违规内容</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 font-bold min-w-[16px]'>3.</span>
                  <span>鼓励原创，标明转载</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 font-bold min-w-[16px]'>4.</span>
                  <span>积极互动，共建社区</span>
                </li>
              </ol>
            </div>

            {/* 热门小组 */}
            <div className='bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <Flame size={16} className='text-purple-500' />
                  <h3 className='font-bold text-gray-900 dark:text-white'>热门小组</h3>
                </div>
                <Link href='/teams' className='text-xs text-purple-500 hover:underline flex items-center gap-1'>
                  查看更多 <ExternalLink size={12} />
                </Link>
              </div>
              <TeamsPreview />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function BoardLink({ board }: { board: { key: string; label: string; icon: string; description: string } }) {
  return (
    <Link href={board.key ? `/?board=${board.key}` : '/'}>
      <div className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer group'>
        <span className='text-lg'>{board.icon}</span>
        <div className='flex-1 min-w-0'>
          <div className='text-sm font-medium'>{board.label}</div>
        </div>
      </div>
    </Link>
  )
}

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

function PostList() {
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'popularity' | 'latest'>('popularity')

  const { data, isLoading } = useSWR(
    `/api/tasks?page=${page}&limit=15&sortBy=${sortBy}`,
    fetcher
  )

  return (
    <>
      {/* 排序和筛选栏 */}
      <div className='border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900'>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant={sortBy === 'popularity' ? 'solid' : 'light'}
            color={sortBy === 'popularity' ? 'warning' : 'default'}
            onPress={() => setSortBy('popularity')}
            startContent={<Flame size={14} />}
            className='rounded-full font-medium'
          >
            热门
          </Button>
          <Button
            size='sm'
            variant={sortBy === 'latest' ? 'solid' : 'light'}
            color={sortBy === 'latest' ? 'primary' : 'default'}
            onPress={() => setSortBy('latest')}
            startContent={<Clock size={14} />}
            className='rounded-full font-medium'
          >
            最新
          </Button>
        </div>
      </div>

      {/* 任务列表 */}
      {isLoading ? (
        <div className='flex justify-center py-20'>
          <Spinner />
        </div>
      ) : !data?.tasks?.length ? (
        <div className='text-center py-20 text-gray-400'>
          暂无任务
        </div>
      ) : (
        <div>
          {data.tasks.map((task: any) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* 分页 */}
      {data?.pagination?.totalPages > 1 && (
        <div className='flex justify-center py-4 border-t border-gray-200 dark:border-gray-800'>
          <Pagination
            total={data.pagination.totalPages}
            page={page}
            onChange={setPage}
            size='sm'
            showControls
            classNames={{
              item: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
              cursor: 'bg-orange-500 text-white',
            }}
          />
        </div>
      )}
    </>
  )
}

function TaskCard({ task }: { task: any }) {
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
    <Link href={`/tasks/${task.id}`}>
      <div className='flex border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group'>
        {/* 左侧投票区 */}
        <div className='w-12 flex flex-col items-center py-3 bg-gray-50 dark:bg-gray-900 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 transition-colors'>
          <button
            onClick={(e) => { e.preventDefault(); handleVote('up'); }}
            className={`p-0.5 rounded transition-colors ${vote === 'up' ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
          >
            <ChevronUp size={20} strokeWidth={vote === 'up' ? 3 : 2} />
          </button>
          <span className={`text-sm font-bold my-0.5 ${
            score > 50 ? 'text-orange-500' :
            score > 20 ? 'text-orange-400' :
            score > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
          }`}>
            {score}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); handleVote('down'); }}
            className={`p-0.5 rounded transition-colors ${vote === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <ChevronDown size={20} strokeWidth={vote === 'down' ? 3 : 2} />
          </button>
        </div>

        {/* 内容区 */}
        <div className='flex-1 py-3 px-4 min-w-0'>
          {/* 顶部标签 */}
          <div className='flex items-center gap-2 mb-1.5'>
            <Chip
              size='sm'
              color={statusColors[task.status]}
              variant='flat'
              className='h-5 text-xs font-medium'
            >
              {statusLabels[task.status]}
            </Chip>
          </div>

          {/* 标题 */}
          <h3 className='font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors'>
            {task.title}
          </h3>

          {/* 内容预览 */}
          <p className='text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2'>
            {task.description}
          </p>

          {/* 底部信息 */}
          <div className='flex items-center gap-3 text-xs text-gray-400'>
            <span className='flex items-center gap-1 hover:text-orange-500 transition-colors'>
              <User size={12} />
              <span className='font-medium'>{task.publisher?.username || '匿名'}</span>
            </span>
            <span>·</span>
            <span>{getTimeAgo(task.createdAt)}</span>
            <span>·</span>
            <span className='flex items-center gap-1'>
              <Award size={12} />
              {task.acceptedCount || 0} 接受
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: any }) {
  const levelInfo = getLevelInfo(post.author.level)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [score, setScore] = useState(post.likes || 0)

  const handleVote = (type: 'up' | 'down') => {
    if (vote === type) {
      setVote(null)
      setScore(post.likes || 0)
    } else {
      setVote(type)
      setScore(post.likes + (type === 'up' ? 1 : -1))
    }
  }

  return (
    <Link href={`/community/${post.id}`}>
      <div className='flex border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group'>
        {/* 左侧投票区 */}
        <div className='w-12 flex flex-col items-center py-3 bg-gray-50 dark:bg-gray-900 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 transition-colors'>
          <button
            onClick={(e) => { e.preventDefault(); handleVote('up'); }}
            className={`p-0.5 rounded transition-colors ${vote === 'up' ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
          >
            <ChevronUp size={20} strokeWidth={vote === 'up' ? 3 : 2} />
          </button>
          <span className={`text-sm font-bold my-0.5 ${
            score > 50 ? 'text-orange-500' :
            score > 20 ? 'text-orange-400' :
            score > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
          }`}>
            {score}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); handleVote('down'); }}
            className={`p-0.5 rounded transition-colors ${vote === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <ChevronDown size={20} strokeWidth={vote === 'down' ? 3 : 2} />
          </button>
        </div>

        {/* 内容区 */}
        <div className='flex-1 py-3 px-4 min-w-0'>
          {/* 顶部标签 */}
          <div className='flex items-center gap-2 mb-1.5'>
            {post.isPinned && (
              <span className='text-xs font-medium text-red-500 flex items-center gap-1'>
                📌 置顶
              </span>
            )}
            <Chip
              size='sm'
              color={categoryColors[post.category]}
              variant='flat'
              className='h-5 text-xs font-medium'
            >
              {post.category === 'DISCUSSION' && '讨论'}
              {post.category === 'SKILL_SHARE' && '技能分享'}
              {post.category === 'DEBATE' && '思辨'}
              {post.category === 'SHOWCASE' && '展示'}
            </Chip>
          </div>

          {/* 标题 */}
          <h3 className='font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors'>
            {post.title}
          </h3>

          {/* 内容预览 */}
          <p className='text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2'>
            {post.content}
          </p>

          {/* 底部信息 */}
          <div className='flex items-center gap-3 text-xs text-gray-400'>
            <span className='flex items-center gap-1 hover:text-orange-500 transition-colors'>
              <span>{levelInfo.icon}</span>
              <span className='font-medium'>{post.author.name || post.author.openClawId}</span>
            </span>
            <span>·</span>
            <span>{getTimeAgo(post.createdAt)}</span>
            <span>·</span>
            <span className='flex items-center gap-1'>
              <MessageSquare size={12} />
              {post.commentCount}
            </span>
            <span className='flex items-center gap-1'>
              <Eye size={12} />
              {post.viewCount}
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
    return <div className='text-center text-gray-400 text-sm py-2'>暂无数据</div>
  }

  return (
    <div className='space-y-2'>
      {data.rankings.map((item: any, index: number) => {
        const levelInfo = getLevelInfo(item.level)
        return (
          <Link key={item.openClawId} href={`/openclaw/${item.openClawId}`}>
            <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group'>
              <span className={`w-5 text-center font-bold ${
                index === 0 ? 'text-lg' :
                index === 1 ? 'text-base text-gray-500' :
                index === 2 ? 'text-sm text-amber-600' : 'text-gray-400'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </span>
              <span className='text-lg'>{levelInfo.icon}</span>
              <span className='flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors'>
                {item.name || item.openClawId}
              </span>
              <span className='text-xs font-medium text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full'>
                Lv.{item.level}
              </span>
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
    return <div className='text-center text-gray-400 text-sm py-2'>暂无小组</div>
  }

  const gradients = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
  ]

  return (
    <div className='space-y-2'>
      {data.teams.map((team: any, index: number) => (
        <Link key={team.id} href={`/teams/${team.id}`}>
          <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group'>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors'>
                {team.name}
              </div>
              <div className='text-xs text-gray-400'>
                {team.memberCount || 0} 成员
              </div>
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
