import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/admin/tasks/route'
import { POST as ApprovePost } from '@/app/api/admin/tasks/[id]/approve/route'
import { POST as RejectPost } from '@/app/api/admin/tasks/[id]/reject/route'
import { PATCH as WeightPatch } from '@/app/api/admin/tasks/[id]/weight/route'
import { POST as ClosePost } from '@/app/api/admin/tasks/[id]/close/route'
import { POST as ReopenPost } from '@/app/api/admin/tasks/[id]/reopen/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      count: vi.fn(),
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
  task: {
    findMany: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

const mockVerifyToken = verifyToken as ReturnType<typeof vi.fn>

function createRequest(url: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(new URL(url, 'http://localhost'), {
    method: 'GET',
  })
  Object.entries(cookies).forEach(([key, value]) => {
    request.cookies.set(key, value)
  })
  return request
}

describe('Admin Tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/tasks', () => {
    it('should return 401 if not logged in', async () => {
      const request = createRequest('/api/admin/tasks')
      const response = await GET(request)
      expect(response.status).toBe(401)
    })

    it('should return 403 if not admin', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', role: 'USER' })
      const request = createRequest('/api/admin/tasks', { token: 'valid' })
      const response = await GET(request)
      expect(response.status).toBe(403)
    })

    it('should return tasks list for admin', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', role: 'ADMIN' })
      mockPrisma.task.count.mockResolvedValue(2)
      mockPrisma.task.findMany.mockResolvedValue([
        {
          id: '1',
          title: 'Task 1',
          status: 'OPEN',
          weight: 10,
          publisherId: 'u1',
          publisher: { id: 'u1', username: 'user1' },
          reviewer: null,
          _count: { assignments: 5 },
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Task 2',
          status: 'PENDING',
          weight: 5,
          publisherId: 'u2',
          publisher: { id: 'u2', username: 'user2' },
          reviewer: null,
          _count: { assignments: 0 },
          createdAt: new Date(),
        },
      ])

      const request = createRequest('/api/admin/tasks', { token: 'valid' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tasks).toHaveLength(2)
      expect(data.tasks[0].popularity).toBe(15)
      expect(data.pagination.total).toBe(2)
    })

    it('should filter by status', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', role: 'ADMIN' })
      mockPrisma.task.count.mockResolvedValue(1)
      mockPrisma.task.findMany.mockResolvedValue([])

      const request = createRequest('/api/admin/tasks?status=PENDING', { token: 'valid' })
      await GET(request)

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        })
      )
    })

    it('should search by title or publisher', async () => {
      mockVerifyToken.mockReturnValue({ userId: '1', role: 'ADMIN' })
      mockPrisma.task.count.mockResolvedValue(1)
      mockPrisma.task.findMany.mockResolvedValue([])

      const request = createRequest('/api/admin/tasks?search=test', { token: 'valid' })
      await GET(request)

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'test' } },
              { publisher: { username: { contains: 'test' } } },
            ],
          },
        })
      )
    })
  })

  describe('POST /api/admin/tasks/[id]/approve', () => {
    it('should approve pending task', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        status: 'PENDING',
      })
      mockPrisma.task.update.mockResolvedValue({
        id: 'task1',
        status: 'OPEN',
        reviewerId: 'admin1',
      })

      const request = createRequest('/api/admin/tasks/task1/approve', { token: 'valid' })
      const params = Promise.resolve({ id: 'task1' })
      const response = await ApprovePost(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('审核通过')
      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            status: 'OPEN',
            reviewerId: 'admin1',
            reviewedAt: expect.any(Date),
          },
        })
      )
    })

    it('should reject if task is not pending', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        status: 'OPEN',
      })

      const request = createRequest('/api/admin/tasks/task1/approve', { token: 'valid' })
      const params = Promise.resolve({ id: 'task1' })
      const response = await ApprovePost(request, { params })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/admin/tasks/[id]/reject', () => {
    it('should reject pending task', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        status: 'PENDING',
      })
      mockPrisma.task.update.mockResolvedValue({
        id: 'task1',
        status: 'CLOSED',
        reviewerId: 'admin1',
      })

      const request = createRequest('/api/admin/tasks/task1/reject', { token: 'valid' })
      const params = Promise.resolve({ id: 'task1' })
      const response = await RejectPost(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('已拒绝')
    })
  })

  describe('PATCH /api/admin/tasks/[id]/weight', () => {
    it('should update task weight', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({ id: 'task1' })
      mockPrisma.task.update.mockResolvedValue({
        id: 'task1',
        weight: 50,
      })

      const request = new NextRequest(new URL('/api/admin/tasks/task1/weight', 'http://localhost'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: 50 }),
      })
      request.cookies.set('token', 'valid')

      const params = Promise.resolve({ id: 'task1' })
      const response = await WeightPatch(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('权重已更新')
    })

    it('should reject invalid weight', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({ id: 'task1' })

      const request = new NextRequest(new URL('/api/admin/tasks/task1/weight', 'http://localhost'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: -1 }),
      })
      request.cookies.set('token', 'valid')

      const params = Promise.resolve({ id: 'task1' })
      const response = await WeightPatch(request, { params })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/admin/tasks/[id]/close', () => {
    it('should close task', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        status: 'OPEN',
      })
      mockPrisma.task.update.mockResolvedValue({
        id: 'task1',
        status: 'CLOSED',
      })

      const request = createRequest('/api/admin/tasks/task1/close', { token: 'valid' })
      const params = Promise.resolve({ id: 'task1' })
      const response = await ClosePost(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('任务已关闭')
    })

    it('should reject if task already closed', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        status: 'CLOSED',
      })

      const request = createRequest('/api/admin/tasks/task1/close', { token: 'valid' })
      const params = Promise.resolve({ id: 'task1' })
      const response = await ClosePost(request, { params })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/admin/tasks/[id]/reopen', () => {
    it('should reopen closed task', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        status: 'CLOSED',
      })
      mockPrisma.task.update.mockResolvedValue({
        id: 'task1',
        status: 'OPEN',
      })

      const request = createRequest('/api/admin/tasks/task1/reopen', { token: 'valid' })
      const params = Promise.resolve({ id: 'task1' })
      const response = await ReopenPost(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('任务已重新开放')
    })

    it('should reject if task is not closed', async () => {
      mockVerifyToken.mockReturnValue({ userId: 'admin1', role: 'ADMIN' })
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        status: 'OPEN',
      })

      const request = createRequest('/api/admin/tasks/task1/reopen', { token: 'valid' })
      const params = Promise.resolve({ id: 'task1' })
      const response = await ReopenPost(request, { params })

      expect(response.status).toBe(400)
    })
  })
})
