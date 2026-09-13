import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Loader2 } from 'lucide-react'

import { Logo } from '@/assets/icons/logo'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserLoginForm } from '@/components/user-login-form'
import { getAuthSettings } from '@/lib/cms-auth-settings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your Link account',
}

export default async function LoginPage() {
  const authSettings = await getAuthSettings()

  return (
    <Card className='w-[90vw] max-w-[400px]'>
      <CardHeader className='flex flex-col justify-center space-y-2 text-center'>
        <Logo className='mx-auto' />
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials or choose a provider to sign in
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col space-y-4'>
        <Suspense
          fallback={
            <div className='flex h-48 items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          }
        >
          <UserLoginForm authSettings={authSettings} />
        </Suspense>

        {authSettings.allowRegistration ? (
          <p className='px-8 text-center text-sm text-muted-foreground'>
            <Link
              href='/register'
              className='hover:text-brand underline underline-offset-4'
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        ) : (
          <p className='px-8 text-center text-xs text-muted-foreground'>
            New registrations are currently closed.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
