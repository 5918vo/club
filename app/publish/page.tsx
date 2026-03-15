'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Card,
  CardBody,
  Button,
  Input,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from '@heroui/react'
import { User, LogOut } from 'lucide-react'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function PublishPage() {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        } else {
          window.location.href = '/login'
        }
      })
      .catch(() => {
        window.location.href = '/login'
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('请填写标题和描述')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '发布失败')
      } else {
        setSuccess(true)
        setTitle('')
        setDescription('')
        setTimeout(() => {
          window.location.href = `/task/${data.task.id}`
        }, 1500)
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Spinner size='lg' />
      </div>
    )
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
              <Button variant='light'>小组</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/publish'>
              <Button variant='light' color='primary'>发布任务</Button>
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify='end'>
          <ThemeSwitch />
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
        </NavbarContent>
      </Navbar>

      <main className='flex-1 container mx-auto px-4 py-6'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6'>发布任务</h1>

          <Card>
            <CardBody className='p-6 space-y-4'>
              {success && (
                <div className='p-4 bg-success-50 dark:bg-success-950 text-success-600 rounded-lg'>
                  任务发布成功！正在跳转...
                </div>
              )}

              {error && (
                <div className='p-4 bg-danger-50 dark:bg-danger-950 text-danger-600 rounded-lg'>
                  {error}
                </div>
              )}

              <div>
                <label className='block text-sm font-medium mb-2'>任务标题</label>
                <Input
                  placeholder='请输入任务标题（3-100字符）'
                  value={title}
                  onValueChange={setTitle}
                  maxLength={100}
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>任务描述</label>
                <div className='border rounded-lg overflow-hidden'>
                  <MarkdownEditor
                    value={description}
                    onChange={setDescription}
                    height={300}
                    placeholder='请详细描述任务要求（10-2000字符）\n\n支持 Markdown 格式'
                    maxLength={2000}
                  />
                </div>
                <p className='text-xs text-gray-400 mt-1'>
                  {description.length}/2000 字符
                </p>
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <Button
                  variant='light'
                  onPress={() => {
                    setTitle('')
                    setDescription('')
                  }}
                >
                  清空
                </Button>
                <Button
                  color='primary'
                  onPress={handleSubmit}
                  isLoading={loading}
                >
                  发布任务
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className='mt-6'>
            <CardBody className='p-4'>
              <h3 className='font-semibold mb-2'>Markdown 格式说明</h3>
              <div className='text-sm text-gray-500 space-y-1'>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>**文字**</code> 粗体</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>*文字*</code> 斜体</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>`代码`</code> 行内代码</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>```语言</code> 代码块</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>- 项目</code> 无序列表</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>1. 项目</code> 有序列表</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>&gt; 文字</code> 引用</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>[链接](url)</code> 超链接</p>
                <p><code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>![图片](url)</code> 图片</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  )
}
