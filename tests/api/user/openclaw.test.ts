import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, DELETE } from '@/app/api/user/openclaw/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    openClawAccount: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  verifyToken: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  openClawAccount: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

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

describe('OpenClaw Binding API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/user/openclaw (Bind)', () => {
    it('should return 401 when not logged in', async () => {
      const request = createMockRequest('/api/user/openclaw', {
        method: 'POST',
        body: { bindToken: 'token123' },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('未登录')
    })

    it('should return 401 when token expired', async () => {
      mockVerifyToken.mockReturnValue(null)
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'POST',
        cookies: { token: 'expired-token' },
        body: { bindToken: 'token123' },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('登录已过期')
    })

    it('should return 400 when bindToken is missing', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'test@test.com' })
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'POST',
        cookies: { token: 'valid-token' },
        body: { bindToken: '' },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('绑定 Token 不能为空')
    })

    it('should return 400 when bindToken is invalid', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'test@test.com' })
      mockPrisma.openClawAccount.findUnique.mockResolvedValue(null)
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'POST',
        cookies: { token: 'valid-token' },
        body: { bindToken: 'invalid-token' },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('无效的绑定 Token')
    })

    it('should return 400 when OpenClaw account is not active', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'test@test.com' })
      mockPrisma.openClawAccount.findUnique.mockResolvedValue({
        id: '1',
        openClawId: 'oc-123',
        status: 'PENDING',
        bound: false,
      })
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'POST',
        cookies: { token: 'valid-token' },
        body: { bindToken: 'valid-bind-token' },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('该 OpenClaw 账号未激活或已被封禁')
    })

    it('should return 400 when OpenClaw account is already bound', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'test@test.com' })
      mockPrisma.openClawAccount.findUnique.mockResolvedValue({
        id: '1',
        openClawId: 'oc-123',
        status: 'ACTIVE',
        bound: true,
      })
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'POST',
        cookies: { token: 'valid-token' },
        body: { bindToken: 'valid-bind-token' },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('该 OpenClaw 账号已被绑定')
    })

    it('should bind successfully', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'test@test.com' })
      mockPrisma.openClawAccount.findUnique.mockResolvedValue({
        id: '1',
        openClawId: 'oc-123',
        status: 'ACTIVE',
        bound: false,
      })
      mockPrisma.user.update.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        openClawId: 'oc-123',
        createdAt: new Date(),
      })
      mockPrisma.openClawAccount.update.mockResolvedValue({})
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'POST',
        cookies: { token: 'valid-token' },
        body: { bindToken: 'valid-bind-token' },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.message).toBe('绑定成功')
      expect(data.user.openClawId).toBe('oc-123')
    })
  })

  describe('DELETE /api/user/openclaw (Unbind)', () => {
    it('should return 401 when not logged in', async () => {
      const request = createMockRequest('/api/user/openclaw', {
        method: 'DELETE',
      })
      
      const response = await DELETE(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('未登录')
    })

    it('should return 400 when not bound', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'test@test.com' })
      mockPrisma.user.findUnique.mockResolvedValue({
        openClawId: null,
      })
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'DELETE',
        cookies: { token: 'valid-token' },
      })
      
      const response = await DELETE(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('未绑定 OpenClaw ID')
    })

    it('should unbind successfully', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'test@test.com' })
      mockPrisma.user.findUnique.mockResolvedValue({
        openClawId: 'oc-123',
      })
      mockPrisma.user.update.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        openClawId: null,
        createdAt: new Date(),
      })
      mockPrisma.openClawAccount.update.mockResolvedValue({})
      
      const request = createMockRequest('/api/user/openclaw', {
        method: 'DELETE',
        cookies: { token: 'valid-token' },
      })
      
      const response = await DELETE(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.message).toBe('解绑成功')
      expect(data.user.openClawId).toBeNull()
    })
  })
})
