'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Button,
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
} from '@heroui/react'
import { User, LogOut, Settings, FileText, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react'
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
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950'>
        <Spinner size='lg' />
      </div>
    )
  }

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
              <Button variant='light' size='sm' className='font-medium text-gray-600 dark:text-gray-400'>小组</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/publish'>
              <Button color='primary' size='sm' className='rounded-full font-medium shadow-sm'>发布任务</Button>
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify='end' className='gap-2'>
          <ThemeSwitch />
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
        </NavbarContent>
      </Navbar>

      {/* 主内容区 */}
      <main className='flex-1 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          {/* 页面标题 */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20'>
                <FileText className='w-5 h-5 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>发布任务</h1>
            </div>
            <p className='text-gray-500 dark:text-gray-400 ml-13'>分享你的想法，让更多人帮助你解决问题</p>
          </div>

          {/* 表单区域 */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* 左侧主表单 */}
            <div className='lg:col-span-2'>
              <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-6'>
                {/* 成功提示 */}
                {success && (
                  <div className='mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-green-500' />
                    <span className='text-green-600 dark:text-green-400 font-medium'>任务发布成功！正在跳转...</span>
                  </div>
                )}

                {/* 错误提示 */}
                {error && (
                  <div className='mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'>
                    <p className='text-red-500 text-sm'>{error}</p>
                  </div>
                )}

                {/* 标题输入 */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    任务标题 <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      placeholder='请输入任务标题（3-100字符）'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      className='w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
                    />
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400'>
                      {title.length}/100
                    </span>
                  </div>
                </div>

                {/* 描述输入 */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    任务描述 <span className='text-red-500'>*</span>
                  </label>
                  <div className='rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all'>
                    <MarkdownEditor
                      value={description}
                      onChange={setDescription}
                      height={320}
                      placeholder='请详细描述任务要求（10-2000字符）\n\n支持 Markdown 格式'
                      maxLength={2000}
                    />
                  </div>
                  <div className='flex justify-between items-center mt-2'>
                    <p className='text-xs text-gray-400'>
                      支持 Markdown 格式
                    </p>
                    <p className='text-xs text-gray-400'>
                      {description.length}/2000 字符
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800'>
                  <Button
                    variant='light'
                    onPress={() => {
                      setTitle('')
                      setDescription('')
                      setError('')
                    }}
                    className='font-medium'
                  >
                    清空内容
                  </Button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className='px-6 h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {loading ? (
                      <>
                        <Spinner size='sm' color='white' />
                        <span>发布中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>发布任务</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧辅助信息 */}
            <div className='space-y-5'>
              {/* 发布须知 */}
              <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-5'>
                <div className='flex items-center gap-2 mb-4'>
                  <HelpCircle size={18} className='text-orange-500' />
                  <h3 className='font-bold text-gray-900 dark:text-white'>发布须知</h3>
                </div>
                <ul className='space-y-3 text-sm text-gray-600 dark:text-gray-400'>
                  <li className='flex items-start gap-2'>
                    <span className='text-orange-500 mt-0.5'>•</span>
                    <span>标题应简洁明了，概括任务核心</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-orange-500 mt-0.5'>•</span>
                    <span>描述要详细，包含具体要求和期望</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-orange-500 mt-0.5'>•</span>
                    <span>可添加代码片段帮助理解</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-orange-500 mt-0.5'>•</span>
                    <span>发布后可在任务详情页编辑</span>
                  </li>
                </ul>
              </div>

              {/* Markdown 说明 */}
              <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-5'>
                <div className='flex items-center gap-2 mb-4'>
                  <FileText size={18} className='text-blue-500' />
                  <h3 className='font-bold text-gray-900 dark:text-white'>Markdown 语法</h3>
                </div>
                <div className='space-y-2.5 text-sm'>
                  <div className='flex items-center justify-between'>
                    <code className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs'>**文字**</code>
                    <span className='text-gray-500 dark:text-gray-400'>粗体</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <code className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs'>*文字*</code>
                    <span className='text-gray-500 dark:text-gray-400'>斜体</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <code className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs'>`代码`</code>
                    <span className='text-gray-500 dark:text-gray-400'>行内代码</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <code className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs'>```语言</code>
                    <span className='text-gray-500 dark:text-gray-400'>代码块</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <code className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs'>- 项目</code>
                    <span className='text-gray-500 dark:text-gray-400'>列表</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <code className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs'>[文字](url)</code>
                    <span className='text-gray-500 dark:text-gray-400'>链接</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <code className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs'>![图片](url)</code>
                    <span className='text-gray-500 dark:text-gray-400'>图片</span>
                  </div>
                </div>
              </div>

              {/* 快速提示 */}
              <div className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-5 border border-orange-100 dark:border-orange-900/50'>
                <div className='flex items-center gap-2 mb-3'>
                  <Sparkles size={18} className='text-orange-500' />
                  <h3 className='font-bold text-gray-900 dark:text-white'>小技巧</h3>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                  添加代码片段和示例可以让其他用户更快理解你的需求，提高任务解决效率。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}