import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isAdmin = ({ req }: { req: any }) => {
  return req?.user?.role === 'admin'
}

function getCleanPostgresUrl(url: string | undefined): {
  connectionString: string
  isLocal: boolean
} {
  if (!url) return { connectionString: '', isLocal: true }
  try {
    const parsed = new URL(url)
    const isLocal =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
    parsed.searchParams.delete('sslmode')
    parsed.searchParams.delete('ssl')
    return { connectionString: parsed.toString(), isLocal }
  } catch {
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1')
    return {
      connectionString: url
        .replace(/[?&]sslmode=[^&]+/g, '')
        .replace(/[?&]ssl=[^&]+/g, '')
        .replace(/\?$/, ''),
      isLocal,
    }
  }
}

const { connectionString: dbConnectionString, isLocal: isLocalDb } =
  getCleanPostgresUrl(process.env.DATABASE_URL)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_URL || 'https://link.raju.app',
  admin: {
    user: 'users',
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // 1. Users (Manage users, admin vs user roles)
    {
      slug: 'users',
      labels: {
        singular: 'User',
        plural: 'Users',
      },
      auth: {
        maxLoginAttempts: 10,
        lockTime: 5 * 60 * 1000, // 5 minutes
        forgotPassword: {
          generateEmailSubject: () => 'Reset your Link Admin password',
          generateEmailHTML: (args) => {
            const token = args?.token
            const user = args?.user
            const baseUrl =
              process.env.NEXT_PUBLIC_URL || 'https://link.raju.app'
            const resetUrl = `${baseUrl.replace(/\/$/, '')}/admin/reset/${token}`
            const displayName = user?.name ? String(user.name).trim() : 'Admin'

            return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Link Admin password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 400px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); overflow: hidden;">
          <tr>
            <td style="padding: 32px 28px 20px 28px; text-align: center;">
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center">
                    <img src="https://link.raju.app/apple-touch-icon.png" width="38" height="38" alt="Link" style="display: block; width: 38px; height: 38px; border-radius: 8px; background-color: #262424; color: #ffffff; font-size: 12px; font-weight: 700; line-height: 38px; text-align: center; border: 0; outline: none; margin: 0 auto;" />
                  </td>
                </tr>
              </table>

              <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: #18181b;">
                Admin Password Reset
              </h1>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a;">
                Hi ${displayName}, you requested a password reset for your Link Admin account. Click below to choose a new password.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 12px auto 20px auto;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #18181b;">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 32px; border-radius: 6px; text-align: center; border: 1px solid #18181b; min-width: 180px; box-sizing: border-box;">
                            Reset Admin Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr>
                  <td style="border-top: 1px solid #e4e4e7; text-align: center; height: 1px;">
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717a; text-align: center;">
                Or open this link directly:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; line-height: 1.4; text-align: center; word-break: break-all;">
                <a href="${resetUrl}" target="_blank" style="color: #18181b; text-decoration: underline;">
                  ${resetUrl}
                </a>
              </p>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                This reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 14px 28px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} Link. Quick and Easy URL Shortening.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
          },
        },
      },
      admin: {
        useAsTitle: 'email',
        defaultColumns: ['name', 'email', 'role', 'createdAt'],
      },
      access: {
        // Strictly only admins can access the admin panel
        admin: ({ req }) => req?.user?.role === 'admin',
        create: ({ req }) => req?.user?.role === 'admin',
        read: ({ req }) => req?.user?.role === 'admin',
        update: ({ req }) => req?.user?.role === 'admin',
        delete: ({ req }) => req?.user?.role === 'admin',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'admin',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
          ],
          access: {
            update: ({ req }) => req?.user?.role === 'admin',
          },
        },
      ],
      hooks: {
        afterChange: [
          async ({ doc }) => {
            try {
              const { db } = await import('@/lib/db')
              if (doc.email) {
                await db.user.upsert({
                  where: { email: String(doc.email).toLowerCase() },
                  create: {
                    name: doc.name || null,
                    email: String(doc.email).toLowerCase(),
                  },
                  update: {
                    name: doc.name || null,
                  },
                })
              }
            } catch (err) {
              console.warn('[Payload CMS] User sync error:', err)
            }
          },
        ],
        afterDelete: [
          async ({ doc }) => {
            try {
              const { db } = await import('@/lib/db')
              if (doc.email) {
                await db.user.deleteMany({
                  where: { email: String(doc.email).toLowerCase() },
                })
              }
            } catch (err) {
              console.warn('[Payload CMS] User delete sync error:', err)
            }
          },
        ],
      },
    },

    // 2. Links Collection (All links managed by Admin)
    {
      slug: 'links',
      labels: {
        singular: 'Link',
        plural: 'Links',
      },
      admin: {
        useAsTitle: 'domain',
        defaultColumns: [
          'domain',
          'url',
          'clicks',
          'isActive',
          'expiresAt',
          'maxClicks',
          'creatorEmail',
          'createdAt',
        ],
      },
      access: {
        admin: isAdmin,
        read: isAdmin,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      fields: [
        {
          name: 'domain',
          type: 'text',
          label: 'Short Slug / Domain',
          required: true,
          unique: true,
          index: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'Destination URL',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'clicks',
          type: 'number',
          label: 'Total Clicks',
          defaultValue: 0,
        },
        {
          name: 'isActive',
          type: 'checkbox',
          label: 'Active (uncheck to return 410 Gone)',
          defaultValue: true,
        },
        {
          name: 'expiresAt',
          type: 'date',
          label: 'Expiration Date & Time',
          admin: {
            description:
              'Leave empty for no expiry. After this time the link returns 410 Gone.',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'maxClicks',
          type: 'number',
          label: 'Maximum Click Limit',
          admin: {
            description:
              'Leave empty for unlimited. Link returns 410 Gone once this ceiling is reached.',
          },
        },
        {
          name: 'passwordHash',
          type: 'text',
          label: 'Password Hash (bcrypt)',
          admin: {
            description:
              'Read-only. Set via the user dashboard. Never store a plaintext password here.',
            readOnly: true,
          },
        },
        {
          name: 'creatorEmail',
          type: 'text',
          label: 'Creator Email',
        },
      ],
      hooks: {
        // When admin edits or adds a link in Payload CMS, sync live redirect database
        afterChange: [
          async ({ doc }) => {
            try {
              const { db } = await import('@/lib/db')
              const { redis } = await import('@/lib/redis')

              let creatorId: string | null = null
              if (doc.creatorEmail) {
                const user = await db.user.findUnique({
                  where: { email: String(doc.creatorEmail).toLowerCase() },
                })
                if (user) creatorId = user.id
              }

              if (!creatorId) {
                const defaultUser = await db.user.findFirst()
                if (defaultUser) creatorId = defaultUser.id
              }

              if (creatorId) {
                await db.link.upsert({
                  where: { domain: doc.domain },
                  create: {
                    domain: doc.domain,
                    url: doc.url,
                    description: doc.description || '',
                    clicks: Number(doc.clicks) || 0,
                    isActive: doc.isActive !== false,
                    expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
                    maxClicks: doc.maxClicks ? Number(doc.maxClicks) : null,
                    creatorId,
                  },
                  update: {
                    url: doc.url,
                    description: doc.description || '',
                    clicks: Number(doc.clicks) || 0,
                    isActive: doc.isActive !== false,
                    expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
                    maxClicks: doc.maxClicks ? Number(doc.maxClicks) : null,
                  },
                })
              }

              await redis.del(`link:${doc.domain}`)
            } catch (err) {
              console.warn('[Payload CMS] Link sync error:', err)
            }
          },
        ],
        afterDelete: [
          async ({ doc }) => {
            try {
              const { db } = await import('@/lib/db')
              const { redis } = await import('@/lib/redis')

              await db.link.deleteMany({
                where: { domain: doc.domain },
              })

              await redis.del(`link:${doc.domain}`)
            } catch (err) {
              console.warn('[Payload CMS] Link delete sync error:', err)
            }
          },
        ],
      },
    },

    // 3. Pages Collection (Pages with Rich Text Editor & Active Metrics)
    {
      slug: 'pages',
      labels: {
        singular: 'Page',
        plural: 'Pages',
      },
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'slug', 'updatedAt'],
      },
      access: {
        admin: isAdmin,
        create: isAdmin,
        read: () => true, // Public read so pages can be rendered on the website
        update: isAdmin,
        delete: isAdmin,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Page Title',
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          label: 'URL Slug (e.g. "home")',
        },
        {
          name: 'hero',
          type: 'group',
          label: 'Hero Section',
          fields: [
            {
              name: 'badgeText',
              type: 'text',
              label: 'Badge Text',
              defaultValue: 'Find the project on Github',
            },
            {
              name: 'badgeUrl',
              type: 'text',
              label: 'Badge URL',
              defaultValue: 'https://github.com/rajuapp/link',
            },
            {
              name: 'heading',
              type: 'text',
              label: 'Hero Heading',
              defaultValue: 'Create Links Simply, All in One Place',
            },
            {
              name: 'subheading',
              type: 'textarea',
              label: 'Hero Subheading',
              defaultValue:
                'Effortlessly generate shortened links and efficiently manage them all in one centralized dashboard.',
            },
            {
              name: 'primaryButtonText',
              type: 'text',
              label: 'Primary Button Text',
              defaultValue: 'Get Started',
            },
            {
              name: 'primaryButtonUrl',
              type: 'text',
              label: 'Primary Button URL',
              defaultValue: '/login',
            },
            {
              name: 'secondaryButtonText',
              type: 'text',
              label: 'Secondary Button Text',
              defaultValue: 'Github',
            },
            {
              name: 'secondaryButtonUrl',
              type: 'text',
              label: 'Secondary Button URL',
              defaultValue: 'https://github.com/rajuapp/link',
            },
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
              label: 'Hero Mockup Image (Upload)',
            },
            {
              name: 'imageUrl',
              type: 'text',
              label: 'Hero Image URL (e.g. /mockup.jpg or hosted URL)',
              defaultValue: '/mockup.jpg',
            },
            {
              name: 'imageAlt',
              type: 'text',
              label: 'Hero Image Alt Text',
              defaultValue: 'Link Dashboard Preview',
            },
          ],
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Page Content (Rich Text Editor)',
        },
        {
          name: 'metricsSection',
          type: 'group',
          label: 'Active Metrics Section',
          fields: [
            {
              name: 'showMetrics',
              type: 'checkbox',
              label: 'Show Active Metrics Section',
              defaultValue: true,
            },
            {
              name: 'heading',
              type: 'text',
              label: 'Section Heading',
              defaultValue: 'Active Metrics',
            },
            {
              name: 'subheading',
              type: 'text',
              label: 'Section Subheading',
              defaultValue: 'Real-time performance and link analytics',
            },
          ],
        },
        {
          name: 'featuresSection',
          type: 'group',
          label: 'Features Section',
          fields: [
            {
              name: 'showFeatures',
              type: 'checkbox',
              label: 'Show Features Section',
              defaultValue: true,
            },
            {
              name: 'badgeText',
              type: 'text',
              label: 'Features Badge',
              defaultValue: 'Features',
            },
            {
              name: 'heading',
              type: 'text',
              label: 'Features Heading',
              defaultValue: 'Powerful Features for Streamlined Link Management',
            },
            {
              name: 'subheading',
              type: 'textarea',
              label: 'Features Subheading',
              defaultValue:
                'This app presents a variety of features tailored to simplify and enhance your link management experience. From customizable short URLs to detailed analytics and link history.',
            },
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
              label: 'Features Mockup Image (Upload)',
            },
            {
              name: 'imageUrl',
              type: 'text',
              label: 'Features Image URL (e.g. /mockup2.png or hosted URL)',
              defaultValue: '/mockup2.png',
            },
            {
              name: 'imageAlt',
              type: 'text',
              label: 'Features Image Alt Text',
              defaultValue: 'Link Features Overview',
            },
          ],
        },
      ],
    },

    // 4. Posts / Blog Collection (Articles with Rich Text Editor)
    {
      slug: 'posts',
      labels: {
        singular: 'Blog Post',
        plural: 'Blog Posts',
      },
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'category', 'status', 'publishedAt'],
      },
      access: {
        admin: isAdmin,
        create: isAdmin,
        read: () => true, // Public read so visitors can read blog articles
        update: isAdmin,
        delete: isAdmin,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Post Title',
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          label: 'Slug (e.g. "future-of-url-shortening")',
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
          label: 'Excerpt (Short summary for card & SEO)',
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          label: 'Post Content (Rich Text Editor)',
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'Product',
          options: [
            { label: 'Product', value: 'Product' },
            { label: 'Engineering', value: 'Engineering' },
            { label: 'Guides', value: 'Guides' },
            { label: 'Updates', value: 'Updates' },
          ],
        },
        {
          name: 'author',
          type: 'text',
          defaultValue: 'Link Team',
          label: 'Author Name',
        },
        {
          name: 'authorRole',
          type: 'text',
          defaultValue: 'Product & Engineering',
          label: 'Author Role',
        },
        {
          name: 'readingTime',
          type: 'text',
          defaultValue: '3 min read',
          label: 'Reading Time (e.g. "3 min read")',
        },
        {
          name: 'tags',
          type: 'text',
          label: 'Tags (comma separated, e.g. "Next.js, Redis, Performance")',
          defaultValue: 'Product, URL Shortener',
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'published',
          options: [
            { label: 'Published', value: 'published' },
            { label: 'Draft', value: 'draft' },
          ],
        },
        {
          name: 'publishedAt',
          type: 'date',
          label: 'Publication Date',
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },

    // 5. Media Collection (File & Image Uploads)
    {
      slug: 'media',
      labels: {
        singular: 'Media',
        plural: 'Media',
      },
      admin: {
        useAsTitle: 'filename',
      },
      access: {
        admin: isAdmin,
        create: isAdmin,
        read: () => true,
        update: isAdmin,
        delete: isAdmin,
      },
      upload: {
        staticDir: path.resolve(dirname, 'public/media'),
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
        },
      ],
    },
  ],
  globals: [
    {
      slug: 'settings',
      label: 'Settings',
      access: {
        read: () => true,
        update: isAdmin,
      },
      fields: [
        {
          name: 'auth',
          type: 'group',
          label: 'Authentication & Sign-Up Settings',
          fields: [
            {
              name: 'allowRegistration',
              type: 'checkbox',
              label: 'Allow New User Registrations',
              defaultValue: true,
              admin: {
                description:
                  'Toggle whether new visitors are permitted to register accounts (Email and OAuth).',
              },
            },
            {
              name: 'enableEmailAuth',
              type: 'checkbox',
              label: 'Enable Email / Password Sign In',
              defaultValue: true,
              admin: {
                description:
                  'Enable or disable email & password authentication across login and registration.',
              },
            },
            {
              name: 'enableGoogleAuth',
              type: 'checkbox',
              label: 'Enable Google Sign In',
              defaultValue: true,
              admin: {
                description:
                  'Enable or disable Google OAuth button and authentication.',
              },
            },
            {
              name: 'enableGithubAuth',
              type: 'checkbox',
              label: 'Enable GitHub Sign In',
              defaultValue: true,
              admin: {
                description:
                  'Enable or disable GitHub OAuth button and authentication.',
              },
            },
            {
              name: 'registrationDisabledMessage',
              type: 'text',
              label: 'Registration Disabled Notice',
              defaultValue:
                'New user registrations are currently disabled by administrator.',
              admin: {
                description:
                  'Notice shown to visitors on the registration page when new registrations are turned off.',
              },
            },
          ],
        },
        {
          name: 'footer',
          type: 'group',
          label: 'Footer Settings',
          fields: [
            {
              name: 'tagline',
              type: 'text',
              label: 'Footer Tagline',
              defaultValue:
                'Your link shortening companion, built for speed and simplicity.',
            },
            {
              name: 'authorName',
              type: 'text',
              label: 'Author Name',
              defaultValue: 'Raju',
            },
            {
              name: 'authorUrl',
              type: 'text',
              label: 'Author Profile URL',
              defaultValue: 'https://github.com/rajuapp',
            },
            {
              name: 'githubUrl',
              type: 'text',
              label: 'GitHub Source Code URL',
              defaultValue: 'https://github.com/rajuapp/link',
            },
            {
              name: 'copyright',
              type: 'text',
              label: 'Copyright Notice',
              defaultValue: '© 2026 Link. All rights reserved.',
            },
            {
              name: 'links',
              type: 'array',
              label: 'Footer Navigation Links',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  label: 'Label',
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'URL',
                },
                {
                  name: 'newTab',
                  type: 'checkbox',
                  label: 'Open in new tab',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || process.env.NEXTAUTH_SECRET!,
  email: () => ({
    name: 'agentmail',
    defaultFromAddress: process.env.AGENTMAIL_INBOX || 'rajuapp@agentmail.to',
    defaultFromName: 'Link Admin',
    sendEmail: async (message) => {
      const { sendAgentMail } = await import('@/lib/agentmail')
      let to = ''
      if (typeof message.to === 'string') {
        to = message.to
      } else if (Array.isArray(message.to)) {
        to = message.to
          .map((t) => (typeof t === 'string' ? t : (t as any).address))
          .join(', ')
      } else if (
        typeof message.to === 'object' &&
        message.to !== null &&
        'address' in message.to
      ) {
        to = (message.to as any).address
      }

      if (!to) {
        console.warn(
          '[Payload AgentMail] No recipient found in message:',
          message
        )
        return
      }

      return sendAgentMail({
        to,
        subject: message.subject || 'Reset your Link Admin password',
        text: String(message.text || ''),
        html: String(message.html || message.text || ''),
      })
    },
  }),
  db: postgresAdapter({
    schemaName: 'payload',
    push: false,
    pool: {
      connectionString: dbConnectionString,
      ssl: isLocalDb
        ? false
        : {
            rejectUnauthorized: false,
          },
    },
  }),
})
