'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const queryEmail = searchParams.get('email') || ''
  const queryToken = searchParams.get('token') || ''
  const queryCode = searchParams.get('code') || ''

  const [email, setEmail] = useState(queryEmail)
  const [token, setToken] = useState(queryToken)
  const [code, setCode] = useState(queryCode)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (queryEmail) setEmail((prev) => prev || queryEmail)
    if (queryToken) setToken((prev) => prev || queryToken)
    if (queryCode) setCode((prev) => prev || queryCode)
  }, [queryEmail, queryToken, queryCode])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      })
      return
    }

    if (!token && (!code || code.length < 6)) {
      toast({
        title: 'Reset Code Required',
        description: 'Please enter the 6-digit reset code from your email.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both passwords match.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          token: token ? token.trim() : undefined,
          code: code ? code.trim() : undefined,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(
          data.message || 'Failed to reset password. Please try again.'
        )
        return
      }

      setIsSuccess(true)
      toast({
        title: 'Password Reset Successful!',
        description:
          'Your password has been updated. Redirecting to sign in...',
      })

      setTimeout(() => {
        router.push('/login?reset=success')
      }, 1500)
    } catch {
      setErrorMessage(
        'Network error occurred. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className='flex flex-col items-center justify-center space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center'>
        <CheckCircle2 className='h-12 w-12 text-emerald-500' />
        <div className='space-y-1'>
          <h2 className='text-lg font-bold text-foreground'>Password Reset!</h2>
          <p className='text-sm text-muted-foreground'>
            Your password has been reset successfully. Redirecting you to sign
            in...
          </p>
        </div>
        <Button asChild className='mt-2 w-full'>
          <Link href='/login?reset=success'>
            Sign In Now
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>
    )
  }

  const hasToken = !!token

  return (
    <div className='grid gap-6'>
      {errorMessage && (
        <div className='flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
          <div>
            <p className='font-medium'>Reset Failed</p>
            <p className='text-xs opacity-90'>{errorMessage}</p>
          </div>
        </div>
      )}

      {hasToken && (
        <div className='flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground'>
          <KeyRound className='h-4 w-4 shrink-0 text-foreground' />
          <span>
            Reset token verified from email link. Set your new password below.
          </span>
        </div>
      )}

      <form onSubmit={handleReset} className='space-y-4'>
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
              required
            />
          </div>

          {!hasToken && (
            <div className='grid gap-1'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='code'>Reset Code</Label>
                <span className='text-xs text-muted-foreground'>
                  6 digits from email
                </span>
              </div>
              <Input
                id='code'
                type='text'
                placeholder='123456'
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                className='text-center font-mono text-xl font-bold tracking-widest'
                required
              />
            </div>
          )}

          <div className='grid gap-1'>
            <Label htmlFor='password'>New Password</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                autoCapitalize='none'
                autoComplete='new-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <Eye className='h-4 w-4 text-muted-foreground' />
                )}
              </Button>
            </div>
          </div>

          <div className='grid gap-1'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              autoCapitalize='none'
              autoComplete='new-password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={
              isLoading || (!hasToken && code.length < 6) || password.length < 6
            }
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
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
            Expired link?
          </span>
        </div>
      </div>

      <Button asChild variant='outline' className='w-full'>
        <Link href='/forgot-password'>Request New Link</Link>
      </Button>
    </div>
  )
}
