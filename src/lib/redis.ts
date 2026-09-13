import IORedis from 'ioredis'

export interface AppRedis {
  get: <T = any>(key: string) => Promise<T | null>
  set: (
    key: string,
    value: any,
    options?: { ex?: number; nx?: boolean }
  ) => Promise<any>
  del: (key: string) => Promise<any>
  incr?: (key: string) => Promise<number>
  expire?: (key: string, seconds: number) => Promise<number>
}

declare global {
  // eslint-disable-next-line no-var
  var __ioRedisInstance: IORedis | undefined
}

function createRedisClient(): AppRedis {
  // 1. Standard / Self-Hosted / Managed Redis (TCP & TLS via REDIS_URL)
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    try {
      const isRediss = redisUrl.startsWith('rediss://')
      const client =
        globalThis.__ioRedisInstance ??
        new IORedis(redisUrl, {
          maxRetriesPerRequest: 1,
          enableReadyCheck: false,
          lazyConnect: true,
          tls: isRediss ? { rejectUnauthorized: false } : undefined,
        })

      if (process.env.NODE_ENV !== 'production') {
        globalThis.__ioRedisInstance = client
      }

      if (client.status === 'wait') {
        client.connect().catch((err) => {
          console.warn('[Redis] Connection error:', err.message)
        })
      }

      return {
        get: async <T = any>(key: string): Promise<T | null> => {
          try {
            const val = await client.get(key)
            if (!val) return null
            try {
              return JSON.parse(val) as T
            } catch {
              return val as unknown as T
            }
          } catch (err) {
            console.warn('[Redis] get error:', err)
            return null
          }
        },
        set: async (
          key: string,
          value: any,
          options?: { ex?: number; nx?: boolean }
        ) => {
          try {
            const stringVal =
              typeof value === 'string' ? value : JSON.stringify(value)
            if (options?.ex && options?.nx) {
              return await client.set(key, stringVal, 'EX', options.ex, 'NX')
            }
            if (options?.ex) {
              return await client.set(key, stringVal, 'EX', options.ex)
            }
            if (options?.nx) {
              return await client.set(key, stringVal, 'NX')
            }
            return await client.set(key, stringVal)
          } catch (err) {
            console.warn('[Redis] set error:', err)
            return null
          }
        },
        del: async (key: string) => {
          try {
            return await client.del(key)
          } catch (err) {
            console.warn('[Redis] del error:', err)
            return 0
          }
        },
        incr: async (key: string) => {
          try {
            return await client.incr(key)
          } catch (err) {
            console.warn('[Redis] incr error:', err)
            return 1
          }
        },
        expire: async (key: string, seconds: number) => {
          try {
            return await client.expire(key, seconds)
          } catch (err) {
            console.warn('[Redis] expire error:', err)
            return 0
          }
        },
      }
    } catch (err) {
      console.warn('[Redis] Init error:', err)
    }
  }

  // 2. Fallback (No Redis configured - safe direct PostgreSQL)
  return {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    incr: async () => 1,
    expire: async () => 1,
  }
}

export const redis = createRedisClient()
