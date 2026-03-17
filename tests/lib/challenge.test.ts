import { describe, it, expect } from 'vitest'
import {
  generateChallenge,
  generateApiKey,
  generateVerificationCode,
  generateBindToken,
} from '@/lib/challenge'

describe('Challenge Library', () => {
  describe('generateChallenge', () => {
    it('should generate a challenge object', () => {
      const challenge = generateChallenge()

      expect(challenge).toHaveProperty('originalText')
      expect(challenge).toHaveProperty('obfuscatedText')
      expect(challenge).toHaveProperty('answer')
    })

    it('should generate answer as a string with 2 decimal places', () => {
      const challenge = generateChallenge()
      expect(challenge.answer).toMatch(/^\d+\.\d{2}$/)
    })

    it('should generate original text with number words', () => {
      const challenge = generateChallenge()
      expect(challenge.originalText.length).toBeGreaterThan(0)
    })

    it('should generate obfuscated text that is different from original', () => {
      // Run multiple times since there's randomness
      let hasDifferent = false
      for (let i = 0; i < 10; i++) {
        const challenge = generateChallenge()
        if (challenge.obfuscatedText !== challenge.originalText) {
          hasDifferent = true
          break
        }
      }
      expect(hasDifferent).toBe(true)
    })

    it('should generate correct answer within expected range', () => {
      // Test multiple times to hit different templates
      for (let i = 0; i < 20; i++) {
        const challenge = generateChallenge()
        const answer = parseFloat(challenge.answer)
        expect(answer).toBeGreaterThanOrEqual(0)
        expect(answer).toBeLessThanOrEqual(70) // max num1 (50) + max num2 (20)
      }
    })
  })

  describe('generateApiKey', () => {
    it('should generate API key with correct prefix', () => {
      const apiKey = generateApiKey()
      expect(apiKey.startsWith('sk_oc_')).toBe(true)
    })

    it('should generate API key with correct length', () => {
      const apiKey = generateApiKey()
      // sk_oc_ (6 chars) + 64 hex chars (32 bytes * 2)
      expect(apiKey.length).toBe(70)
    })

    it('should generate unique API keys', () => {
      const keys = new Set()
      for (let i = 0; i < 10; i++) {
        keys.add(generateApiKey())
      }
      expect(keys.size).toBe(10)
    })
  })

  describe('generateVerificationCode', () => {
    it('should generate verification code with correct prefix', () => {
      const code = generateVerificationCode()
      expect(code.startsWith('oc_verify_')).toBe(true)
    })

    it('should generate unique verification codes', () => {
      const codes = new Set()
      for (let i = 0; i < 10; i++) {
        codes.add(generateVerificationCode())
      }
      expect(codes.size).toBe(10)
    })
  })

  describe('generateBindToken', () => {
    it('should generate bind token with correct prefix', () => {
      const token = generateBindToken()
      expect(token.startsWith('oc_bind_')).toBe(true)
    })

    it('should generate unique bind tokens', () => {
      const tokens = new Set()
      for (let i = 0; i < 10; i++) {
        tokens.add(generateBindToken())
      }
      expect(tokens.size).toBe(10)
    })
  })
})