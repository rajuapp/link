'use client'

import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from '@/components/ui/card'
import { Copy } from '@/components/copy'
import { LinkOperations } from '@/components/link-operations'
import { Link as LinkData } from '@prisma/client'
import {
  BarChart,
  Eye,
  EyeOff,
  Lock,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Ban,
} from 'lucide-react'
import { ModalQRCode } from './modal-qrcode'

import QRCode from 'react-qr-code'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface LinkItemProps {
  data: (LinkData & { passwordHash?: string | null })[]
}

export function LinkItem({ data }: LinkItemProps) {
  const [showLinks, setShowLinks] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.localStorage?.getItem === 'function'
    ) {
      const initial: { [key: string]: boolean } = {}
      for (const item of data) {
        try {
          const stored = window.localStorage.getItem(item.domain)
          if (stored !== null) {
            initial[item.domain] = JSON.parse(stored)
          }
        } catch {
          // ignore parse errors
        }
      }
      setShowLinks(initial)
    }
  }, [data])

  const toggleLinkVisibility = (domain: string) => {
    const nextState = !showLinks[domain]
    setShowLinks((prev) => ({
      ...prev,
      [domain]: nextState,
    }))
    if (
      typeof window !== 'undefined' &&
      typeof window.localStorage?.setItem === 'function'
    ) {
      try {
        window.localStorage.setItem(domain, JSON.stringify(nextState))
      } catch {
        // ignore storage errors
      }
    }
  }

  const isLinkHidden = (domain: string) => {
    return !!showLinks[domain]
  }

  return (
    <div className='flex flex-col gap-4'>
      {data.map((item) => {
        const isExpired =
          item.expiresAt && new Date() > new Date(item.expiresAt)
        const isMaxClicksReached =
          item.maxClicks !== null &&
          item.maxClicks !== undefined &&
          item.clicks >= item.maxClicks
        const isDeactivated = item.isActive === false
        const isLive = !isDeactivated && !isExpired && !isMaxClicksReached
        const hasPassword = !!item.passwordHash

        return (
          <Card
            key={item.id}
            className='w-full transition-all hover:border-border/80'
          >
            <CardHeader className='flex flex-col justify-center space-y-2 pb-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex flex-wrap items-center space-x-1 sm:space-x-2'>
                  <CardTitle>
                    <a
                      href={`/${item.domain}`}
                      className={cn(
                        'text-lg font-bold transition hover:text-primary sm:text-[24px]',
                        {
                          'text-muted-foreground line-through': !isLive,
                        }
                      )}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {item.domain}
                    </a>
                  </CardTitle>

                  <Copy text={item.domain} />
                  <div
                    onClick={() => toggleLinkVisibility(item.domain)}
                    className='cursor-pointer rounded-full bg-gray-100 p-1.5 transition-all duration-75 hover:scale-105 active:scale-95 dark:bg-zinc-800'
                  >
                    {isLinkHidden(item.domain) ? (
                      <EyeOff className='h-[16px] w-[16px] text-muted-foreground transition-all' />
                    ) : (
                      <Eye className='h-[16px] w-[16px] text-muted-foreground transition-all' />
                    )}
                  </div>

                  <ModalQRCode>
                    <QRCode
                      id='QRCode'
                      className='h-32 w-32'
                      value={`${process.env.NEXT_PUBLIC_URL || 'https://link.raju.app'}/${item.domain}`}
                    />
                  </ModalQRCode>

                  <button className='flex items-center rounded-full bg-gray-100 p-1.5 text-xs text-muted-foreground transition-all duration-75 hover:scale-105 active:scale-95 dark:bg-zinc-800'>
                    <BarChart className='mr-1 h-[14px] w-[14px] text-muted-foreground transition-all' />
                    {item.clicks}
                    <span className='ml-1 hidden sm:block'>
                      {item.clicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </button>
                </div>

                <div>
                  <LinkOperations
                    id={item.id}
                    description={item.description as string}
                    domain={item.domain}
                    url={item.url}
                    expiresAt={item.expiresAt}
                    maxClicks={item.maxClicks}
                    isActive={item.isActive}
                    hasPassword={hasPassword}
                  />
                </div>
              </div>

              {/* Badges Bar: Status, Rules, Password */}
              <div className='flex flex-wrap items-center gap-1.5 pt-1'>
                {isDeactivated && (
                  <span className='inline-flex items-center gap-1 rounded-full border border-zinc-600 bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300'>
                    <Ban className='h-3 w-3 text-zinc-400' /> Deactivated
                  </span>
                )}

                {isExpired && !isDeactivated && (
                  <span className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-500'>
                    <Clock className='h-3 w-3' /> Expired
                  </span>
                )}

                {isMaxClicksReached && !isDeactivated && !isExpired && (
                  <span className='inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-500'>
                    <ShieldAlert className='h-3 w-3' /> Limit Reached
                  </span>
                )}

                {isLive && (
                  <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='h-3 w-3' /> Active
                  </span>
                )}

                {hasPassword && (
                  <span className='inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-500 dark:text-indigo-400'>
                    <Lock className='h-3 w-3' /> Password Protected
                  </span>
                )}

                {item.expiresAt && !isExpired && (
                  <span className='inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground'>
                    <Clock className='h-3 w-3' />
                    Expires {new Date(item.expiresAt).toLocaleDateString()}
                  </span>
                )}

                {item.maxClicks && (
                  <span className='inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground'>
                    Limit: {item.clicks} / {item.maxClicks} clicks
                  </span>
                )}
              </div>

              <CardDescription
                className={cn('max-w-lg truncate text-xs', {
                  'blur-sm': isLinkHidden(item.domain),
                })}
              >
                {item.url}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='break-all text-sm text-muted-foreground'>
                {item.description ? item.description : 'No description.'}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
