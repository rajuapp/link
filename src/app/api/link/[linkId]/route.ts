import { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { redis } from '@/lib/redis'
import { updateLinkClicks } from '@/lib/update-link-clicks'
import { linkPatchSchema } from '@/lib/validations/link'

import { ipAddress } from '@vercel/edge'

import { z } from 'zod'

const routeContextSchema = z.object({
  params: z.object({
    linkId: z.string(),
  }),
})

export type RouteContext = {
  params: Promise<{ linkId: string }>
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 403 })
    }

    const rawParams = await context.params
    const { params } = routeContextSchema.parse({ params: rawParams })

    const data = await db.link.delete({
      where: {
        id: params.linkId,
        creatorId: session.user.id,
      },
      select: {
        domain: true,
      },
    })

    try {
      await redis.del(`link:${data.domain}`)
    } catch (redisError) {
      console.warn('Redis del ignored:', redisError)
    }

    try {
      await db.$executeRawUnsafe(
        `DELETE FROM payload.links WHERE domain = $1`,
        data.domain
      )
    } catch (payloadErr) {
      console.warn('[Payload Sync] Delete link error:', payloadErr)
    }

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.errors), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

import bcrypt from 'bcryptjs'
import { getLinkUnlockToken } from '@/lib/link-token'

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 403 })
    }

    const rawParams = await context.params
    const { params } = routeContextSchema.parse({ params: rawParams })

    const json = await req.json()
    const body = linkPatchSchema.parse(json.data)

    const updateData: any = {}
    if (body.url !== undefined) updateData.url = body.url
    if (body.description !== undefined)
      updateData.description = body.description
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }
    if (body.maxClicks !== undefined) {
      updateData.maxClicks =
        typeof body.maxClicks === 'number' && body.maxClicks > 0
          ? body.maxClicks
          : null
    }
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive
    }

    if (body.clearPassword) {
      updateData.passwordHash = null
    } else if (body.password && body.password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(body.password.trim(), 10)
    }

    const data = await db.link.update({
      where: {
        id: params.linkId,
        creatorId: session.user.id,
      },
      data: updateData,
      select: {
        id: true,
        domain: true,
        url: true,
        description: true,
        expiresAt: true,
        maxClicks: true,
        isActive: true,
      },
    })

    try {
      await redis.del(`link:${data.domain}`)
    } catch (redisError) {
      console.warn('Redis del ignored:', redisError)
    }

    try {
      await db.$executeRawUnsafe(
        `UPDATE payload.links 
         SET url = COALESCE($1::text, url), 
             description = COALESCE($2::text, description), 
             expires_at = $3::timestamp with time zone,
             max_clicks = $4::numeric,
             is_active = COALESCE($5::boolean, is_active),
             password_hash = CASE WHEN $6::boolean = true THEN NULL WHEN $7::text IS NOT NULL THEN $7::text ELSE password_hash END,
             updated_at = NOW() 
         WHERE domain = $8::text`,
        updateData.url ?? null,
        updateData.description ?? null,
        updateData.expiresAt ?? null,
        updateData.maxClicks ?? null,
        updateData.isActive ?? null,
        body.clearPassword ?? false,
        updateData.passwordHash ?? null,
        data.domain
      )
    } catch (payloadErr) {
      console.warn('[Payload Sync] Update link error:', payloadErr)
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.errors), { status: 422 })
    }

    console.error('Error patching link:', error)
    return new Response(null, { status: 500 })
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const rawParams = await context.params
    const { params } = routeContextSchema.parse({ params: rawParams })

    const ip = ipAddress(req) ?? '63.141.56.109'

    const { success } = await rateLimit(ip)

    if (!success) {
      return new Response('Rate Limit', { status: 429 })
    }

    const data = await db.link.findFirst({
      where: {
        domain: {
          equals: params.linkId,
        },
      },
      select: {
        id: true,
        url: true,
        domain: true,
        clicks: true,
        expiresAt: true,
        maxClicks: true,
        isActive: true,
        passwordHash: true,
      },
    })

    if (!data) {
      return new Response(null, { status: 404 })
    }

    // 1. Check Deactivation Rule
    if (data.isActive === false) {
      return new Response(
        JSON.stringify({
          error: 'Gone',
          status: 410,
          reason: 'deactivated',
          domain: data.domain,
          message: 'This link has been deactivated by its owner.',
        }),
        {
          status: 410,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 2. Check Expiration Rule
    if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
      return new Response(
        JSON.stringify({
          error: 'Gone',
          status: 410,
          reason: 'expired',
          domain: data.domain,
          expiresAt: data.expiresAt,
          message: 'This link has expired.',
        }),
        {
          status: 410,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 3. Check Maximum Clicks Rule
    if (
      data.maxClicks !== null &&
      data.maxClicks !== undefined &&
      data.clicks >= data.maxClicks
    ) {
      return new Response(
        JSON.stringify({
          error: 'Gone',
          status: 410,
          reason: 'max_clicks',
          domain: data.domain,
          maxClicks: data.maxClicks,
          clicks: data.clicks,
          message: 'This link has reached its maximum allowed click limit.',
        }),
        {
          status: 410,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 4. Check Password Protection
    if (data.passwordHash) {
      const unlockCookie = req.cookies.get(`link_unlock_${data.domain}`)?.value
      const expectedToken = getLinkUnlockToken(data.domain, data.passwordHash)

      if (unlockCookie !== expectedToken) {
        return new Response(
          JSON.stringify({
            isProtected: true,
            domain: data.domain,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Link is active, valid, not expired, and unlocked
    updateLinkClicks(params.linkId)

    return new Response(JSON.stringify({ url: data.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.errors), { status: 422 })
    }

    console.error('Error fetching link:', error)
    return new Response(null, { status: 500 })
  }
}
