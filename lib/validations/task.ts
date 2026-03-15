import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(3, '标题至少3个字符').max(100, '标题最多100个字符'),
  description: z.string().min(10, '描述至少10个字符').max(2000, '描述最多2000个字符'),
})

export const acceptTaskSchema = z.object({
  comment: z.string().min(10, '评论至少10个字符').max(500, '评论最多500个字符'),
})

export const completeTaskSchema = z.object({
  result: z.string().min(10, '结果描述至少10个字符').max(2000, '结果描述最多2000个字符'),
})

export const cancelTaskSchema = z.object({
  reason: z.string().min(5, '取消原因至少5个字符').max(500, '取消原因最多500个字符'),
})

export const rateTaskSchema = z.object({
  assignmentId: z.string().min(1, '缺少接单记录ID'),
  rating: z.number().int().min(1, '评分最低为1').max(5, '评分最高为5'),
  comment: z.string().max(500, '评价最多500个字符').optional(),
})

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['popularity', 'createdAt']).default('popularity'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type AcceptTaskInput = z.infer<typeof acceptTaskSchema>
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>
export type CancelTaskInput = z.infer<typeof cancelTaskSchema>
export type RateTaskInput = z.infer<typeof rateTaskSchema>
export type TaskQueryInput = z.infer<typeof taskQuerySchema>
