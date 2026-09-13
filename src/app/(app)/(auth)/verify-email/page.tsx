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
import { VerifyEmailContent } from './verify-email-content'

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address to activate your Link account.',
}

export default function VerifyEmailPage() {
  return (
    <Card className='w-[90vw] max-w-[400px]'>
      <CardHeader className='flex flex-col justify-center space-y-2 text-center'>
        <Logo className='mx-auto' />
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit code or click the link sent to your inbox to
          activate your account
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
          <VerifyEmailContent />
        </Suspense>

        <p className='px-8 text-center text-sm text-muted-foreground'>
          <Link
            href='/login'
            className='hover:text-brand underline underline-offset-4'
          >
            Back to Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
