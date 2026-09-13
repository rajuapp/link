import Link from 'next/link'
import { AlertTriangle, Clock, Ban, Hash, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ExpiredPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ExpiredPage(props: ExpiredPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined
  const reason = (searchParams?.reason as string) || 'expired'
  const slug = (searchParams?.slug as string) || ''

  let title = 'Link No Longer Available'
  let description =
    'This short link is currently unavailable or has been removed.'
  let icon = <AlertTriangle className='h-8 w-8 text-destructive' />

  if (reason === 'deactivated') {
    title = 'Link Deactivated'
    description = 'The creator of this link has temporarily deactivated it.'
    icon = <Ban className='h-8 w-8 text-amber-500' />
  } else if (reason === 'max_clicks') {
    title = 'Click Limit Reached'
    description = 'This link had a maximum click limit that has been exhausted.'
    icon = <Hash className='h-8 w-8 text-rose-500' />
  } else if (reason === 'expired') {
    title = 'Link Expired'
    description =
      'This link was configured with an expiration date that has passed.'
    icon = <Clock className='h-8 w-8 text-amber-500' />
  }

  return (
    <div className='flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 text-center shadow-xl shadow-black/5'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60'>
          {icon}
        </div>

        <div className='space-y-1.5'>
          <div className='inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-destructive'>
            410 Gone
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>

        {slug && (
          <div className='inline-flex items-center rounded-md border bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground'>
            /{slug}
          </div>
        )}

        <div className='flex flex-col gap-2.5 pt-2'>
          <Button asChild className='w-full'>
            <Link href='/'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Return to Home
            </Link>
          </Button>
          <Button asChild variant='outline' className='w-full'>
            <Link href='/dashboard'>
              <Plus className='mr-2 h-4 w-4' />
              Create Your Own Link
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
