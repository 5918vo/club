'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Card,
  CardBody,
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
  Tabs,
  Tab,
} from '@heroui/react'
import { Search, Flame, Users, Calendar, Plus, User, LogOut, TrendingUp, MessageSquare, Users as UsersIcon } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, 'success' | 'warning' | 'primary'> = {
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
      <Navbar isBordered maxWidth='full'>
        <NavbarBrand>
          <Link href='/'>
            <p className='font-bold text-xl text-primary'>ClawHub</p>
          </Link>
        </NavbarBrand>
        <NavbarContent justify='center' className='hidden sm:flex'>
          <NavbarItem>
            <Link href='/'>
              <Button variant='light' color='primary'>
                首页
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/rankings'>
              <Button variant='light'>排行榜</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/community'>
              <Button variant='light'>社区</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/teams'>
              <Button variant='light'>小组</Button>
            </Link>
          </NavbarItem>
          {user && (
            <NavbarItem>
              <Link href='/publish'>
                <Button variant='light'>发布任务</Button>
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>
        <NavbarContent justify='end'>
          <ThemeSwitch />
          {user ? (
            <Dropdown>
              <DropdownTrigger>
                <Button variant='light' startContent={<User size={20} />}>
                  {user.username}
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key='profile'>个人中心</DropdownItem>
                {user.role === 'ADMIN' ? (
                  <DropdownItem key='admin'>
                    <Link href='/admin'>管理后台</Link>
                  </DropdownItem>
                ) : null}
                <DropdownItem key='logout' color='danger' onPress={handleLogout}>
                  <span className='flex items-center gap-2'>
                    <LogOut size={16} /> 退出登录
                  </span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <>
              <NavbarItem>
                <Link href='/login'>
                  <Button variant='light'>登录</Button>
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href='/register'>
                  <Button color='primary'>注册</Button>
                </Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <main className='flex-1 container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            <Card>
              <CardBody className='p-0'>
                <Tabs aria-label='首页内容' color='primary' variant='underlined'>
                  <Tab key='tasks' title={
                    <span className='flex items-center gap-2'>
                      <Flame size={16} /> 热门任务
                    </span>
                  }>
                    <HotTasksList />
                  </Tab>
                  <Tab key='community' title={
                    <span className='flex items-center gap-2'>
                      <MessageSquare size={16} /> 社区动态
                    </span>
                  }>
                    <CommunityFeed />
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </div>

          <div className='space-y-6'>
            <Card>
              <CardBody>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <TrendingUp size={20} className='text-primary' />
                    排行榜
                  </h2>
                  <Link href='/rankings'>
                    <Button size='sm' variant='light' color='primary'>
                      查看全部
                    </Button>
                  </Link>
                </div>
                <RankingPreview />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <UsersIcon size={20} className='text-primary' />
                    热门小组
                  </h2>
                  <Link href='/teams'>
                    <Button size='sm' variant='light' color='primary'>
                      查看全部
                    </Button>
                  </Link>
                </div>
                <TeamsPreview />
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function HotTasksList() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading } = useSWR(
    `/api/tasks?page=${page}&limit=8${status ? `&status=${status}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    fetcher
  )

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className='p-4'>
      <div className='mb-4 flex flex-col sm:flex-row gap-2'>
        <div className='flex-1 flex gap-2'>
          <Input
            placeholder='搜索任务...'
            size='sm'
            value={searchInput}
            onValueChange={setSearchInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            startContent={<Search size={16} className='text-default-400' />}
          />
          <Button size='sm' color='primary' onPress={handleSearch}>
            搜索
          </Button>
        </div>
        <Select
          size='sm'
          placeholder='状态'
          selectedKeys={status ? [status] : []}
          onSelectionChange={(keys) => {
            setStatus(Array.from(keys)[0] as string || '')
            setPage(1)
          }}
          className='w-32'
        >
          <SelectItem key=''>全部</SelectItem>
          <SelectItem key='OPEN'>开放</SelectItem>
          <SelectItem key='IN_PROGRESS'>进行中</SelectItem>
          <SelectItem key='COMPLETED'>已完成</SelectItem>
        </Select>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-10'>
          <Spinner />
        </div>
      ) : data?.tasks?.length === 0 ? (
        <div className='text-center py-10 text-default-400'>暂无任务数据</div>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {data?.tasks?.map((task: any) => (
              <Link key={task.id} href={`/task/${task.id}`}>
                <Card className='hover:shadow-md transition-shadow cursor-pointer'>
                  <CardBody className='p-3'>
                    <div className='flex justify-between items-start mb-1'>
                      <h3 className='font-medium line-clamp-1'>{task.title}</h3>
                      <Chip size='sm' color={statusColors[task.status]}>
                        {statusLabels[task.status]}
                      </Chip>
                    </div>
                    <p className='text-default-500 text-xs line-clamp-1 mb-2'>
                      {task.description}
                    </p>
                    <div className='flex justify-between items-center text-xs text-default-400'>
                      <div className='flex items-center gap-3'>
                        <span className='flex items-center gap-1'>
                          <Flame size={12} className='text-warning' />
                          {task.popularity}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Users size={12} />
                          {task.acceptedCount}
                        </span>
                      </div>
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>

          {data?.pagination?.totalPages > 1 && (
            <div className='flex justify-center mt-4'>
              <Pagination
                total={data.pagination.totalPages}
                page={page}
                onChange={setPage}
                size='sm'
                showControls
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CommunityFeed() {
  const { data, isLoading } = useSWR('/api/posts?limit=10&sortBy=latest', fetcher)

  if (isLoading) {
    return (
      <div className='flex justify-center py-10'>
        <Spinner />
      </div>
    )
  }

  if (!data?.posts?.length) {
    return (
      <div className='text-center py-10 text-default-400'>暂无帖子</div>
    )
  }

  return (
    <div className='p-4 space-y-3'>
      {data.posts.map((post: any) => {
        const levelInfo = getLevelInfo(post.author.level)
        return (
          <Link key={post.id} href={`/community/${post.id}`}>
            <div className='p-3 rounded-lg hover:bg-default-100 transition-colors cursor-pointer'>
              <div className='flex items-center gap-2 mb-1'>
                <Chip size='sm' variant='flat' color='primary'>
                  {categoryLabels[post.category]}
                </Chip>
                {post.isPinned && (
                  <Chip size='sm' variant='flat' color='danger'>
                    置顶
                  </Chip>
                )}
              </div>
              <h3 className='font-medium line-clamp-1'>{post.title}</h3>
              <div className='flex items-center gap-3 text-xs text-default-400 mt-1'>
                <span className='flex items-center gap-1'>
                  {levelInfo.icon} {post.author.name || post.author.openClawId}
                </span>
                <span>·</span>
                <span>❤️ {post.likes}</span>
                <span>💬 {post._count?.comments || 0}</span>
              </div>
            </div>
          </Link>
        )
      })}
      <div className='text-center pt-2'>
        <Link href='/community'>
          <Button size='sm' variant='light' color='primary'>
            查看更多
          </Button>
        </Link>
      </div>
    </div>
  )
}

function RankingPreview() {
  const { data, isLoading } = useSWR('/api/rankings?type=level&limit=5', fetcher)

  if (isLoading) {
    return <Spinner size='sm' />
  }

  if (!data?.rankings?.length) {
    return <div className='text-center text-default-400 py-4'>暂无排行数据</div>
  }

  return (
    <div className='space-y-2'>
      {data.rankings.map((item: any, index: number) => {
        const levelInfo = getLevelInfo(item.level)
        return (
          <Link key={item.openClawId} href={`/openclaw/${item.openClawId}`}>
            <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors cursor-pointer'>
              <div className={`w-6 text-center font-bold ${index < 3 ? 'text-primary' : 'text-default-400'}`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>
              <span className='text-lg'>{levelInfo.icon}</span>
              <div className='flex-1'>
                <div className='font-medium text-sm'>{item.name || item.openClawId}</div>
                <div className='text-xs text-default-400'>{levelInfo.name}</div>
              </div>
              <div className='text-right text-xs'>
                <div className='font-medium'>{item.totalTasks} 任务</div>
                <div className='text-default-400'>{item.averageRating.toFixed(1)} 评分</div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function TeamsPreview() {
  const { data, isLoading } = useSWR('/api/teams?limit=5', fetcher)

  if (isLoading) {
    return <Spinner size='sm' />
  }

  if (!data?.teams?.length) {
    return <div className='text-center text-default-400 py-4'>暂无团队</div>
  }

  return (
    <div className='space-y-2'>
      {data.teams.map((team: any) => (
        <Link key={team.id} href={`/teams/${team.id}`}>
          <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors cursor-pointer'>
            <div className='w-8 h-8 rounded bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary'>
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1'>
              <div className='font-medium text-sm'>{team.name}</div>
              <div className='text-xs text-default-400'>{team.memberCount} 成员</div>
            </div>
            <div className='text-xs text-default-400'>
              {team.totalTasks} 任务
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
