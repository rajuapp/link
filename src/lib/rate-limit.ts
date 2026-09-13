import { redis } from '@/lib/redis'

export async function rateLimit(identifier: string) {
  // Redis sliding/fixed rate limiter
  if (process.env.REDIS_URL && redis.incr && redis.expire) {
    try {
      const key = `@ratelimit:${identifier}`
      const current = await redis.incr(key)
      if (current === 1) {
        await redis.expire(key, 10)
      }
      return {
        success: current <= 10,
        limit: 10,
        remaining: Math.max(0, 10 - current),
        reset: Date.now() + 10000,
      }
    } catch (err) {
      console.warn('Redis rate limit error:', err)
      return { success: true, limit: 10, remaining: 10, reset: 0 }
    }
  }

  // Fallback (safe pass-through when Redis is not configured)
  return { success: true, limit: 10, remaining: 10, reset: 0 }
}
