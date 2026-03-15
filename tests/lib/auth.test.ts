import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateToken, verifyToken, extractTokenFromHeader } from '@/lib/auth'

describe('Auth Library', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      
      const result = await verifyPassword(password, hashedPassword)
      
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword456'
      const hashedPassword = await hashPassword(password)
      
      const result = await verifyPassword(wrongPassword, hashedPassword)
      
      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('should generate different tokens for different payloads', () => {
      const payload1 = { userId: '123', email: 'test1@example.com' }
      const payload2 = { userId: '456', email: 'test2@example.com' }
      
      const token1 = generateToken(payload1)
      const token2 = generateToken(payload2)
      
      expect(token1).not.toBe(token2)
    })

    it('should generate token with optional role', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'ADMIN' }
      
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = generateToken(payload)
      
      const decoded = verifyToken(token)
      
      expect(decoded).not.toBeNull()
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.email).toBe(payload.email)
    })

    it('should verify and decode a valid token with role', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'ADMIN' }
      const token = generateToken(payload)
      
      const decoded = verifyToken(token)
      
      expect(decoded).not.toBeNull()
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.email).toBe(payload.email)
      expect(decoded?.role).toBe(payload.role)
    })

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      
      const decoded = verifyToken(invalidToken)
      
      expect(decoded).toBeNull()
    })

    it('should return null for empty token', () => {
      const decoded = verifyToken('')
      
      expect(decoded).toBeNull()
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'my-jwt-token'
      const authHeader = `Bearer ${token}`
      
      const extracted = extractTokenFromHeader(authHeader)
      
      expect(extracted).toBe(token)
    })

    it('should return null for null header', () => {
      const extracted = extractTokenFromHeader(null)
      
      expect(extracted).toBeNull()
    })

    it('should return null for header without Bearer prefix', () => {
      const authHeader = 'Basic somecredentials'
      
      const extracted = extractTokenFromHeader(authHeader)
      
      expect(extracted).toBeNull()
    })

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('')
      
      expect(extracted).toBeNull()
    })
  })
})
