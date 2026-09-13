import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  FileText,
  Share2,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RichText } from '@/components/rich-text'
import type { Page } from '@/../payload-types'

interface CmsPageViewProps {
  page: Page
  defaultType?: 'privacy' | 'terms' | 'general'
}

export function CmsPageView({
  page,
  defaultType = 'general',
}: CmsPageViewProps) {
  const isPrivacy = defaultType === 'privacy' || page.slug.includes('privacy')
  const isTerms = defaultType === 'terms' || page.slug.includes('term')

  const icon = isPrivacy ? (
    <ShieldCheck className='h-4 w-4 text-primary' />
  ) : isTerms ? (
    <FileText className='h-4 w-4 text-primary' />
  ) : null

  const badgeText =
    page.hero?.badgeText ||
    (isPrivacy
      ? 'Privacy & Security'
      : isTerms
        ? 'Legal & Terms'
        : 'Information')

  const formattedDate = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'September 13, 2026'

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <Navbar />

      <main className='flex-1 pb-20 pt-10'>
        <div className='container max-w-4xl px-4 md:px-6'>
          {/* Back button & Breadcrumb */}
          <div className='mb-8 flex items-center justify-between'>
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='gap-1.5 text-muted-foreground hover:text-foreground'
            >
              <Link href='/'>
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </Link>
            </Button>

            <div className='flex items-center gap-2'>
              {isPrivacy && (
                <Button asChild variant='outline' size='sm' className='text-xs'>
                  <Link href='/terms'>Terms of Service</Link>
                </Button>
              )}
              {isTerms && (
                <Button asChild variant='outline' size='sm' className='text-xs'>
                  <Link href='/privacy'>Privacy Policy</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Page Header Header Card */}
          <header className='mb-12 rounded-2xl border bg-card/60 p-8 shadow-sm backdrop-blur-sm md:p-10'>
            <div className='flex flex-wrap items-center gap-2.5'>
              <Badge
                variant='secondary'
                className='gap-1.5 px-3 py-1 font-medium'
              >
                {icon}
                {badgeText}
              </Badge>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Calendar className='h-3.5 w-3.5' />
                <span>Last updated: {formattedDate}</span>
              </div>
            </div>

            <h1 className='mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl'>
              {page.hero?.heading || page.title}
            </h1>

            {page.hero?.subheading && (
              <p className='text-balance mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground'>
                {page.hero.subheading}
              </p>
            )}

            {/* Highlights callout */}
            {isPrivacy && (
              <div className='mt-6 grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/90 sm:grid-cols-3 sm:text-sm'>
                <div className='flex items-start gap-2'>
                  <span className='font-bold text-primary'>✓</span>
                  <span>
                    <strong>Zero Third-Party Ads</strong> or data brokerage
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='font-bold text-primary'>✓</span>
                  <span>
                    <strong>Bcrypt Hashed Passwords</strong> never stored in
                    plaintext
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='font-bold text-primary'>✓</span>
                  <span>
                    <strong>410 Gone Purges</strong> for expired link caches
                  </span>
                </div>
              </div>
            )}

            {isTerms && (
              <div className='mt-6 grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/90 sm:grid-cols-3 sm:text-sm'>
                <div className='flex items-start gap-2'>
                  <span className='font-bold text-primary'>✓</span>
                  <span>
                    <strong>Zero Tolerance</strong> for malware, phishing & spam
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='font-bold text-primary'>✓</span>
                  <span>
                    <strong>Creator Rule Enforcement</strong> (caps, expiration
                    & deactivation)
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='font-bold text-primary'>✓</span>
                  <span>
                    <strong>Fair Use & Uptime</strong> commitments
                  </span>
                </div>
              </div>
            )}
          </header>

          {/* Body Content from Payload CMS Lexical RichText */}
          <article className='prose prose-slate dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:border-b prose-h2:pb-3 prose-h2:text-2xl prose-h3:mt-6 prose-h3:text-lg prose-p:my-4 prose-p:text-base prose-p:leading-7 prose-ul:my-4 prose-li:my-1.5 max-w-none leading-relaxed text-foreground/90'>
            {page.content ? (
              <RichText data={page.content} />
            ) : (
              <p className='italic text-muted-foreground'>
                Content is being updated by administrators.
              </p>
            )}
          </article>

          {/* Footer Contact Callout */}
          <div className='mt-16 rounded-2xl border bg-muted/30 p-6 md:p-8'>
            <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
              <div className='space-y-1'>
                <h4 className='text-base font-semibold text-foreground'>
                  Have questions about our {page.title}?
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Our legal and engineering team is here to assist with any data
                  protection or terms inquiries.
                </p>
              </div>
              <div className='flex flex-wrap gap-2.5'>
                <Button asChild size='sm' variant='default'>
                  <Link href='/dashboard'>Go to Dashboard</Link>
                </Button>
                <Button asChild size='sm' variant='outline'>
                  <a
                    href='https://github.com/rajuapp/link'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    GitHub Repository
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
