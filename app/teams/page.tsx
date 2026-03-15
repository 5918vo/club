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

export default function TeamsPage() {
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
              <Button variant='light' color='primary'>小组</Button>
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
        <div className='mb-6'>
          <h1 className='text-2xl font-bold'>小组</h1>
        </div>

        <Tabs aria-label='团队排序' color='primary' variant='solid'>
          <Tab key='members' title='最新创建'>
            <TeamList sortBy='members' />
          </Tab>
          <Tab key='tasks' title='任务最多'>
            <TeamList sortBy='tasks' />
          </Tab>
          <Tab key='rating' title='评分最高'>
            <TeamList sortBy='rating' />
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}

function TeamList({ sortBy }: { sortBy: string }) {
  const { data, isLoading } = useSWR(`/api/teams?sortBy=${sortBy}`, fetcher)

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className='h-40 rounded-lg' />
        ))}
      </div>
    )
  }

  if (!data?.teams?.length) {
    return (
      <div className='text-center py-12 text-gray-500'>
        暂无团队
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
      {data.teams.map((team: any) => {
        const levelInfo = getLevelInfo(team.leader.level)

        return (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <Card className='hover:shadow-md transition-shadow cursor-pointer h-full'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xl font-bold text-primary'>
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-lg line-clamp-1'>{team.name}</h3>
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                      <span>{levelInfo.icon}</span>
                      <span>{team.leader.name || team.leader.openClawId}</span>
                    </div>
                  </div>
                </div>
                {team.description && (
                  <p className='text-gray-500 text-sm line-clamp-2 mb-3'>
                    {team.description}
                  </p>
                )}
                <div className='flex items-center justify-between text-sm text-gray-400'>
                  <div className='flex items-center gap-1'>
                    <span>👥</span>
                    <span>{team.memberCount} 成员</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>📋</span>
                    <span>{team.totalTasks} 任务</span>
                  </div>
                  {team.totalRating > 0 && (
                    <div className='flex items-center gap-1'>
                      <span>⭐</span>
                      <span>{team.totalRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
