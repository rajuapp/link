import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
// Database client with updated schema models
import { db } from '@/lib/db'
import { updateLinkClicks } from '@/lib/update-link-clicks'
import { getLinkUnlockToken } from '@/lib/link-token'
import { renderExpiredHtml } from '@/lib/expired-html'
import { getCmsPageBySlug } from '@/lib/cms-pages'
import { CmsPageView } from '@/components/cms-page-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ShortLinkPage({ params }: PageProps) {
  const { slug } = await params

  const reservedSlugs = [
    'admin',
    'api',
    'dashboard',
    'login',
    'register',
    'blog',
    'privacy',
    'terms',
    'privacy-policy',
    'terms-of-service',
    'expired',
    'p',
  ]

  if (!slug || reservedSlugs.includes(slug)) notFound()

  // 1. Direct database lookup for shortened URL
  const link = await db.link.findFirst({
    where: {
      domain: {
        equals: slug,
      },
    },
    select: {
      id: true,
      url: true,
      domain: true,
      clicks: true,
      expiresAt: true,
      maxClicks: true,
      isActive: true,
      passwordHash: true,
    },
  })

  // If a shortened link is found, apply all redirection rules
  if (link) {
    // A. Deactivated check
    if (link.isActive === false) {
      const html = renderExpiredHtml(
        link.domain,
        'deactivated',
        'This link has been deactivated by its owner.'
      )
      return (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className='m-0 h-screen w-screen p-0'
        />
      )
    }

    // B. Expiration date check
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      const html = renderExpiredHtml(
        link.domain,
        'expired',
        'This link has expired.'
      )
      return (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className='m-0 h-screen w-screen p-0'
        />
      )
    }

    // C. Maximum click ceiling check
    if (
      link.maxClicks !== null &&
      link.maxClicks !== undefined &&
      link.clicks >= link.maxClicks
    ) {
      const html = renderExpiredHtml(
        link.domain,
        'max_clicks',
        'This link has reached its maximum allowed click limit.'
      )
      return (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className='m-0 h-screen w-screen p-0'
        />
      )
    }

    // D. Password protection check
    if (link.passwordHash) {
      const cookieStore = await cookies()
      const unlockCookie = cookieStore.get(`link_unlock_${link.domain}`)?.value
      const expectedToken = getLinkUnlockToken(link.domain, link.passwordHash)

      if (unlockCookie !== expectedToken) {
        redirect(`/p/${slug}`)
      }
    }

    // E. Increment click counter in background
    try {
      updateLinkClicks(slug)
    } catch (e) {
      console.warn('Error updating clicks:', e)
    }

    // F. Instant redirect to destination URL
    let targetUrl = link.url
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`
    }

    redirect(targetUrl)
  }

  // 2. If not a short link, check if it's a CMS page
  const cmsPage = await getCmsPageBySlug(slug)
  if (cmsPage) {
    return <CmsPageView page={cmsPage} />
  }

  // 3. If neither, return 404
  notFound()
}
