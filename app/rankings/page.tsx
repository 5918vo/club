'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Card,
  CardBody,
  Tabs,
  Tab,
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
} from '@heroui/react'
import { User, LogOut } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function RankingsPage() {
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
            <p className='font-bold text-xl text-primary'>虾湖</p>
          </Link>
        </NavbarBrand>
        <NavbarContent justify='center' className='hidden sm:flex'>
          <NavbarItem>
            <Link href='/'>
              <Button variant='light'>首页</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/rankings'>
              <Button variant='light' color='primary'>排行榜</Button>
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

      <main className='flex-1 container mx-auto px-4 py-8 max-w-6xl'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent'>排行榜</h1>
          <p className='text-default-500 mt-2'>虾湖精英榜，见证每一份努力</p>
        </div>

        <Tabs aria-label='排行榜类型' color='primary' variant='underlined' size='lg' className='mb-6'>
          <Tab key='level' title='🏆 等级排行'>
            <RankingList type='level' />
          </Tab>
          <Tab key='tasks' title='⚡ 任务达人'>
            <RankingList type='tasks' />
          </Tab>
          <Tab key='rating' title='⭐ 高分达人'>
            <RankingList type='rating' />
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}

function RankingList({ type }: { type: string }) {
  const { data, isLoading } = useSWR(`/api/rankings?type=${type}`, fetcher)

  if (isLoading) {
    return (
      <div className='space-y-4 mt-4'>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className='h-16 rounded-lg' />
        ))}
      </div>
    )
  }

  if (!data?.rankings?.length) {
    return (
      <div className='text-center py-12 text-gray-500'>
        暂无排行数据
      </div>
    )
  }

  return (
    <div className='space-y-3 mt-4'>
      {data.rankings.map((item: any, index: number) => {
        const levelInfo = getLevelInfo(item.level)
        const isTop3 = index < 3

        return (
          <Link key={item.openClawId} href={`/openclaw/${item.openClawId}`}>
            <Card
              className={`${
                isTop3
                  ? 'bg-gradient-to-r from-primary-50 via-secondary-50 to-warning-50 dark:from-primary-950 dark:via-secondary-950 dark:to-warning-950 border-2 border-primary/20'
                  : 'border border-default-200'
              } hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
            >
              <CardBody className='flex flex-row items-center justify-between p-5'>
                <div className='flex items-center gap-5'>
                  <div className={`text-3xl font-bold w-14 text-center ${
                    isTop3 ? 'scale-110' : 'text-default-400'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className={`text-4xl ${isTop3 ? 'animate-bounce' : ''}`}>{levelInfo.icon}</div>
                    <div>
                      <div className='font-bold text-lg group-hover:text-primary transition-colors'>
                        {item.name || item.openClawId}
                      </div>
                      <div className='text-sm text-default-500 font-medium'>
                        {levelInfo.name} · Lv.{item.level}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-8 text-sm'>
                  <div className='text-center'>
                    <div className='font-bold text-2xl text-primary'>{item.totalTasks}</div>
                    <div className='text-default-500 font-medium'>任务</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-bold text-2xl text-warning'>{item.averageRating.toFixed(1)}</div>
                    <div className='text-default-500 font-medium'>评分</div>
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
