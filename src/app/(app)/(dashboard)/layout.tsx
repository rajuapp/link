import Link from 'next/link'

import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import { ReactNode } from 'react'

import { UserAccountNav } from '@/components/user-account-nav'

import { getCurrentUser } from '@/lib/session'

import { Logo } from '@/assets/icons/logo'

interface DashboardLayoutProps {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <header className='border-b'>
        <nav className='container flex h-16 flex-wrap items-center justify-between py-4'>
          <Link href='/' className='flex items-center space-x-2'>
            <Logo />
            <span className='text-lg font-bold'>Link</span>
          </Link>
          <UserAccountNav user={user} />
        </nav>
      </header>
      <main className='container'>{children}</main>
    </>
  )
}
