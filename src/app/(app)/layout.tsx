import type { Metadata } from 'next'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'https://link.raju.app'),
  title: {
    default: 'Link | Quick and Easy URL Shortening',
    template: '%s | Link',
  },
  description:
    'Link: Your link shortening companion, built by the community, for the community. Embrace the power of open source as you create elegant short links and contribute to a tool that empowers us all.',
  verification: {
    google: 'Jez4u6OnGwqBtt0nPf57OpZYhhGTu3F8s36lWdTcA5Q',
  },
  keywords: [
    'URL shortener',
    'open-source',
    'link management',
    'custom short URLs',
    'community-driven',
    'URL optimization',
    'link branding',
    'efficient link sharing',
    'collaborative tool',
  ],
  authors: [
    {
      name: 'Raju',
      url: '',
    },
  ],
  creator: 'Raju',
  openGraph: {
    type: 'website',
    title: 'Link | Quick and Easy URL Shortening',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Link | Quick and Easy URL Shortening',
    description:
      'Link: Your link shortening companion, built by the community, for the community. Embrace the power of open source as you create elegant short links and contribute to a tool that empowers us all.',
    images: ['/og.png'],
    creator: '@rajuapp',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@/components/analytics'

import '@/styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
