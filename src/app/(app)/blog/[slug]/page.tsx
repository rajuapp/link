import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RichText } from '@/components/rich-text'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/../payload-types'

export type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      limit: 1,
    })
    return (result.docs[0] as Post) || null
  } catch (error) {
    console.warn('Error fetching blog post from Payload CMS:', error)
    return null
  }
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article Not Found | Link Blog',
    }
  }

  return {
    title: `${post.title} | Link Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: post.author ? [post.author] : undefined,
    },
  }
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const tagsList = post.tags
    ? post.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  return (
    <>
      <Navbar />
      <main className='container min-h-[85vh] max-w-4xl py-12 md:py-16'>
        {/* Back Link */}
        <div className='mb-8'>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='gap-1.5 text-muted-foreground hover:text-foreground'
          >
            <Link href='/blog'>
              <ArrowLeft className='h-4 w-4' />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Post Header */}
        <header className='mb-10 border-b pb-10'>
          <div className='flex flex-wrap items-center gap-3 text-xs'>
            <Badge variant='secondary' className='font-medium text-primary'>
              {post.category || 'Product'}
            </Badge>
            {post.readingTime && (
              <span className='flex items-center gap-1 text-muted-foreground'>
                <Clock className='h-3.5 w-3.5' />
                {post.readingTime}
              </span>
            )}
            {post.publishedAt && (
              <span className='flex items-center gap-1 text-muted-foreground'>
                <Calendar className='h-3.5 w-3.5' />
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>

          <h1 className='text-balance mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl'>
            {post.title}
          </h1>

          <p className='text-balance mt-6 text-xl leading-relaxed text-muted-foreground'>
            {post.excerpt}
          </p>

          {/* Author & Meta Banner */}
          <div className='mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white'>
                {(post.author || 'L')[0]}
              </div>
              <div>
                <p className='font-semibold text-gray-900'>
                  {post.author || 'Link Team'}
                </p>
                {post.authorRole && (
                  <p className='text-xs text-muted-foreground'>
                    {post.authorRole}
                  </p>
                )}
              </div>
            </div>

            {tagsList.length > 0 && (
              <div className='flex flex-wrap items-center gap-1.5'>
                <Tag className='h-3.5 w-3.5 text-muted-foreground' />
                {tagsList.map((tag) => (
                  <Badge
                    key={tag}
                    variant='outline'
                    className='text-xs font-normal'
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Post Body (Lexical RichText) */}
        <article className='prose prose-slate prose-lg max-w-none leading-relaxed text-gray-800'>
          <RichText data={post.content} />
        </article>

        {/* Bottom CTA */}
        <div className='mt-16 rounded-2xl border bg-card p-8 text-center shadow-sm'>
          <h3 className='text-2xl font-bold tracking-tight text-gray-900'>
            Start shortening links with Link today
          </h3>
          <p className='mt-2 text-sm text-muted-foreground'>
            Fast redirects, live Redis caching, and real-time click metrics in
            one unified platform.
          </p>
          <div className='mt-6 flex justify-center gap-3'>
            <Button asChild>
              <Link href='/login'>Get Started Free</Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/blog'>Read More Articles</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
