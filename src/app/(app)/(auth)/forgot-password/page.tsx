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
import { ForgotPasswordContent } from './forgot-password-content'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Link account password.',
}

export default function ForgotPasswordPage() {
  return (
    <Card className='w-[90vw] max-w-[400px]'>
      <CardHeader className='flex flex-col justify-center space-y-2 text-center'>
        <Logo className='mx-auto' />
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a password reset link along
          with a 6-digit code.
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
          <ForgotPasswordContent />
        </Suspense>

        <p className='px-8 text-center text-sm text-muted-foreground'>
          Remember your password?{' '}
          <Link
            href='/login'
            className='hover:text-brand underline underline-offset-4'
          >
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
