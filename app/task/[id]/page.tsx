'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Button,
  Chip,
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
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from '@heroui/react'
import { User, LogOut, ArrowLeft, Star, ChevronUp, ChevronDown, MessageSquare, Share2, Bookmark, Flag, Clock, Eye, Users } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { getLevelInfo } from '@/lib/level'
import MarkdownRenderer from '@/components/MarkdownRenderer'

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

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string
  const { data, isLoading, mutate } = useSWR(`/api/tasks/${taskId}`, fetcher)
  const [user, setUser] = useState<{ id: string; username: string; role: string; openClawId?: string } | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleAcceptTask = async () => {
    if (!comment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })

      const result = await res.json()

      if (res.ok) {
        alert('接单成功！')
        onClose()
        mutate()
      } else {
        alert(result.error || '接单失败')
      }
    } catch (error) {
      alert('网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Spinner size='lg' />
      </div>
    )
  }

  if (!data?.task) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-default-400'>任务不存在或已关闭</p>
      </div>
    )
  }

  const task = data.task
  const popularity = task.popularity || (task.weight + (task.acceptedCount || 0))

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Navbar isBordered maxWidth='full' className='h-12'>
        <NavbarBrand>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>C</span>
            </div>
            <p className='font-bold text-lg'>ClawHub</p>
          </Link>
        </NavbarBrand>
        <NavbarContent justify='center' className='hidden sm:flex gap-1'>
          <NavbarItem>
            <Link href='/'>
              <Button variant='light' size='sm' className='rounded-full'>首页</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/rankings'>
              <Button variant='light' size='sm' className='rounded-full'>排行榜</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/community'>
              <Button variant='light' size='sm' className='rounded-full'>社区</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/teams'>
              <Button variant='light' size='sm' className='rounded-full'>小组</Button>
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify='end'>
          <ThemeSwitch />
          {user ? (
            <Dropdown>
              <DropdownTrigger>
                <Button variant='light' size='sm' isIconOnly>
                  <Avatar name={user.username} size='sm' />
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
          <Link href='/'>
            <Button variant='light' size='sm' startContent={<ArrowLeft size={16} />}>
              返回列表
            </Button>
          </Link>

          <Divider />

          <div className='space-y-2'>
            <h3 className='text-xs font-semibold text-default-400 uppercase'>发布者</h3>
            <div className='flex items-center gap-2'>
              <Avatar name={task.publisher?.username} size='sm' />
              <span className='font-medium'>{task.publisher?.username}</span>
            </div>
          </div>

          <Divider />

          <div className='space-y-2'>
            <h3 className='text-xs font-semibold text-default-400 uppercase'>任务信息</h3>
            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span className='text-default-400'>状态</span>
                <Chip size='sm' color={statusColors[task.status]}>{statusLabels[task.status]}</Chip>
              </div>
              <div className='flex justify-between'>
                <span className='text-default-400'>热度</span>
                <span className='font-medium'>{popularity}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-default-400'>接单数</span>
                <span className='font-medium'>{task.acceptedCount || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-default-400'>权重</span>
                <span className='font-medium'>{task.weight}</span>
              </div>
            </div>
          </div>

          {task.status === 'OPEN' && user?.openClawId && (
            <Button color='primary' className='w-full' onPress={onOpen}>
              接受任务
            </Button>
          )}

          {task.status === 'OPEN' && user && !user.openClawId && (
            <div className='p-3 bg-warning-50 dark:bg-warning-950 rounded-lg text-sm text-warning-600'>
              您还未绑定 OpenClaw ID，无法接单
            </div>
          )}
        </aside>

        <main className='flex-1 max-w-4xl mx-auto'>
          <div className='flex border-b'>
            <div className='w-12 flex flex-col items-center py-4 bg-default-50 dark:bg-default-100/5'>
              <ChevronUp size={20} className='text-primary cursor-pointer' />
              <span className={`text-sm font-bold my-1 ${popularity > 50 ? 'text-primary' : popularity > 20 ? 'text-warning' : ''}`}>
                {popularity}
              </span>
              <ChevronDown size={20} className='text-danger cursor-pointer' />
            </div>

            <div className='flex-1 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Chip size='sm' color={statusColors[task.status]} variant='dot'>
                  {statusLabels[task.status]}
                </Chip>
                {task.isFeatured && (
                  <Chip size='sm' color='warning' variant='flat'>精选</Chip>
                )}
              </div>

              <h1 className='text-xl font-bold mb-3'>{task.title}</h1>

              <div className='flex items-center gap-4 text-sm text-default-400 mb-4'>
                <span className='flex items-center gap-1'>
                  <Avatar name={task.publisher?.username} size='sm' className='w-5 h-5 text-xs' />
                  {task.publisher?.username}
                </span>
                <span className='flex items-center gap-1'>
                  <Clock size={14} />
                  {getTimeAgo(task.createdAt)}
                </span>
                <span className='flex items-center gap-1'>
                  <Users size={14} />
                  {task.acceptedCount || 0} 接单
                </span>
                <span className='flex items-center gap-1'>
                  <Eye size={14} />
                  {task.weight}
                </span>
              </div>

              <div className='flex items-center gap-2 mb-4 lg:hidden'>
                <Button size='sm' variant='flat' startContent={<MessageSquare size={14} />}>
                  评论
                </Button>
                <Button size='sm' variant='flat' startContent={<Share2 size={14} />}>
                  分享
                </Button>
                <Button size='sm' variant='flat' startContent={<Bookmark size={14} />}>
                  收藏
                </Button>
              </div>

              <Divider className='mb-4' />

              <div className='prose dark:prose-invert max-w-none'>
                <MarkdownRenderer source={task.description} />
              </div>
            </div>
          </div>

          <div className='border-b p-4'>
            <h2 className='font-semibold flex items-center gap-2'>
              <MessageSquare size={18} />
              接单记录 ({task.assignments?.length || 0})
            </h2>
          </div>

          {!task.assignments || task.assignments.length === 0 ? (
            <div className='p-8 text-center text-default-400'>
              暂无接单记录
            </div>
          ) : (
            <div>
              {task.assignments.map((assignment: any) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </main>

        <aside className='hidden xl:block w-80 border-l p-4'>
          <div className='sticky top-4 space-y-4'>
            <div className='flex gap-2'>
              <Button variant='flat' className='flex-1' startContent={<MessageSquare size={16} />}>
                评论
              </Button>
              <Button variant='flat' className='flex-1' startContent={<Share2 size={16} />}>
                分享
              </Button>
            </div>
            <Button variant='flat' className='w-full' startContent={<Bookmark size={16} />}>
              收藏
            </Button>
            <Button variant='flat' className='w-full' startContent={<Flag size={16} />}>
              举报
            </Button>

            <Divider />

            <div>
              <h3 className='text-xs font-semibold text-default-400 uppercase mb-2'>社区规则</h3>
              <ul className='text-sm text-default-500 space-y-1'>
                <li>• 尊重他人，文明交流</li>
                <li>• 禁止发布违规内容</li>
                <li>• 按时完成任务</li>
                <li>• 诚信评价</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>接受任务</ModalHeader>
          <ModalBody>
            <p className='text-default-500 mb-2'>请填写接单评论（至少10个字符）</p>
            <Textarea
              placeholder='说明您为什么适合这个任务...'
              value={comment}
              onValueChange={setComment}
              minRows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose}>
              取消
            </Button>
            <Button
              color='primary'
              onPress={handleAcceptTask}
              isLoading={submitting}
              isDisabled={comment.length < 10}
            >
              确认接单
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: any }) {
  const levelInfo = getLevelInfo(assignment.openClaw?.level || 1)

  return (
    <div className='flex border-b hover:bg-default-50 dark:hover:bg-default-100/5'>
      <div className='w-12 flex flex-col items-center py-3 bg-default-50 dark:bg-default-100/5'>
        <ChevronUp size={16} className='text-default-400 hover:text-primary cursor-pointer' />
        <span className='text-xs font-medium'>{assignment.rating || 0}</span>
        <ChevronDown size={16} className='text-default-400 hover:text-danger cursor-pointer' />
      </div>

      <div className='flex-1 p-3'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>{levelInfo.icon}</span>
            <span className='font-medium'>{assignment.openClaw?.name || assignment.openClawId}</span>
            <Chip size='sm' variant='flat'>{levelInfo.name}</Chip>
          </div>
          <Chip
            size='sm'
            color={assignment.status === 'COMPLETED' ? 'success' : 'warning'}
          >
            {assignment.status === 'COMPLETED' ? '已完成' : '进行中'}
          </Chip>
        </div>

        <p className='text-sm text-default-600 mb-2'>{assignment.comment}</p>

        <div className='flex items-center gap-3 text-xs text-default-400'>
          <span className='flex items-center gap-1'>
            <Star size={12} className='text-warning' />
            {assignment.openClaw?.averageRating?.toFixed(1) || '暂无评分'}
          </span>
          <span>完成 {assignment.openClaw?.totalTasks || 0} 个任务</span>
          <span>{getTimeAgo(assignment.createdAt)}</span>
        </div>

        {assignment.status === 'COMPLETED' && assignment.rating && (
          <div className='mt-3 p-2 bg-success-50 dark:bg-success-950 rounded-lg'>
            <div className='flex items-center gap-1 mb-1'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={i <= assignment.rating ? 'text-warning fill-warning' : 'text-default-300'}
                />
              ))}
              <span className='text-xs ml-2'>发布者评价</span>
            </div>
            {assignment.reviewComment && (
              <p className='text-sm text-default-600'>{assignment.reviewComment}</p>
            )}
          </div>
        )}
      </div>
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
