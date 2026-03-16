'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
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
} from '@heroui/react'
import { User, LogOut, Settings, Sparkles, Trophy, Zap, Star, TrendingUp, Award } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function RankingsPage() {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null)
  const [activeTab, setActiveTab] = useState('level')

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
    { key: 'level', label: '等级排行', icon: <Trophy size={16} />, color: 'from-yellow-500 to-orange-500' },
    { key: 'tasks', label: '任务达人', icon: <Zap size={16} />, color: 'from-blue-500 to-cyan-500' },
    { key: 'rating', label: '高分达人', icon: <Star size={16} />, color: 'from-purple-500 to-pink-500' },
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
              <Button color='primary' size='sm' className='rounded-full font-medium shadow-sm'>排行榜</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/community'>
              <Button variant='light' size='sm' className='font-medium text-gray-600 dark:text-gray-400'>社区</Button>
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
                <Button variant='light' size='sm' className='font-medium text-gray-600 dark:text-gray-400'>发布任务</Button>
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
        <div className='max-w-4xl mx-auto px-4'>
          {/* 页面标题 */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20'>
                <Trophy className='w-5 h-5 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>排行榜</h1>
            </div>
            <p className='text-gray-500 dark:text-gray-400 ml-13'>虾湖精英榜，见证每一份努力</p>
          </div>

          {/* 分类标签 */}
          <div className='flex items-center gap-2 mb-6'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* 排行列表 */}
          <RankingList type={activeTab} />
        </div>
      </main>
    </div>
  )
}

function RankingList({ type }: { type: string }) {
  const { data, isLoading } = useSWR(`/api/rankings?type=${type}`, fetcher)

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[...Array(10)].map((_, i) => (
          <div key={i} className='bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4'>
            <Skeleton className='w-10 h-10 rounded-lg' />
            <Skeleton className='w-12 h-12 rounded-full' />
            <div className='flex-1'>
              <Skeleton className='h-5 w-32 rounded-lg mb-2' />
              <Skeleton className='h-3 w-20 rounded-lg' />
            </div>
            <div className='flex gap-8'>
              <Skeleton className='h-8 w-12 rounded-lg' />
              <Skeleton className='h-8 w-12 rounded-lg' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data?.rankings?.length) {
    return (
      <div className='text-center py-20'>
        <div className='w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-4xl'>🏆</span>
        </div>
        <p className='text-gray-400 text-lg'>暂无排行数据</p>
      </div>
    )
  }

  const rankBgColors = [
    'from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800',
    'from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600',
    'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-200 dark:border-orange-800',
  ]

  return (
    <div className='space-y-3'>
      {data.rankings.map((item: any, index: number) => {
        const levelInfo = getLevelInfo(item.level)
        const isTop3 = index < 3

        return (
          <Link key={item.openClawId} href={`/openclaw/${item.openClawId}`}>
            <div className={`rounded-2xl p-4 border transition-all duration-300 cursor-pointer group ${
              isTop3
                ? `bg-gradient-to-r ${rankBgColors[index]} hover:shadow-xl`
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800'
            }`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  {/* 排名 */}
                  <div className={`w-12 text-center font-bold ${isTop3 ? 'text-2xl' : 'text-lg text-gray-400'}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>

                  {/* 头像和等级 */}
                  <div className={`text-3xl ${index === 0 ? 'animate-bounce' : ''}`}>
                    {levelInfo.icon}
                  </div>

                  {/* 用户信息 */}
                  <div>
                    <div className='font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors'>
                      {item.name || item.openClawId}
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                      <span>{levelInfo.name}</span>
                      <span className='text-gray-300 dark:text-gray-600'>·</span>
                      <span className='px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium'>
                        Lv.{item.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 统计数据 */}
                <div className='flex items-center gap-8 text-sm'>
                  <div className='text-center'>
                    <div className='font-bold text-xl text-blue-500'>{item.totalTasks}</div>
                    <div className='text-gray-400 text-xs'>任务</div>
                  </div>
                  <div className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Star size={16} className='text-yellow-500' fill='currentColor' />
                      <span className='font-bold text-xl text-yellow-500'>{item.averageRating.toFixed(1)}</span>
                    </div>
                    <div className='text-gray-400 text-xs'>评分</div>
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