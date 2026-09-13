import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { LinkSchema } from '@/lib/validations/link'

import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 403 })
    }

    const json = await req.json()
    const body = LinkSchema.parse(json.data)

    const existingLink = await db.link.findUnique({
      where: {
        domain: body.domain,
      },
    })

    if (existingLink) {
      return new Response('Domain already exists', { status: 409 })
    }

    const passwordHash =
      body.password && body.password.trim().length > 0
        ? await bcrypt.hash(body.password.trim(), 10)
        : null

    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    const maxClicks =
      typeof body.maxClicks === 'number' && body.maxClicks > 0
        ? body.maxClicks
        : null
    const isActive = body.isActive !== false

    const link = await db.link.create({
      data: {
        url: body.url,
        domain: body.domain,
        description: body.description,
        creatorId: session.user.id,
        expiresAt,
        maxClicks,
        isActive,
        passwordHash,
      },
      select: {
        id: true,
        url: true,
        domain: true,
        description: true,
        createdAt: true,
        clicks: true,
        expiresAt: true,
        maxClicks: true,
        isActive: true,
        // NEVER expose passwordHash!
      },
    })

    try {
      await db.$executeRawUnsafe(
        `INSERT INTO payload.links (domain, url, description, clicks, creator_email, expires_at, max_clicks, is_active, password_hash, created_at, updated_at)
         VALUES ($1::text, $2::text, $3::text, $4::numeric, $5::text, $6::timestamp with time zone, $7::numeric, $8::boolean, $9::text, NOW(), NOW())
         ON CONFLICT (domain) DO UPDATE SET 
           url = EXCLUDED.url, 
           description = EXCLUDED.description,
           expires_at = EXCLUDED.expires_at,
           max_clicks = EXCLUDED.max_clicks,
           is_active = EXCLUDED.is_active,
           password_hash = EXCLUDED.password_hash`,
        body.domain,
        body.url,
        body.description ?? '',
        0,
        session.user.email ?? '',
        expiresAt,
        maxClicks,
        isActive,
        passwordHash
      )
    } catch (payloadSyncErr) {
      console.warn('[Payload CMS Sync] Error syncing link:', payloadSyncErr)
    }

    return new Response(JSON.stringify(link), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.errors), { status: 422 })
    }

    console.error('Error creating link:', error)
    return new Response(null, { status: 500 })
  }
}
