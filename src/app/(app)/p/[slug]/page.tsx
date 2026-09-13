'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Logo } from '@/assets/icons/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PasswordProtectedPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/link/${slug}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 410) {
          setError(data.error || 'This link is no longer available.')
        } else {
          setError(data.error || 'Incorrect password. Please try again.')
        }
        setIsLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        window.location.reload()
      }
    } catch (err) {
      console.error('Unlock request error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl shadow-black/5'>
        <div className='flex flex-col items-center space-y-3 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <Lock className='h-7 w-7' />
          </div>

          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Password Protected
            </h1>
            <p className='text-sm text-muted-foreground'>
              This link is password-protected by its creator. Enter the password
              to continue.
            </p>
          </div>

          <div className='inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground'>
            /{slug}
          </div>
        </div>

        {error && (
          <div className='flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter link password...'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              <>
                Unlock & Continue
                <ArrowRight className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </form>

        <div className='border-t pt-4 text-center text-xs text-muted-foreground'>
          <Link
            href='/'
            className='inline-flex items-center hover:text-foreground'
          >
            <Logo className='mr-1.5 h-3.5 w-3.5' />
            Powered by Link
          </Link>
        </div>
      </div>
    </div>
  )
}
