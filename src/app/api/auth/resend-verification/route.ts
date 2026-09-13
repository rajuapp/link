import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/agentmail'
import crypto from 'crypto'

const resendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = resendSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = result.data.email.toLowerCase().trim()

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // Don't leak if user exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a new verification code has been sent.',
      })
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified. You can sign in immediately.',
      })
    }

    // Generate new 6-digit code and link token
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString()
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Delete existing tokens
    await db.verificationToken.deleteMany({
      where: {
        identifier: {
          in: [normalizedEmail, `code:${normalizedEmail}`],
        },
      },
    })

    // Store new tokens
    await db.verificationToken.createMany({
      data: [
        {
          identifier: normalizedEmail,
          token: verificationToken,
          expires: expiresAt,
        },
        {
          identifier: `code:${normalizedEmail}`,
          token: verificationCode,
          expires: expiresAt,
        },
      ],
    })

    // Send email via AgentMail
    await sendVerificationEmail({
      email: normalizedEmail,
      name: user.name || undefined,
      code: verificationCode,
      token: verificationToken,
    })

    return NextResponse.json({
      success: true,
      message:
        'A new verification link and 6-digit code has been sent to your email.',
    })
  } catch (error) {
    console.error('[Resend Verification API Error]:', error)
    return NextResponse.json(
      { message: 'Unable to resend verification email at this time' },
      { status: 500 }
    )
  }
}
