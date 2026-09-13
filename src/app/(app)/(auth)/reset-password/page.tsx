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
import { ResetPasswordContent } from './reset-password-content'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Link account.',
}

export default function ResetPasswordPage() {
  return (
    <Card className='w-[90vw] max-w-[400px]'>
      <CardHeader className='flex flex-col justify-center space-y-2 text-center'>
        <Logo className='mx-auto' />
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          Enter your 6-digit code or use the link from your email to set a new
          password
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
          <ResetPasswordContent />
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
