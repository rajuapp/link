'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export function ForgotPasswordContent() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(
          data.message || 'Failed to process request. Please try again.'
        )
        return
      }

      setIsSubmitted(true)
      toast({
        title: 'Instructions Sent',
        description: 'Check your inbox for a reset link and 6-digit code.',
      })
    } catch {
      setErrorMessage(
        'Network error occurred. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className='grid gap-4 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500'>
          <CheckCircle2 className='h-6 w-6' />
        </div>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>Check your email</h2>
          <p className='text-xs leading-relaxed text-muted-foreground'>
            We sent a password reset link and 6-digit code to{' '}
            <span className='font-medium text-foreground'>{email}</span>.
          </p>
        </div>

        <div className='grid gap-2 pt-2'>
          <Button asChild className='w-full'>
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
              <KeyRound className='mr-2 h-4 w-4' />
              Enter Reset Code
            </Link>
          </Button>
          <Button
            variant='ghost'
            onClick={() => setIsSubmitted(false)}
            className='w-full text-xs text-muted-foreground'
          >
            Try another email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='grid gap-6'>
      {errorMessage && (
        <div className='flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
          <div>
            <p className='font-medium'>Error</p>
            <p className='text-xs opacity-90'>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
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
              disabled={isLoading}
              autoFocus
              required
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
