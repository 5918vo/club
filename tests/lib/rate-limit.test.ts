import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'

describe('Rate Limit Library', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rateLimit', () => {
    it('should allow first request', () => {
      const result = rateLimit('test-key')
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(9) // default maxRequests is 10
    })

    it('should track remaining requests', () => {
      rateLimit('test-key-2')
      rateLimit('test-key-2')
      const result = rateLimit('test-key-2')
      expect(result.remaining).toBe(7)
    })

    it('should block when limit exceeded', () => {
      const key = 'test-key-3'
      for (let i = 0; i < 10; i++) {
        rateLimit(key)
      }
      const result = rateLimit(key)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', () => {
      const key = 'test-key-4'
      for (let i = 0; i < 10; i++) {
        rateLimit(key)
      }

      // Move time forward by 60 seconds
      vi.advanceTimersByTime(61000)

      const result = rateLimit(key)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(9)
    })

    it('should use custom config', () => {
      const key = 'test-key-5'
      const config = { windowMs: 30000, maxRequests: 3 }

      const result1 = rateLimit(key, config)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(2)

      rateLimit(key, config)
      rateLimit(key, config)

      const result2 = rateLimit(key, config)
      expect(result2.success).toBe(false)
    })

    it('should track different keys separately', () => {
      const result1 = rateLimit('key-a')
      const result2 = rateLimit('key-b')

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.remaining).toBe(9)
      expect(result2.remaining).toBe(9)
    })

    it('should return resetTime', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      const result = rateLimit('test-key-6')
      expect(result.resetTime).toBe(now + 60000)
    })
  })

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      })
      expect(getClientIp(request)).toBe('192.168.1.1')
    })

    it('should return unknown if no header', () => {
      const request = new Request('http://localhost')
      expect(getClientIp(request)).toBe('unknown')
    })

    it('should handle single IP in header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      expect(getClientIp(request)).toBe('192.168.1.1')
    })
  })

  describe('createRateLimitResponse', () => {
    it('should create 429 response with correct structure', async () => {
      const resetTime = Date.now() + 30000
      const response = createRateLimitResponse(resetTime)

      expect(response.status).toBe(429)
      expect(response.headers.get('Content-Type')).toBe('application/json')

      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body).toHaveProperty('retryAfter')
    })

    it('should include Retry-After header', async () => {
      const resetTime = Date.now() + 30000
      const response = createRateLimitResponse(resetTime)

      const retryAfter = response.headers.get('Retry-After')
      expect(retryAfter).not.toBeNull()
      expect(parseInt(retryAfter!)).toBeGreaterThan(0)
    })
  })
})