'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

import {
  userRegisterSchema,
  type UserRegisterFormValues,
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

interface UserRegisterFormProps {
  authSettings?: AuthSettings
}

export function UserRegisterForm({
  authSettings: initialAuthSettings,
}: UserRegisterFormProps) {
  const router = useRouter()
  const [authSettings, setAuthSettings] = useState<AuthSettings | undefined>(
    initialAuthSettings
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: UserRegisterFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      if (response.status === 403) {
        const errJson = await response.json().catch(() => null)
        toast({
          title: 'Registration Blocked',
          description:
            errJson?.message ||
            'Registration is currently disabled by administrator.',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      if (response.status === 409) {
        toast({
          title: 'Registration Failed',
          description: 'A user with this email already exists.',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        toast({
          title: 'Registration Failed',
          description: errorText || 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      const resData = await response.json()

      if (resData?.requiresVerification) {
        toast({
          title: 'Verification Email Sent!',
          description:
            'Please check your inbox. You can verify your account by clicking the link or entering the 6-digit code.',
        })
        router.push(
          `/verify-email?email=${encodeURIComponent(data.email.toLowerCase().trim())}`
        )
        return
      }

      toast({
        title: 'Account Created',
        description: 'You can now sign in.',
      })
      router.push('/login')
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
          Sign Up Currently Unavailable
        </p>
        <p>
          Registration methods have been temporarily turned off by
          administrator.
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
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='John Doe'
                      type='text'
                      autoCapitalize='words'
                      autoComplete='name'
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='At least 6 characters'
                        type={showPassword ? 'text' : 'password'}
                        autoCapitalize='none'
                        autoComplete='new-password'
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

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='Confirm your password'
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoCapitalize='none'
                        autoComplete='new-password'
                        disabled={isLoading || isAnySocialLoading}
                        className='pr-10'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                        disabled={isLoading || isAnySocialLoading}
                      >
                        {showConfirmPassword ? (
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
              Create Account
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
