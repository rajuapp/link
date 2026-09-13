import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const verifySchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().optional(),
  code: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = verifySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          message: 'Invalid verification request',
          errors: result.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, token, code } = result.data
    const normalizedEmail = email.toLowerCase().trim()

    if (!token && !code) {
      return NextResponse.json(
        {
          message:
            'Please provide either a verification link token or 6-digit code',
        },
        { status: 400 }
      )
    }

    // 1. Check if user exists
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email address' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Your email is already verified. You can sign in.',
        },
        { status: 200 }
      )
    }

    let isValid = false

    // 2. Validate token (from URL link)
    if (token) {
      const tokenRecord = await db.verificationToken.findFirst({
        where: {
          identifier: normalizedEmail,
          token: token.trim(),
        },
      })

      if (tokenRecord) {
        if (new Date() > tokenRecord.expires) {
          return NextResponse.json(
            {
              message:
                'Verification link has expired. Please request a new one.',
            },
            { status: 410 }
          )
        }
        isValid = true
      }
    }

    // 3. Validate 6-digit code (from manual entry)
    if (!isValid && code) {
      const codeRecord = await db.verificationToken.findFirst({
        where: {
          identifier: `code:${normalizedEmail}`,
          token: code.trim(),
        },
      })

      if (codeRecord) {
        if (new Date() > codeRecord.expires) {
          return NextResponse.json(
            {
              message:
                'Verification code has expired. Please request a new one.',
            },
            { status: 410 }
          )
        }
        isValid = true
      }
    }

    if (!isValid) {
      return NextResponse.json(
        {
          message:
            'Invalid verification code or link. Please check and try again.',
        },
        { status: 400 }
      )
    }

    // 4. Mark user as verified
    await db.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    })

    // 5. Clean up verification tokens
    await db.verificationToken.deleteMany({
      where: {
        identifier: {
          in: [normalizedEmail, `code:${normalizedEmail}`],
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    })
  } catch (error) {
    console.error('[Verify Email API Error]:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred during verification' },
      { status: 500 }
    )
  }
}
