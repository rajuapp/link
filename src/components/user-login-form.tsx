'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

import {
  userLoginSchema,
  type UserLoginFormValues,
} from '@/lib/validations/auth'
import type { AuthSettings } from '@/lib/cms-auth-settings'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { GithubLogo } from '@/assets/icons/github-logo'
import { GoogleLogo } from '@/assets/icons/google-logo'

interface UserLoginFormProps {
  authSettings?: AuthSettings
}

export function UserLoginForm({
  authSettings: initialAuthSettings,
}: UserLoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authSettings, setAuthSettings] = useState<AuthSettings | undefined>(
    initialAuthSettings
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth-settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAuthSettings(data)
      })
      .catch(() => {})
  }, [])

  const showEmail = authSettings?.enableEmailAuth ?? true
  const showGithub = authSettings?.enableGithubAuth ?? true
  const showGoogle = authSettings?.enableGoogleAuth ?? true
  const hasSocial = showGithub || showGoogle
  const hasAnyAuth = showEmail || hasSocial

  const isAnySocialLoading = isGitHubLoading || isGoogleLoading

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      toast({
        title: 'Password Updated',
        description:
          'Your password has been reset successfully. Please sign in.',
      })
    } else if (searchParams.get('verified') === 'true') {
      toast({
        title: 'Email Verified',
        description: 'Your account is active. You can now sign in.',
      })
    }

    const errorParam = searchParams.get('error')
    if (errorParam === 'RegistrationDisabled') {
      toast({
        title: 'Registration Disabled',
        description:
          authSettings?.registrationDisabledMessage ||
          'New account creation is currently closed. Only existing users can sign in.',
        variant: 'destructive',
      })
    } else if (errorParam === 'AccessDenied') {
      toast({
        title: 'Sign In Disabled',
        description:
          'This sign-in method is currently disabled by administrator.',
        variant: 'destructive',
      })
    } else if (errorParam === 'OAuthCallback') {
      toast({
        title: 'OAuth Authentication Failed',
        description:
          'Could not complete OAuth sign in. Please verify your client credentials and redirect URLs, or try again.',
        variant: 'destructive',
      })
    } else if (errorParam === 'OAuthAccountNotLinked') {
      toast({
        title: 'Email Already Registered',
        description:
          'An account with this email address already exists. Please sign in with your email/password first.',
        variant: 'destructive',
      })
    }
  }, [searchParams, authSettings])

  const form = useForm<UserLoginFormValues>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: UserLoginFormValues) {
    setIsLoading(true)

    try {
      const signInResult = await signIn('credentials', {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      })

      if (!signInResult?.ok || signInResult.error) {
        if (signInResult?.error === 'EMAIL_NOT_VERIFIED') {
          toast({
            title: 'Email Not Verified',
            description:
              'Please verify your email before signing in. Check your inbox for the link or 6-digit code.',
            variant: 'destructive',
          })
          router.push(
            `/verify-email?email=${encodeURIComponent(data.email.toLowerCase())}`
          )
          setIsLoading(false)
          return
        }

        toast({
          title: 'Sign In Failed',
          description:
            signInResult?.error ===
            'Email and password sign-in is currently disabled'
              ? 'Email and password sign-in is currently disabled by administrator.'
              : 'Invalid email or password. Please try again.',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      toast({
        title: 'Success',
        description: 'Welcome back!',
      })

      router.push('/dashboard')
      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  if (!hasAnyAuth) {
    return (
      <div className='flex flex-col items-center justify-center space-y-3 rounded-lg border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground'>
        <AlertCircle className='h-8 w-8 text-amber-500' />
        <p className='font-medium text-foreground'>
          Sign In Currently Unavailable
        </p>
        <p>
          Authentication has been temporarily disabled by the administrator.
        </p>
      </div>
    )
  }

  return (
    <div className='grid gap-6'>
      {showEmail && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='name@example.com'
                      type='email'
                      autoCapitalize='none'
                      autoComplete='email'
                      autoCorrect='off'
                      disabled={isLoading || isAnySocialLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <Link
                      href='/forgot-password'
                      className='text-xs font-medium text-primary hover:underline'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='••••••••'
                        type={showPassword ? 'text' : 'password'}
                        autoCapitalize='none'
                        autoComplete='current-password'
                        disabled={isLoading || isAnySocialLoading}
                        className='pr-10'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                        disabled={isLoading || isAnySocialLoading}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full'
              disabled={isLoading || isAnySocialLoading}
            >
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Sign In
            </Button>
          </form>
        </Form>
      )}

      {showEmail && hasSocial && (
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <Separator />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>
      )}

      {hasSocial && (
        <div
          className={`grid gap-3 ${
            showGithub && showGoogle ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {showGithub && (
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setIsGitHubLoading(true)
                signIn('github')
              }}
              disabled={isLoading || isAnySocialLoading}
            >
              {isGitHubLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <GithubLogo />
              )}
            </Button>
          )}
          {showGoogle && (
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setIsGoogleLoading(true)
                signIn('google')
              }}
              disabled={isLoading || isAnySocialLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <GoogleLogo />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
