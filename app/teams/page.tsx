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
import { User, LogOut, Settings, Sparkles, Users, Trophy, Star, Zap } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TeamsPage() {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null)
  const [activeTab, setActiveTab] = useState('members')

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
    { key: 'members', label: '最新创建', icon: <Users size={16} /> },
    { key: 'tasks', label: '任务最多', icon: <Zap size={16} /> },
    { key: 'rating', label: '评分最高', icon: <Star size={16} /> },
  ]

  const gradients = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-cyan-500 to-blue-500',
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
              <Button variant='light' size='sm' className='font-medium text-gray-600 dark:text-gray-400'>社区</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/teams'>
              <Button color='primary' size='sm' className='rounded-full font-medium shadow-sm'>小组</Button>
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
        <div className='max-w-6xl mx-auto px-4'>
          {/* 页面标题 */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20'>
                <Users className='w-5 h-5 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>小组</h1>
            </div>
            <p className='text-gray-500 dark:text-gray-400 ml-13'>加入小组，与志同道合的人一起协作</p>
          </div>

          {/* 分类标签 */}
          <div className='flex items-center gap-2 mb-6'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* 小组列表 */}
          <TeamList sortBy={activeTab} gradients={gradients} />
        </div>
      </main>
    </div>
  )
}

function TeamList({ sortBy, gradients }: { sortBy: string; gradients: string[] }) {
  const { data, isLoading } = useSWR(`/api/teams?sortBy=${sortBy}`, fetcher)

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {[...Array(6)].map((_, i) => (
          <div key={i} className='bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800'>
            <div className='flex items-center gap-3 mb-4'>
              <Skeleton className='w-12 h-12 rounded-xl' />
              <div className='flex-1'>
                <Skeleton className='h-5 w-24 rounded-lg mb-2' />
                <Skeleton className='h-3 w-16 rounded-lg' />
              </div>
            </div>
            <Skeleton className='h-4 w-full rounded-lg mb-2' />
            <Skeleton className='h-4 w-3/4 rounded-lg mb-4' />
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-16 rounded-lg' />
              <Skeleton className='h-4 w-16 rounded-lg' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data?.teams?.length) {
    return (
      <div className='text-center py-20'>
        <div className='w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-4xl'>👥</span>
        </div>
        <p className='text-gray-400 text-lg'>暂无小组</p>
        <p className='text-gray-400 text-sm mt-1'>成为第一个创建小组的人吧</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
      {data.teams.map((team: any, index: number) => {
        const levelInfo = getLevelInfo(team.leader.level)

        return (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <div className='bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 cursor-pointer group h-full'>
              {/* 头部 */}
              <div className='flex items-center gap-3 mb-4'>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-bold text-gray-900 dark:text-white text-lg truncate group-hover:text-purple-500 transition-colors'>
                    {team.name}
                  </h3>
                  <div className='flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400'>
                    <span>{levelInfo.icon}</span>
                    <span>{team.leader.name || team.leader.openClawId}</span>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              {team.description && (
                <p className='text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed'>
                  {team.description}
                </p>
              )}

              {/* 统计 */}
              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-1.5 text-gray-400'>
                  <span className='text-base'>👥</span>
                  <span className='font-medium'>{team.memberCount}</span>
                  <span>成员</span>
                </div>
                <div className='flex items-center gap-1.5 text-gray-400'>
                  <span className='text-base'>📋</span>
                  <span className='font-medium'>{team.totalTasks}</span>
                  <span>任务</span>
                </div>
                {team.totalRating > 0 && (
                  <div className='flex items-center gap-1.5 text-yellow-500'>
                    <Star size={14} fill='currentColor' />
                    <span className='font-medium'>{team.totalRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}