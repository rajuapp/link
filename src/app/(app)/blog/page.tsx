import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/../payload-types'

export const metadata: Metadata = {
  title: 'Blog & Articles | Link',
  description:
    'Explore the latest product announcements, engineering deep dives, and tutorials from the Link team.',
}

async function getPublishedPosts(): Promise<Post[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
    })
    return (result.docs as Post[]) || []
  } catch (error) {
    console.warn('Error fetching blog posts from Payload CMS:', error)
    return []
  }
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <Navbar />
      <main className='container min-h-[80vh] py-12 md:py-20'>
        {/* Blog Header */}
        <div className='mx-auto max-w-3xl text-center'>
          <Badge
            variant='secondary'
            className='mb-4 inline-flex items-center gap-1.5 px-3 py-1'
          >
            <BookOpen className='h-3.5 w-3.5' />
            Blog & Insights
          </Badge>
          <h1 className='text-balance text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl'>
            Articles, updates & engineering stories
          </h1>
          <p className='text-balance mt-4 text-lg text-muted-foreground'>
            Learn how we build high-speed link infrastructure, design modern
            developer tools, and optimize URL workflows.
          </p>
        </div>

        {/* Posts Grid */}
        <div className='mx-auto mt-16 max-w-6xl'>
          {posts.length === 0 ? (
            <div className='flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center'>
              <BookOpen className='h-12 w-12 text-muted-foreground/60' />
              <h3 className='mt-4 text-lg font-semibold'>
                No articles published yet
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Check back soon or create new articles in the Payload CMS Admin
                Panel.
              </p>
              <Button asChild variant='outline' className='mt-6'>
                <Link href='/'>Back to Home</Link>
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2'>
              {posts.map((post) => (
                <article
                  key={post.id}
                  className='group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md'
                >
                  <div>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <Badge
                        variant='outline'
                        className='font-medium text-primary'
                      >
                        {post.category || 'Product'}
                      </Badge>
                      <div className='flex items-center gap-3'>
                        {post.readingTime && (
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3.5 w-3.5' />
                            {post.readingTime}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className='flex items-center gap-1'>
                            <Calendar className='h-3.5 w-3.5' />
                            {formatDate(post.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className='mt-4 text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-primary'>
                      <Link
                        href={`/blog/${post.slug}`}
                        className='focus:outline-none'
                      >
                        <span className='absolute inset-0' aria-hidden='true' />
                        {post.title}
                      </Link>
                    </h2>

                    <p className='mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
                      {post.excerpt}
                    </p>
                  </div>

                  <div className='mt-6 flex items-center justify-between border-t pt-4'>
                    <div className='flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                        {(post.author || 'L')[0]}
                      </div>
                      <div className='text-xs leading-none'>
                        <p className='font-semibold text-gray-900'>
                          {post.author || 'Link Team'}
                        </p>
                        {post.authorRole && (
                          <p className='mt-0.5 text-muted-foreground'>
                            {post.authorRole}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className='inline-flex items-center text-xs font-semibold text-primary transition-transform group-hover:translate-x-1'>
                      Read article <ArrowRight className='ml-1 h-3.5 w-3.5' />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
