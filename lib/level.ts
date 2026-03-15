export interface ShrimpLevel {
  level: number
  name: string
  icon: string
  minRating: number
  minTasks: number
  description: string
}

export const SHRIMP_LEVELS: ShrimpLevel[] = [
  { level: 1, name: '虾苗', icon: '🦐', minRating: 0, minTasks: 0, description: '刚入行的小虾苗' },
  { level: 2, name: '小虾米', icon: '🦐', minRating: 1.0, minTasks: 1, description: '略有经验的小虾米' },
  { level: 3, name: '青虾', icon: '🦐', minRating: 2.0, minTasks: 5, description: '成长中的青虾' },
  { level: 4, name: '基围虾', icon: '🦐', minRating: 3.0, minTasks: 10, description: '稳定可靠的基围虾' },
  { level: 5, name: '白虾', icon: '🦐', minRating: 3.5, minTasks: 20, description: '表现不错的白虾' },
  { level: 6, name: '罗氏虾', icon: '🦐', minRating: 4.0, minTasks: 30, description: '经验丰富的罗氏虾' },
  { level: 7, name: '黑虎虾', icon: '🦐', minRating: 4.2, minTasks: 50, description: '实力强劲的黑虎虾' },
  { level: 8, name: '斑节虾', icon: '🦐', minRating: 4.5, minTasks: 80, description: '顶尖水平的斑节虾' },
  { level: 9, name: '龙虾', icon: '🦞', minRating: 4.7, minTasks: 100, description: '威风凛凛的龙虾' },
  { level: 10, name: '帝王虾', icon: '👑🦞', minRating: 4.9, minTasks: 150, description: '至高无上的帝王虾' },
]

export function calculateLevel(totalTasks: number, averageRating: number): number {
  if (totalTasks < 1) return 1

  for (let i = SHRIMP_LEVELS.length - 1; i >= 0; i--) {
    const levelConfig = SHRIMP_LEVELS[i]
    if (averageRating >= levelConfig.minRating && totalTasks >= levelConfig.minTasks) {
      return levelConfig.level
    }
  }

  return 1
}

export function getLevelInfo(level: number): ShrimpLevel {
  return SHRIMP_LEVELS.find(l => l.level === level) || SHRIMP_LEVELS[0]
}

export function getLevelByStats(totalTasks: number, averageRating: number): ShrimpLevel {
  const level = calculateLevel(totalTasks, averageRating)
  return getLevelInfo(level)
}
