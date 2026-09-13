import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { db } from '@/lib/db'
import { getLinkUnlockToken } from '@/lib/link-token'
import { updateLinkClicks } from '@/lib/update-link-clicks'
import { unlockSchema } from '@/lib/validations/link'

type RouteContext = {
  params: Promise<{ linkId: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const rawParams = await context.params
    const domain = rawParams.linkId

    const json = await req.json()
    const { password } = unlockSchema.parse(json)

    const link = await db.link.findFirst({
      where: {
        domain: {
          equals: domain,
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (!link.isActive) {
      return NextResponse.json(
        { error: 'This link has been deactivated.', reason: 'deactivated' },
        { status: 410 }
      )
    }

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return NextResponse.json(
        { error: 'This link has expired.', reason: 'expired' },
        { status: 410 }
      )
    }

    if (
      link.maxClicks !== null &&
      link.maxClicks !== undefined &&
      link.clicks >= link.maxClicks
    ) {
      return NextResponse.json(
        {
          error: 'This link has reached its maximum click limit.',
          reason: 'max_clicks',
        },
        { status: 410 }
      )
    }

    if (!link.passwordHash) {
      await updateLinkClicks(link.domain)
      return NextResponse.json({ success: true, url: link.url })
    }

    const isValid = await bcrypt.compare(password, link.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      )
    }

    await updateLinkClicks(link.domain)

    const token = getLinkUnlockToken(link.domain, link.passwordHash)
    let targetUrl = link.url
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`
    }

    const response = NextResponse.json({
      success: true,
      url: targetUrl,
    })

    response.cookies.set(`link_unlock_${link.domain}`, token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input' },
        { status: 422 }
      )
    }

    console.error('Link unlock error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
