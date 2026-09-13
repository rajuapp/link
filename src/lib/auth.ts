import type { NextAuthOptions } from 'next-auth'

import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { db } from '@/lib/db'
import { getAuthSettings } from '@/lib/cms-auth-settings'

import type { Adapter } from 'next-auth/adapters'

const baseAdapter = PrismaAdapter(db)
const adapter: Adapter = {
  ...baseAdapter,
  linkAccount: (account: any) => {
    const { refresh_token_expires_in, ...data } = account
    return baseAdapter.linkAccount(data)
  },
}

export const authOptions: NextAuthOptions = {
  adapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(`[NextAuth Error] [${code}]`, metadata)
    },
    warn(code) {
      console.warn(`[NextAuth Warn] [${code}]`)
    },
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID || '',
      clientSecret:
        process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || '',
      issuer: 'https://github.com/login/oauth',
      allowDangerousEmailAccountLinking: true,
      userinfo: {
        url: 'https://api.github.com/user',
        async request({ client, tokens }) {
          let profile: any
          try {
            profile = await client.userinfo(tokens.access_token!)
          } catch (e) {
            console.warn(
              '[NextAuth] client.userinfo failed, falling back to direct fetch:',
              e
            )
            try {
              const directRes = await fetch('https://api.github.com/user', {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                  'User-Agent': 'Link-App',
                  Accept: 'application/vnd.github.v3+json',
                },
              })
              if (directRes.ok) {
                profile = await directRes.json()
              }
            } catch (fetchErr) {
              console.error(
                '[NextAuth] Direct GitHub user profile fetch failed:',
                fetchErr
              )
            }
          }

          if (!profile) {
            throw new Error('Could not retrieve GitHub user profile')
          }

          if (!profile.email) {
            try {
              const res = await fetch('https://api.github.com/user/emails', {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                  'User-Agent': 'Link-App',
                  Accept: 'application/vnd.github.v3+json',
                },
              })
              if (res.ok) {
                const emails: Array<{
                  email: string
                  primary: boolean
                  verified: boolean
                }> = await res.json()
                const primary =
                  emails.find((e) => e.primary && e.verified) ||
                  emails.find((e) => e.primary) ||
                  emails.find((e) => e.verified) ||
                  emails[0]
                if (primary?.email) {
                  profile.email = primary.email
                }
              }
            } catch (err) {
              console.error(
                '[NextAuth] Error fetching GitHub user emails:',
                err
              )
            }
          }

          // Fallback to GitHub noreply email if user has no public or verified email
          if (!profile.email && profile.id && profile.login) {
            profile.email = `${profile.id}+${profile.login}@users.noreply.github.com`
          }

          return profile
        },
      },
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.login || 'GitHub User',
          email:
            profile.email ||
            `${profile.id}+${profile.login}@users.noreply.github.com`,
          image: profile.avatar_url,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        const settings = await getAuthSettings()
        if (!settings.enableEmailAuth) {
          throw new Error('Email and password sign-in is currently disabled')
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email.toLowerCase(),
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordMatch) {
          throw new Error('Invalid email or password')
        }

        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        const settings = await getAuthSettings()

        if (account?.provider === 'credentials' && !settings.enableEmailAuth) {
          return false
        }

        if (account?.provider === 'google' && !settings.enableGoogleAuth) {
          return false
        }

        if (account?.provider === 'github' && !settings.enableGithubAuth) {
          return false
        }

        if (!settings.allowRegistration && user?.email) {
          const existingUser = await db.user.findUnique({
            where: { email: user.email.toLowerCase() },
          })
          if (!existingUser) {
            return '/login?error=RegistrationDisabled'
          }
        }

        return true
      } catch (err) {
        console.error('[NextAuth] Error in signIn callback:', err)
        return true
      }
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.role = token.role as string | undefined
      }

      return session
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token?.email

      if (!email) {
        if (user) {
          token.id = user.id
          token.role = (user as any).role
        }
        return token
      }

      const dbUser = await db.user.findFirst({
        where: {
          email,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user.id
          token.role = (user as any).role
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
      }
    },
  },
}
