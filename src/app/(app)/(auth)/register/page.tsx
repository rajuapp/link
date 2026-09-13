import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { AlertCircle, Loader2 } from 'lucide-react'

import { Logo } from '@/assets/icons/logo'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserRegisterForm } from '@/components/user-register-form'
import { getAuthSettings } from '@/lib/cms-auth-settings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create an account on Link',
}

export default async function SignupPage() {
  const authSettings = await getAuthSettings()

  return (
    <Card className='w-[90vw] max-w-[400px]'>
      <CardHeader className='flex flex-col justify-center space-y-2 text-center'>
        <Logo className='mx-auto' />
        <CardTitle>Welcome to Link</CardTitle>
        <CardDescription>
          {authSettings.allowRegistration
            ? 'Create an account or choose a provider to get started'
            : 'Registration is currently closed'}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col space-y-4'>
        {authSettings.allowRegistration ? (
          <Suspense
            fallback={
              <div className='flex h-48 items-center justify-center'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            }
          >
            <UserRegisterForm authSettings={authSettings} />
          </Suspense>
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 rounded-lg border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground'>
            <AlertCircle className='h-8 w-8 text-amber-500' />
            <p className='font-medium text-foreground'>
              {authSettings.registrationDisabledMessage}
            </p>
            <p>
              Please contact the administrator or check back later. If you
              already have an account, you can sign in below.
            </p>
          </div>
        )}

        <p className='px-8 text-center text-sm text-muted-foreground'>
          <Link
            href='/login'
            className='hover:text-brand underline underline-offset-4'
          >
            Have an account? Login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
