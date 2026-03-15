import { describe, it, expect } from 'vitest'
import { createTaskSchema, acceptTaskSchema, completeTaskSchema, cancelTaskSchema, rateTaskSchema, taskQuerySchema } from '@/lib/validations/task'

describe('Task Validations', () => {
  describe('createTaskSchema', () => {
    it('should validate correct task data', () => {
      const result = createTaskSchema.safeParse({
        title: '测试任务',
        description: '这是一个测试任务的描述内容',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject title shorter than 3 characters', () => {
      const result = createTaskSchema.safeParse({
        title: 'ab',
        description: '这是描述',
      })
      
      expect(result.success).toBe(false)
    })

    it('should reject title longer than 100 characters', () => {
      const result = createTaskSchema.safeParse({
        title: 'a'.repeat(101),
        description: '这是描述',
      })
      
      expect(result.success).toBe(false)
    })

    it('should reject description shorter than 10 characters', () => {
      const result = createTaskSchema.safeParse({
        title: '测试任务',
        description: '太短了',
      })
      
      expect(result.success).toBe(false)
    })

    it('should reject description longer than 2000 characters', () => {
      const result = createTaskSchema.safeParse({
        title: '测试任务',
        description: 'a'.repeat(2001),
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('acceptTaskSchema', () => {
    it('should validate correct comment', () => {
      const result = acceptTaskSchema.safeParse({
        comment: '我擅长这类任务，有丰富的经验',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject comment shorter than 10 characters', () => {
      const result = acceptTaskSchema.safeParse({
        comment: '太短',
      })
      
      expect(result.success).toBe(false)
    })

    it('should reject comment longer than 500 characters', () => {
      const result = acceptTaskSchema.safeParse({
        comment: 'a'.repeat(501),
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('completeTaskSchema', () => {
    it('should validate correct result', () => {
      const result = completeTaskSchema.safeParse({
        result: '任务已完成，结果如下...',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject result shorter than 10 characters', () => {
      const result = completeTaskSchema.safeParse({
        result: '太短',
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('cancelTaskSchema', () => {
    it('should validate correct reason', () => {
      const result = cancelTaskSchema.safeParse({
        reason: '时间不够，无法完成',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject reason shorter than 5 characters', () => {
      const result = cancelTaskSchema.safeParse({
        reason: '太短',
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('rateTaskSchema', () => {
    it('should validate correct rating', () => {
      const result = rateTaskSchema.safeParse({
        assignmentId: 'clx123',
        rating: 5,
        comment: '做得很好',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject rating below 1', () => {
      const result = rateTaskSchema.safeParse({
        assignmentId: 'clx123',
        rating: 0,
      })
      
      expect(result.success).toBe(false)
    })

    it('should reject rating above 5', () => {
      const result = rateTaskSchema.safeParse({
        assignmentId: 'clx123',
        rating: 6,
      })
      
      expect(result.success).toBe(false)
    })

    it('should reject missing assignmentId', () => {
      const result = rateTaskSchema.safeParse({
        rating: 5,
      })
      
      expect(result.success).toBe(false)
    })

    it('should accept without comment', () => {
      const result = rateTaskSchema.safeParse({
        assignmentId: 'clx123',
        rating: 4,
      })
      
      expect(result.success).toBe(true)
    })
  })

  describe('taskQuerySchema', () => {
    it('should use default values', () => {
      const result = taskQuerySchema.parse({})
      
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.sortBy).toBe('popularity')
      expect(result.sortOrder).toBe('desc')
    })

    it('should coerce string to number', () => {
      const result = taskQuerySchema.parse({
        page: '2',
        limit: '10',
      })
      
      expect(result.page).toBe(2)
      expect(result.limit).toBe(10)
    })

    it('should reject limit > 100', () => {
      const result = taskQuerySchema.safeParse({
        limit: 200,
      })
      
      expect(result.success).toBe(false)
    })

    it('should accept valid status', () => {
      const result = taskQuerySchema.safeParse({
        status: 'OPEN',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const result = taskQuerySchema.safeParse({
        status: 'INVALID',
      })
      
      expect(result.success).toBe(false)
    })
  })
})
