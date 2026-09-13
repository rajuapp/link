import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Setting } from '@/../payload-types'

async function getFooterSettings(): Promise<Setting['footer'] | null> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'settings',
    })
    return settings?.footer ?? null
  } catch (error) {
    console.warn('Error fetching footer settings from Payload CMS:', error)
    return null
  }
}

export async function Footer() {
  const footer = await getFooterSettings()

  const authorName = footer?.authorName ?? 'raju.app'
  const authorUrl = footer?.authorUrl ?? 'https://github.com/rajuapp'
  const githubUrl = footer?.githubUrl ?? 'https://github.com/rajuapp/link'
  const copyright = footer?.copyright ?? '© 2026 Link. All rights reserved.'
  const tagline =
    footer?.tagline ?? 'Your link shortening companion, built for simplicity.'
  const initialLinks =
    footer?.links && footer.links.length > 0
      ? footer.links
      : [
          { label: 'Home', url: '/', newTab: false },
          { label: 'Blog', url: '/blog', newTab: false },
          { label: 'Dashboard', url: '/dashboard', newTab: false },
          { label: 'Privacy', url: '/privacy', newTab: false },
          { label: 'Terms', url: '/terms', newTab: false },
          { label: 'GitHub', url: githubUrl, newTab: true },
        ]

  const links = [...initialLinks]
  const hasPrivacy = links.some(
    (l) => l.url === '/privacy' || l.url === '/privacy-policy'
  )
  const hasTerms = links.some(
    (l) => l.url === '/terms' || l.url === '/terms-of-service'
  )

  if (!hasPrivacy) {
    links.splice(links.length - 1, 0, {
      label: 'Privacy',
      url: '/privacy',
      newTab: false,
    })
  }
  if (!hasTerms) {
    links.splice(links.length - 1, 0, {
      label: 'Terms',
      url: '/terms',
      newTab: false,
    })
  }

  return (
    <footer className='border-t bg-card/40 py-10 transition-colors'>
      <div className='container flex flex-col items-center justify-between gap-6 md:flex-row'>
        {/* Left / Brand & Copyright */}
        <div className='flex flex-col items-center gap-1.5 text-center md:items-start md:text-left'>
          <p className='text-sm font-medium text-gray-900'>
            Crafted by{' '}
            <Link
              href={authorUrl}
              target={authorUrl.startsWith('http') ? '_blank' : undefined}
              rel={
                authorUrl.startsWith('http') ? 'noopener noreferrer' : undefined
              }
              className='font-semibold underline underline-offset-4 transition-colors hover:text-primary'
            >
              {authorName}
            </Link>
            . Source code on{' '}
            <Link
              href={githubUrl}
              target={githubUrl.startsWith('http') ? '_blank' : undefined}
              rel={
                githubUrl.startsWith('http') ? 'noopener noreferrer' : undefined
              }
              className='font-semibold underline underline-offset-4 transition-colors hover:text-primary'
            >
              GitHub
            </Link>
            .
          </p>
          <p className='text-xs text-muted-foreground'>
            {copyright}
            {tagline && <span className='hidden sm:inline'> • {tagline}</span>}
          </p>
        </div>

        {/* Right / Dynamic Navigation Links */}
        {links.length > 0 && (
          <nav className='flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground'>
            {links.map((item, idx) => (
              <Link
                key={item.id ?? `${item.label}-${idx}`}
                href={item.url}
                target={item.newTab ? '_blank' : undefined}
                rel={item.newTab ? 'noopener noreferrer' : undefined}
                className='transition-colors hover:text-foreground'
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </footer>
  )
}
