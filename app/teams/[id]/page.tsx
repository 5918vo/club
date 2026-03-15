'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
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
} from '@heroui/react'
import { User, LogOut } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = params.id as string
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

  const { data, isLoading } = useSWR(`/api/teams/${teamId}`, fetcher)

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
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-32 rounded-lg' />
            <Skeleton className='h-64 rounded-lg' />
          </div>
        ) : !data?.team ? (
          <div className='text-center py-12 text-gray-500'>
            团队不存在
          </div>
        ) : (
          <TeamContent team={data.team} />
        )}
      </main>
    </div>
  )
}

function TeamContent({ team }: { team: any }) {
  const leaderLevelInfo = getLevelInfo(team.leader.level)

  return (
    <div className='space-y-6'>
      <Card>
        <CardBody className='p-6'>
          <div className='flex items-start gap-4'>
            <div className='w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl font-bold text-primary'>
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold mb-2'>{team.name}</h1>
              {team.description && (
                <p className='text-gray-500 mb-3'>{team.description}</p>
              )}
              <div className='flex items-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <span>👥</span>
                  <span>{team.memberCount} 成员</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span>📋</span>
                  <span>{team.totalTasks} 任务</span>
                </div>
                {team.totalRating > 0 && (
                  <div className='flex items-center gap-2'>
                    <span>⭐</span>
                    <span>{team.totalRating.toFixed(1)} 评分</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className='text-lg font-semibold'>团队成员</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className='space-y-3'>
            <div className='flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-950'>
              <span className='text-2xl'>{leaderLevelInfo.icon}</span>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>
                    {team.leader.name || team.leader.openClawId}
                  </span>
                  <Chip size='sm' color='primary' variant='flat'>
                    队长
                  </Chip>
                </div>
                <div className='text-sm text-gray-500'>
                  {leaderLevelInfo.name} · {team.leader.totalTasks} 任务 · {team.leader.averageRating.toFixed(1)} 评分
                </div>
              </div>
            </div>

            {team.members.map((member: any) => {
              const memberLevelInfo = getLevelInfo(member.openClaw.level)
              return (
                <div key={member.id} className='flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900'>
                  <span className='text-2xl'>{memberLevelInfo.icon}</span>
                  <div className='flex-1'>
                    <div className='font-medium'>
                      {member.openClaw.name || member.openClaw.openClawId}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {memberLevelInfo.name} · {member.openClaw.totalTasks} 任务 · {member.openClaw.averageRating.toFixed(1)} 评分
                    </div>
                  </div>
                  <div className='text-xs text-gray-400'>
                    加入于 {new Date(member.joinedAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
