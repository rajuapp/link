'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const queryEmail = searchParams.get('email') || ''
  const queryToken = searchParams.get('token') || ''
  const queryCode = searchParams.get('code') || ''

  const [email, setEmail] = useState(queryEmail)
  const [code, setCode] = useState(queryCode)
  const [status, setStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // 1. Auto-verify if token and email are in the URL (1-click link from email)
  useEffect(() => {
    if (queryToken && queryEmail && status === 'idle') {
      handleVerify({ email: queryEmail, token: queryToken })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryToken, queryEmail])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  async function handleVerify(payload: {
    email: string
    token?: string
    code?: string
  }) {
    if (!payload.email) {
      toast({
        title: 'Email Required',
        description:
          'Please provide your email address to verify your account.',
        variant: 'destructive',
      })
      return
    }

    if (!payload.token && (!payload.code || payload.code.length < 6)) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the full 6-digit verification code.',
        variant: 'destructive',
      })
      return
    }

    setStatus('verifying')
    setErrorMessage('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(
          data.message || 'Verification failed. Please try again.'
        )
        return
      }

      setStatus('success')
      toast({
        title: 'Account Verified!',
        description: data.message || 'You can now sign in to your account.',
      })
    } catch {
      setStatus('error')
      setErrorMessage(
        'Network error during verification. Please check your connection.'
      )
    }
  }

  async function handleResend() {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to resend verification.',
        variant: 'destructive',
      })
      return
    }

    setIsResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.alreadyVerified) {
        setStatus('success')
        toast({
          title: 'Already Verified',
          description: data.message,
        })
      } else {
        toast({
          title: 'Code Sent',
          description:
            data.message || 'Check your inbox for a new 6-digit code and link.',
        })
        setResendCooldown(60)
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  // Success view
  if (status === 'success') {
    return (
      <div className='flex flex-col items-center justify-center space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center'>
        <CheckCircle2 className='h-12 w-12 text-emerald-500' />
        <div className='space-y-1'>
          <h2 className='text-lg font-bold text-foreground'>
            Account Verified!
          </h2>
          <p className='text-sm text-muted-foreground'>
            Your email address has been confirmed. You now have full access to
            your Link account.
          </p>
        </div>
        <Button asChild className='mt-2 w-full'>
          <Link href='/login?verified=true'>
            Sign In Now
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>
    )
  }

  // Verifying spinner
  if (status === 'verifying' && queryToken) {
    return (
      <div className='flex flex-col items-center justify-center space-y-4 rounded-xl border border-border/60 bg-muted/30 p-8 text-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        <div className='space-y-1'>
          <h2 className='text-base font-semibold'>Verifying your email...</h2>
          <p className='text-xs text-muted-foreground'>
            Please wait a moment while we activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='grid gap-6'>
      {status === 'error' && (
        <div className='flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
          <div>
            <p className='font-medium'>Verification Failed</p>
            <p className='text-xs opacity-90'>{errorMessage}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleVerify({ email, code })
        }}
        className='space-y-4'
      >
        <div className='grid gap-2'>
          <div className='grid gap-1'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              placeholder='name@example.com'
              type='email'
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect='off'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'verifying' || isResending}
              required
            />
          </div>

          <div className='grid gap-1'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='code'>Verification Code</Label>
              <span className='text-xs text-muted-foreground'>
                6 digits from inbox
              </span>
            </div>
            <Input
              id='code'
              placeholder='123456'
              type='text'
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={status === 'verifying' || isResending}
              className='text-center font-mono text-xl font-bold tracking-widest'
              autoFocus={!!email && !queryToken}
              required
            />
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={status === 'verifying' || isResending || code.length < 6}
          >
            {status === 'verifying' ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
        </div>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Didn&apos;t receive code?
          </span>
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        onClick={handleResend}
        disabled={isResending || resendCooldown > 0}
        className='w-full'
      >
        {isResending ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Mail className='mr-2 h-4 w-4' />
        )}
        {resendCooldown > 0
          ? `Resend in ${resendCooldown}s`
          : 'Resend Verification Code'}
      </Button>
    </div>
  )
}
