import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '@/lib/validations/auth'

describe('Auth Validations', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      })
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined()
      }
    })

    it('should reject username shorter than 3 characters', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        username: 'ab',
        password: 'password123',
      })
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username).toBeDefined()
      }
    })

    it('should reject username longer than 20 characters', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        username: 'a'.repeat(21),
        password: 'password123',
      })
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username).toBeDefined()
      }
    })

    it('should reject password shorter than 6 characters', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        username: 'testuser',
        password: '12345',
      })
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined()
      }
    })

    it('should reject missing fields', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined()
      }
    })

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      })
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined()
      }
    })

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      })
      
      expect(result.success).toBe(false)
    })
  })
})
