import { describe, it, expect } from 'vitest'
import { SHRIMP_LEVELS, calculateLevel, getLevelInfo, getLevelByStats } from '@/lib/level'

describe('Level System', () => {
  describe('SHRIMP_LEVELS', () => {
    it('should have 10 levels', () => {
      expect(SHRIMP_LEVELS).toHaveLength(10)
    })

    it('should have increasing requirements', () => {
      for (let i = 1; i < SHRIMP_LEVELS.length; i++) {
        const prev = SHRIMP_LEVELS[i - 1]
        const curr = SHRIMP_LEVELS[i]
        expect(curr.minRating).toBeGreaterThanOrEqual(prev.minRating)
        expect(curr.minTasks).toBeGreaterThanOrEqual(prev.minTasks)
      }
    })
  })

  describe('calculateLevel', () => {
    it('should return level 1 for new OpenClaw with no tasks', () => {
      expect(calculateLevel(0, 0)).toBe(1)
    })

    it('should return level 1 for less than 1 task', () => {
      expect(calculateLevel(0, 5.0)).toBe(1)
    })

    it('should return level 2 for 1 task with rating 1.0+', () => {
      expect(calculateLevel(1, 1.0)).toBe(2)
    })

    it('should return level 3 for 5 tasks with rating 2.0+', () => {
      expect(calculateLevel(5, 2.0)).toBe(3)
    })

    it('should return level 4 for 10 tasks with rating 3.0+', () => {
      expect(calculateLevel(10, 3.0)).toBe(4)
    })

    it('should return level 5 for 20 tasks with rating 3.5+', () => {
      expect(calculateLevel(20, 3.5)).toBe(5)
    })

    it('should return level 6 for 30 tasks with rating 4.0+', () => {
      expect(calculateLevel(30, 4.0)).toBe(6)
    })

    it('should return level 7 for 50 tasks with rating 4.2+', () => {
      expect(calculateLevel(50, 4.2)).toBe(7)
    })

    it('should return level 8 for 80 tasks with rating 4.5+', () => {
      expect(calculateLevel(80, 4.5)).toBe(8)
    })

    it('should return level 9 for 100 tasks with rating 4.7+', () => {
      expect(calculateLevel(100, 4.7)).toBe(9)
    })

    it('should return level 10 for 150 tasks with rating 4.9+', () => {
      expect(calculateLevel(150, 4.9)).toBe(10)
    })

    it('should not return level 10 without enough tasks', () => {
      expect(calculateLevel(100, 4.9)).toBe(9)
    })

    it('should not return level 10 without enough rating', () => {
      expect(calculateLevel(150, 4.8)).toBe(9)
    })

    it('should handle edge case: high rating but low tasks', () => {
      expect(calculateLevel(5, 5.0)).toBe(3)
    })

    it('should handle edge case: high tasks but low rating', () => {
      expect(calculateLevel(100, 2.0)).toBe(3)
    })
  })

  describe('getLevelInfo', () => {
    it('should return correct level info for level 1', () => {
      const info = getLevelInfo(1)
      expect(info.name).toBe('虾苗')
      expect(info.icon).toBe('🦐')
    })

    it('should return correct level info for level 10', () => {
      const info = getLevelInfo(10)
      expect(info.name).toBe('帝王虾')
      expect(info.icon).toBe('👑🦞')
    })

    it('should return level 1 info for invalid level', () => {
      const info = getLevelInfo(0)
      expect(info.level).toBe(1)
    })

    it('should return level 1 info for level > 10', () => {
      const info = getLevelInfo(11)
      expect(info.level).toBe(1)
    })
  })

  describe('getLevelByStats', () => {
    it('should return combined level info', () => {
      const info = getLevelByStats(50, 4.3)
      expect(info.level).toBe(7)
      expect(info.name).toBe('黑虎虾')
    })

    it('should return 虾苗 for new OpenClaw', () => {
      const info = getLevelByStats(0, 0)
      expect(info.name).toBe('虾苗')
    })

    it('should return 帝王虾 for top performer', () => {
      const info = getLevelByStats(200, 5.0)
      expect(info.name).toBe('帝王虾')
    })
  })
})
