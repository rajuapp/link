import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { db } from '@/lib/db'
import { getAuthSettings } from '@/lib/cms-auth-settings'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: Request) {
  try {
    const settings = await getAuthSettings()

    if (!settings.allowRegistration) {
      return new Response(
        JSON.stringify({
          message: settings.registrationDisabledMessage,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!settings.enableEmailAuth) {
      return new Response(
        JSON.stringify({
          message: 'Email registration is currently disabled by administrator.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const json = await req.json()
    const result = registerSchema.safeParse(json)

    if (!result.success) {
      return new Response(
        JSON.stringify({
          message: result.error.errors[0]?.message ?? 'Invalid input data',
          errors: result.error.errors,
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const { name, email, password } = result.data
    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await db.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (existingUser) {
      return new Response('User with this email already exists', {
        status: 409,
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // 1. Generate 6-digit OTP code and 32-byte secure token
    const crypto = await import('crypto')
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString()
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Clean any prior tokens for this email
    await db.verificationToken.deleteMany({
      where: {
        identifier: {
          in: [normalizedEmail, `code:${normalizedEmail}`],
        },
      },
    })

    // Store both link token and 6-digit code
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

    // 2. Send verification email via AgentMail
    const { sendVerificationEmail } = await import('@/lib/agentmail')
    const mailResult = await sendVerificationEmail({
      email: normalizedEmail,
      name: name.trim(),
      code: verificationCode,
      token: verificationToken,
    })

    if (!mailResult.success) {
      console.warn(
        '[Register] AgentMail verification email send warning:',
        mailResult.error
      )
    }

    // 3. Automatically sync into Payload CMS users collection with 'user' role
    try {
      await db.$executeRawUnsafe(
        `INSERT INTO payload.users (name, email, role, hash, salt, created_at, updated_at)
         VALUES ($1, $2, 'user'::payload.enum_users_role, $3, '', NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
        name.trim(),
        normalizedEmail,
        hashedPassword
      )
    } catch (syncErr) {
      console.warn('[Register] Payload users sync warning:', syncErr)
    }

    return new Response(
      JSON.stringify({
        ...user,
        requiresVerification: true,
        message:
          'Verification email sent. Please check your inbox for the activation link or 6-digit code.',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch {
    return new Response('Something went wrong', { status: 500 })
  }
}
