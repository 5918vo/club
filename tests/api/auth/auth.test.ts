import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as LoginPOST } from '@/app/api/auth/login/route'
import { POST as RegisterPOST } from '@/app/api/auth/register/route'
import { GET as MeGET } from '@/app/api/auth/me/route'
import { POST as LogoutPOST } from '@/app/api/auth/logout/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  generateToken: vi.fn(),
  verifyToken: vi.fn(),
  hashPassword: vi.fn(),
  extractTokenFromHeader: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({ success: true })),
  getClientIp: vi.fn(() => '127.0.0.1'),
  createRateLimitResponse: vi.fn(() => new Response('Rate limited', { status: 429 })),
}))

import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken, verifyToken, hashPassword, extractTokenFromHeader } from '@/lib/auth'

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
  }
}

const mockVerifyPassword = verifyPassword as ReturnType<typeof vi.fn>
const mockGenerateToken = generateToken as ReturnType<typeof vi.fn>
const mockVerifyToken = verifyToken as ReturnType<typeof vi.fn>
const mockHashPassword = hashPassword as ReturnType<typeof vi.fn>
const mockExtractTokenFromHeader = extractTokenFromHeader as ReturnType<typeof vi.fn>

function createMockRequest(url: string, options?: { method?: string; body?: object; cookies?: Record<string, string>; headers?: Record<string, string> }) {
  const cookies = options?.cookies || {}
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')

  const headers: Record<string, string> = {
    cookie: cookieHeader,
    'Content-Type': 'application/json',
    ...options?.headers,
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
}

describe('User Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should return 400 for invalid email', async () => {
      const request = createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'invalid-email', username: 'testuser', password: 'password123' },
      })
      
      const response = await RegisterPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('输入数据验证失败')
    })

    it('should return 400 for short password', async () => {
      const request = createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'test@test.com', username: 'testuser', password: '123' },
      })
      
      const response = await RegisterPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('输入数据验证失败')
    })

    it('should return 400 when email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'existinguser',
      })
      
      const request = createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'test@test.com', username: 'newuser', password: 'password123' },
      })
      
      const response = await RegisterPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('邮箱已被注册')
    })

    it('should return 400 when username already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'other@test.com',
        username: 'testuser',
      })
      
      const request = createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'new@test.com', username: 'testuser', password: 'password123' },
      })
      
      const response = await RegisterPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('用户名已被使用')
    })

    it('should register successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null)
      mockHashPassword.mockResolvedValue('hashedpassword')
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedpassword',
        isActive: true,
        createdAt: new Date(),
      })
      mockGenerateToken.mockReturnValue('mock-token')
      
      const request = createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'test@test.com', username: 'testuser', password: 'password123' },
      })
      
      const response = await RegisterPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.message).toBe('注册成功')
      expect(data.user.email).toBe('test@test.com')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should return 400 when email is missing', async () => {
      const request = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: { password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('输入数据验证失败')
    })

    it('should return 401 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      
      const request = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@test.com', password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('邮箱或密码错误')
    })

    it('should return 403 when user is disabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedpassword',
        isActive: false,
      })
      
      const request = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@test.com', password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toBe('账号已被禁用')
    })

    it('should return 401 when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedpassword',
        isActive: true,
      })
      mockVerifyPassword.mockResolvedValue(false)
      
      const request = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@test.com', password: 'wrongpassword' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('邮箱或密码错误')
    })

    it('should login successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedpassword',
        isActive: true,
      })
      mockVerifyPassword.mockResolvedValue(true)
      mockGenerateToken.mockReturnValue('mock-token')
      
      const request = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@test.com', password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.message).toBe('登录成功')
      expect(data.user.email).toBe('test@test.com')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return 401 when no token', async () => {
      mockExtractTokenFromHeader.mockReturnValue(null)
      
      const request = createMockRequest('/api/auth/me')
      
      const response = await MeGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('未授权')
    })

    it('should return 401 when invalid token', async () => {
      mockExtractTokenFromHeader.mockReturnValue(null)
      mockVerifyToken.mockReturnValue(null)

      const request = createMockRequest('/api/auth/me', {
        cookies: { token: 'invalid-token' },
      })

      const response = await MeGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('无效的令牌')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const request = createMockRequest('/api/auth/logout', {
        method: 'POST',
      })
      
      const response = await LogoutPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.message).toBe('登出成功')
    })
  })
})
