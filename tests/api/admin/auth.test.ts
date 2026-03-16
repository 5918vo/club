import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as LoginPOST } from '@/app/api/admin/login/route'
import { GET as MeGET } from '@/app/api/admin/me/route'
import { POST as LogoutPOST } from '@/app/api/admin/logout/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    admin: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  generateToken: vi.fn(),
  verifyToken: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({ success: true })),
  getClientIp: vi.fn(() => '127.0.0.1'),
  createRateLimitResponse: vi.fn(() => new Response('Rate limited', { status: 429 })),
}))

import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken, verifyToken } from '@/lib/auth'

const mockPrisma = prisma as unknown as {
  admin: {
    findUnique: ReturnType<typeof vi.fn>
  }
}

const mockVerifyPassword = verifyPassword as ReturnType<typeof vi.fn>
const mockGenerateToken = generateToken as ReturnType<typeof vi.fn>
const mockVerifyToken = verifyToken as ReturnType<typeof vi.fn>

function createMockRequest(url: string, options?: { method?: string; body?: object; cookies?: Record<string, string> }) {
  const cookies = options?.cookies || {}
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options?.method || 'GET',
    headers: {
      cookie: cookieHeader,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
}

describe('Admin Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/admin/login', () => {
    it('should return 400 when email is missing', async () => {
      const request = createMockRequest('/api/admin/login', {
        method: 'POST',
        body: { password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('邮箱和密码不能为空')
    })

    it('should return 400 when password is missing', async () => {
      const request = createMockRequest('/api/admin/login', {
        method: 'POST',
        body: { email: 'admin@test.com' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('邮箱和密码不能为空')
    })

    it('should return 401 when admin not found', async () => {
      mockPrisma.admin.findUnique.mockResolvedValue(null)
      
      const request = createMockRequest('/api/admin/login', {
        method: 'POST',
        body: { email: 'admin@test.com', password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('邮箱或密码错误')
    })

    it('should return 403 when admin is disabled', async () => {
      mockPrisma.admin.findUnique.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        username: 'admin',
        password: 'hashedpassword',
        isActive: false,
      })
      
      const request = createMockRequest('/api/admin/login', {
        method: 'POST',
        body: { email: 'admin@test.com', password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toBe('账号已被禁用')
    })

    it('should return 401 when password is wrong', async () => {
      mockPrisma.admin.findUnique.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        username: 'admin',
        password: 'hashedpassword',
        isActive: true,
      })
      mockVerifyPassword.mockResolvedValue(false)
      
      const request = createMockRequest('/api/admin/login', {
        method: 'POST',
        body: { email: 'admin@test.com', password: 'wrongpassword' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('邮箱或密码错误')
    })

    it('should login successfully', async () => {
      mockPrisma.admin.findUnique.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        username: 'admin',
        password: 'hashedpassword',
        isActive: true,
      })
      mockVerifyPassword.mockResolvedValue(true)
      mockGenerateToken.mockReturnValue('mock-token')
      
      const request = createMockRequest('/api/admin/login', {
        method: 'POST',
        body: { email: 'admin@test.com', password: 'password123' },
      })
      
      const response = await LoginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.message).toBe('登录成功')
      expect(data.admin.email).toBe('admin@test.com')
    })
  })

  describe('GET /api/admin/me', () => {
    it('should return 401 when no token', async () => {
      const request = createMockRequest('/api/admin/me')
      
      const response = await MeGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('未授权')
    })

    it('should return 401 when invalid token', async () => {
      mockVerifyToken.mockReturnValue(null)
      
      const request = createMockRequest('/api/admin/me', {
        cookies: { admin_token: 'invalid-token' },
      })
      
      const response = await MeGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('无效的令牌')
    })
  })

  describe('POST /api/admin/logout', () => {
    it('should logout successfully', async () => {
      const request = createMockRequest('/api/admin/logout', {
        method: 'POST',
      })
      
      const response = await LogoutPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.message).toBe('登出成功')
    })
  })
})
