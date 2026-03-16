import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH } from '@/app/api/admin/users/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
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
    count: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
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

describe('Admin Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/users', () => {
    it('should return 401 when no admin_token is provided', async () => {
      const request = createMockRequest('/api/admin/users')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('未登录')
    })

    it('should return 403 when token is invalid', async () => {
      mockVerifyToken.mockReturnValue(null)
      
      const request = createMockRequest('/api/admin/users', {
        cookies: { admin_token: 'invalid-token' },
      })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toBe('无权限')
    })

    it('should return users list for admin', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'admin@test.com' })
      mockPrisma.user.count.mockResolvedValue(2)
      mockPrisma.user.findMany.mockResolvedValue([
        { id: '1', email: 'user1@test.com', username: 'user1', openClawId: null, isActive: true, createdAt: new Date() },
        { id: '2', email: 'user2@test.com', username: 'user2', openClawId: 'oc-123', isActive: false, createdAt: new Date() },
      ])
      
      const request = createMockRequest('/api/admin/users?page=1&limit=10', {
        cookies: { admin_token: 'valid-token' },
      })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(2)
      expect(data.pagination.total).toBe(2)
      expect(data.pagination.page).toBe(1)
    })

    it('should filter users by search term', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'admin@test.com' })
      mockPrisma.user.count.mockResolvedValue(1)
      mockPrisma.user.findMany.mockResolvedValue([
        { id: '1', email: 'john@test.com', username: 'john', openClawId: null, isActive: true, createdAt: new Date() },
      ])
      
      const request = createMockRequest('/api/admin/users?page=1&limit=10&search=john', {
        cookies: { admin_token: 'valid-token' },
      })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { username: { contains: 'john' } },
              { email: { contains: 'john' } },
            ],
          }),
        })
      )
    })

    it('should filter users by status', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'admin@test.com' })
      mockPrisma.user.count.mockResolvedValue(1)
      mockPrisma.user.findMany.mockResolvedValue([
        { id: '1', email: 'user@test.com', username: 'user', openClawId: null, isActive: false, createdAt: new Date() },
      ])
      
      const request = createMockRequest('/api/admin/users?page=1&limit=10&status=disabled', {
        cookies: { admin_token: 'valid-token' },
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: false,
          }),
        })
      )
    })
  })

  describe('PATCH /api/admin/users', () => {
    it('should return 401 when no admin_token is provided', async () => {
      const request = createMockRequest('/api/admin/users', {
        method: 'PATCH',
        body: { userId: '2', isActive: false },
      })
      
      const response = await PATCH(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('未登录')
    })

    it('should return 403 when token is invalid', async () => {
      mockVerifyToken.mockReturnValue(null)
      
      const request = createMockRequest('/api/admin/users', {
        method: 'PATCH',
        cookies: { admin_token: 'invalid-token' },
        body: { userId: '2', isActive: false },
      })
      
      const response = await PATCH(request)
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toBe('无权限')
    })

    it('should return 400 when userId is missing', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'admin@test.com' })
      
      const request = createMockRequest('/api/admin/users', {
        method: 'PATCH',
        cookies: { admin_token: 'valid-token' },
        body: { isActive: false },
      })
      
      const response = await PATCH(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('缺少用户ID')
    })

    it('should return 400 when isActive is missing', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'admin@test.com' })
      
      const request = createMockRequest('/api/admin/users', {
        method: 'PATCH',
        cookies: { admin_token: 'valid-token' },
        body: { userId: '2' },
      })
      
      const response = await PATCH(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('缺少状态参数')
    })

    it('should update user status successfully', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', email: 'admin@test.com' })
      mockPrisma.user.update.mockResolvedValue({
        id: '2',
        email: 'user@test.com',
        username: 'user',
        isActive: false,
      })
      
      const request = createMockRequest('/api/admin/users', {
        method: 'PATCH',
        cookies: { admin_token: 'valid-token' },
        body: { userId: '2', isActive: false },
      })
      
      const response = await PATCH(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.user.isActive).toBe(false)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '2' },
        data: { isActive: false },
        select: expect.any(Object),
      })
    })
  })
})
