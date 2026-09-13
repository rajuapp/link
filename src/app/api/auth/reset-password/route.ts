import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().optional(),
  code: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          message: result.error.errors[0]?.message || 'Invalid input data',
          errors: result.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, token, code, password } = result.data
    const normalizedEmail = email.toLowerCase().trim()

    if (!token && !code) {
      return NextResponse.json(
        {
          message:
            'Please provide either a reset link token or 6-digit reset code.',
        },
        { status: 400 }
      )
    }

    // 1. Check user exists
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email address' },
        { status: 404 }
      )
    }

    let isValid = false

    // 2. Validate URL reset token
    if (token) {
      const tokenRecord = await db.verificationToken.findFirst({
        where: {
          identifier: `reset:${normalizedEmail}`,
          token: token.trim(),
        },
      })

      if (tokenRecord) {
        if (new Date() > tokenRecord.expires) {
          return NextResponse.json(
            {
              message:
                'Password reset link has expired. Please request a new one.',
            },
            { status: 410 }
          )
        }
        isValid = true
      }
    }

    // 3. Validate 6-digit reset code
    if (!isValid && code) {
      const codeRecord = await db.verificationToken.findFirst({
        where: {
          identifier: `reset_code:${normalizedEmail}`,
          token: code.trim(),
        },
      })

      if (codeRecord) {
        if (new Date() > codeRecord.expires) {
          return NextResponse.json(
            {
              message:
                'Password reset code has expired. Please request a new one.',
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
            'Invalid or expired password reset link/code. Please request a new reset.',
        },
        { status: 400 }
      )
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // 5. Update password in User table (and verify email if not already verified)
    await db.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedPassword,
        emailVerified: user.emailVerified ?? new Date(),
      },
    })

    // 6. Sync to Payload CMS users collection if present
    try {
      const { getPayload } = await import('payload')
      const config = (await import('@payload-config')).default
      const payload = await getPayload({ config })

      const payloadUsers = await payload.find({
        collection: 'users',
        where: { email: { equals: normalizedEmail } },
        showHiddenFields: true,
      })

      if (payloadUsers.docs.length > 0) {
        await payload.update({
          collection: 'users',
          id: payloadUsers.docs[0].id,
          data: {
            password,
            loginAttempts: 0,
            lockUntil: null,
          } as any,
        })
      }
    } catch (syncErr) {
      console.warn('[Reset Password] Payload users sync warning:', syncErr)
    }

    // 7. Clean up reset tokens
    await db.verificationToken.deleteMany({
      where: {
        identifier: {
          in: [`reset:${normalizedEmail}`, `reset_code:${normalizedEmail}`],
        },
      },
    })

    return NextResponse.json({
      success: true,
      message:
        'Password has been reset successfully! You can now sign in with your new password.',
    })
  } catch (error) {
    console.error('[Reset Password API Error]:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred while resetting password' },
      { status: 500 }
    )
  }
}
