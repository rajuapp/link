import Link from 'next/link'
import Image from 'next/image'

import {
  BarChart3,
  ChevronRight,
  Link as LinkIcon,
  Paintbrush2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Metrics } from '@/components/metrics'
import { RichText } from '@/components/rich-text'

import { getCurrentUser } from '@/lib/session'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Page } from '@/../payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getHomePage(): Promise<Page | null> {
  try {
    const payload = await getPayload({ config })
    // Match by common home slugs or document ID 1
    const result = await payload.find({
      collection: 'pages',
      depth: 2,
      where: {
        or: [
          { slug: { equals: '/' } },
          { slug: { equals: 'home' } },
          { slug: { equals: '/home' } },
          { slug: { equals: '' } },
          { id: { equals: 1 } },
        ],
      },
      limit: 1,
    })

    if (result.docs && result.docs.length > 0) {
      return result.docs[0] as Page
    }

    // Fallback: If slug was edited to something else, retrieve the first page
    const fallback = await payload.find({
      collection: 'pages',
      depth: 2,
      limit: 1,
    })

    return (fallback.docs[0] as Page) || null
  } catch (error) {
    console.warn('Error fetching home page from Payload CMS:', error)
    return null
  }
}

function getMediaUrl(
  mediaField: any,
  fallbackUrl?: string | null,
  defaultStatic: string = '/mockup.jpg'
): string {
  if (mediaField && typeof mediaField === 'object') {
    if (mediaField.filename) {
      return `/media/${mediaField.filename}`
    }
    if (mediaField.url) {
      if (mediaField.url.startsWith('/api/media/file/')) {
        return `/media/${mediaField.url.replace('/api/media/file/', '')}`
      }
      return mediaField.url
    }
  }
  if (fallbackUrl && fallbackUrl.trim().length > 0) {
    return fallbackUrl.trim()
  }
  return defaultStatic
}

function getMediaAlt(
  mediaField: any,
  fallbackAlt?: string | null,
  defaultAlt: string = ''
): string {
  if (mediaField && typeof mediaField === 'object' && mediaField.alt) {
    return mediaField.alt
  }
  if (fallbackAlt && fallbackAlt.trim().length > 0) {
    return fallbackAlt.trim()
  }
  return defaultAlt
}

export default async function RootPage() {
  const [user, page] = await Promise.all([getCurrentUser(), getHomePage()])

  // Content from Payload CMS with sensible fallbacks
  const heroBadgeText = page?.hero?.badgeText ?? 'Find the project on Github'
  const heroBadgeUrl = page?.hero?.badgeUrl ?? 'https://github.com/rajuapp/link'
  const heroHeading =
    page?.hero?.heading ?? 'Create Links Simply, All in One Place'
  const heroSubheading =
    page?.hero?.subheading ??
    'Effortlessly generate shortened links and efficiently manage them all in one centralized dashboard.'
  const primaryButtonText = page?.hero?.primaryButtonText ?? 'Get Started'
  const primaryButtonUrl = page?.hero?.primaryButtonUrl ?? '/login'
  const secondaryButtonText = page?.hero?.secondaryButtonText ?? 'Github'
  const secondaryButtonUrl =
    page?.hero?.secondaryButtonUrl ?? 'https://github.com/rajuapp/link'

  // Editable Media (Hero)
  const heroImageSrc = getMediaUrl(
    page?.hero?.media,
    page?.hero?.imageUrl,
    '/mockup.jpg'
  )
  const heroImageAlt = getMediaAlt(
    page?.hero?.media,
    page?.hero?.imageAlt,
    'Link Dashboard Preview'
  )

  const showMetrics = page?.metricsSection?.showMetrics !== false
  const metricsHeading = page?.metricsSection?.heading ?? 'Active Metrics'
  const metricsSubheading = page?.metricsSection?.subheading

  const showFeatures = page?.featuresSection?.showFeatures !== false
  const featuresBadge = page?.featuresSection?.badgeText ?? 'Features'
  const featuresHeading =
    page?.featuresSection?.heading ??
    'Powerful Features for Streamlined Link Management'
  const featuresSubheading =
    page?.featuresSection?.subheading ??
    'This app presents a variety of features tailored to simplify and enhance your link management experience. From customizable short URLs to detailed analytics and link history.'

  // Editable Media (Features)
  const featuresImageSrc = getMediaUrl(
    page?.featuresSection?.media,
    page?.featuresSection?.imageUrl,
    '/mockup2.png'
  )
  const featuresImageAlt = getMediaAlt(
    page?.featuresSection?.media,
    page?.featuresSection?.imageAlt,
    'Link Features Overview'
  )

  return (
    <>
      <Navbar />
      <section className='container flex min-h-screen flex-col items-center justify-center gap-24 py-24'>
        <div className='flex flex-col items-center gap-4'>
          {heroBadgeText && (
            <Badge
              variant='secondary'
              className='flex items-center justify-center'
            >
              <Link
                href={heroBadgeUrl || '#'}
                target={heroBadgeUrl?.startsWith('http') ? '_blank' : undefined}
                rel={
                  heroBadgeUrl?.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
              >
                {heroBadgeText}
              </Link>
              <ChevronRight className='h-4 w-4' />
            </Badge>
          )}
          <h1 className='text-balance text-center text-5xl font-bold text-gray-900'>
            {heroHeading}
          </h1>
          <p className='text-balance max-w-[42rem] text-center text-xl text-muted-foreground'>
            {heroSubheading}
          </p>
          <div className='flex gap-4'>
            {user ? (
              <Button asChild>
                <Link href='/dashboard'>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={primaryButtonUrl || '/login'}>
                  {primaryButtonText}
                </Link>
              </Button>
            )}

            {secondaryButtonText && (
              <Button variant='outline' asChild>
                <Link
                  href={secondaryButtonUrl || '#'}
                  target={
                    secondaryButtonUrl?.startsWith('http')
                      ? '_blank'
                      : undefined
                  }
                  rel={
                    secondaryButtonUrl?.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  {secondaryButtonText}
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className='relative flex w-full max-w-full justify-center'>
          <Image
            priority
            width={1000}
            height={600}
            src={heroImageSrc}
            alt={heroImageAlt}
          />
        </div>
      </section>

      {/* Editorial Content from Payload CMS Editor */}
      {page?.content && (
        <section className='container py-8'>
          <div className='mx-auto max-w-4xl rounded-2xl border bg-muted/20 p-8 shadow-sm'>
            <RichText data={page.content} />
          </div>
        </section>
      )}

      {/* Active Metrics Section (Configurable from Payload CMS) */}
      {showMetrics && (
        <Metrics heading={metricsHeading} subheading={metricsSubheading} />
      )}

      {/* Features Section */}
      {showFeatures && (
        <section className='container py-24'>
          <div className='flex flex-col items-center gap-4 py-16'>
            <Badge variant='secondary'>{featuresBadge}</Badge>
            <h2 className='text-balance py-2 text-center text-4xl font-bold tracking-tight text-gray-900'>
              {featuresHeading}
            </h2>
            <p className='text-balance mb-6 max-w-[800px] text-center text-xl text-muted-foreground'>
              {featuresSubheading}
            </p>
            <Image
              src={featuresImageSrc}
              width={1100}
              height={800}
              alt={featuresImageAlt}
            />
            <div className='mx-auto grid w-full max-w-5xl grid-cols-1 place-items-center gap-8 sm:grid-cols-3'>
              <div className='flex flex-col items-center text-center'>
                <div className='mb-4 flex h-8 w-8 items-center justify-center rounded bg-primary'>
                  <LinkIcon className='text-white' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>
                  Easily create links
                </h3>
                <p className='text-muted-foreground'>
                  easily create short links and share QR code to anyone
                </p>
              </div>

              <div className='flex flex-col items-center text-center'>
                <div className='mb-4 flex h-8 w-8 items-center justify-center rounded bg-primary'>
                  <Paintbrush2 className='text-white' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>Dashboard</h3>
                <p className='text-muted-foreground'>
                  The essential information you need, presented simply and
                  clearly.
                </p>
              </div>

              <div className='flex flex-col items-center text-center'>
                <div className='mb-4 flex h-8 w-8 items-center justify-center rounded bg-primary'>
                  <BarChart3 className='text-white' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>Statistics</h3>
                <p className='max-w-xs text-muted-foreground'>
                  Intuitively visualize how many people clicked on your link
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
