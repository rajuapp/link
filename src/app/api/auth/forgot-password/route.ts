import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/agentmail'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid email address', errors: result.error.errors },
        { status: 400 }
      )
    }

    const { email } = result.data
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Look up user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    // To prevent email enumeration attacks, always respond with success even if user not found
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with that email, a password reset link and code has been sent.',
      })
    }

    // 2. Generate 6-digit reset code and 32-byte reset token (expires in 1 hour)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // 3. Remove any previous reset tokens for this email
    await db.verificationToken.deleteMany({
      where: {
        identifier: {
          in: [`reset:${normalizedEmail}`, `reset_code:${normalizedEmail}`],
        },
      },
    })

    // 4. Save new reset tokens
    await db.verificationToken.createMany({
      data: [
        {
          identifier: `reset:${normalizedEmail}`,
          token: resetToken,
          expires: expiresAt,
        },
        {
          identifier: `reset_code:${normalizedEmail}`,
          token: resetCode,
          expires: expiresAt,
        },
      ],
    })

    // 5. Send password reset email via AgentMail
    const mailResult = await sendPasswordResetEmail({
      email: normalizedEmail,
      name: user.name || undefined,
      code: resetCode,
      token: resetToken,
    })

    if (!mailResult.success) {
      console.warn(
        '[Forgot Password] AgentMail send warning:',
        mailResult.error
      )
    }

    return NextResponse.json({
      success: true,
      message:
        'If an account exists with that email, a password reset link and code has been sent.',
    })
  } catch (error) {
    console.error('[Forgot Password API Error]:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
