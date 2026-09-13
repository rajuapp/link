'use client'

import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import {
  Loader2,
  Shuffle,
  Calendar,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Sliders,
  Trash2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LinkSchema, LinkForm as LinkFormType } from '@/lib/validations/link'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { UtmBuilder } from '@/components/utm-builder'

export interface ExtendedLinkFormProps {
  defaultValues?: Partial<LinkFormType> & {
    id?: string
    hasPassword?: boolean
  }
  id?: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export function LinkForm(props: ExtendedLinkFormProps) {
  const { defaultValues, setIsOpen, id } = props

  const [showPassword, setShowPassword] = useState(false)
  const hasExistingAdvancedSettings = Boolean(
    defaultValues?.isActive === false ||
      defaultValues?.expiresAt ||
      defaultValues?.maxClicks ||
      defaultValues?.hasPassword ||
      (defaultValues?.url && /utm_/i.test(defaultValues.url))
  )
  const [showAdvanced, setShowAdvanced] = useState(hasExistingAdvancedSettings)
  const [clearExistingPassword, setClearExistingPassword] = useState(false)

  // Format expiresAt for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForDateTimeInput = (dateVal?: string | Date | null) => {
    if (!dateVal) return ''
    try {
      const d = new Date(dateVal)
      if (isNaN(d.getTime())) return ''
      // Convert to local ISO format: YYYY-MM-DDTHH:mm
      const pad = (n: number) => n.toString().padStart(2, '0')
      const year = d.getFullYear()
      const month = pad(d.getMonth() + 1)
      const day = pad(d.getDate())
      const hours = pad(d.getHours())
      const minutes = pad(d.getMinutes())
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ''
    }
  }

  const form = useForm<LinkFormType>({
    resolver: zodResolver(LinkSchema),
    defaultValues: {
      url: defaultValues?.url ?? '',
      domain: defaultValues?.domain ?? '',
      description: defaultValues?.description ?? '',
      expiresAt: formatForDateTimeInput(defaultValues?.expiresAt),
      maxClicks: defaultValues?.maxClicks ?? null,
      isActive: defaultValues?.isActive !== false,
      password: '',
    },
  })

  function randomDomain() {
    const random = nanoid(6)
    form.setValue('domain', random)
  }

  const router = useRouter()

  async function onSubmit(data: LinkFormType) {
    const linkId = id || defaultValues?.id

    // Clean up empty fields
    const payload: any = {
      url: data.url,
      description: data.description || '',
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      maxClicks: data.maxClicks ? Number(data.maxClicks) : null,
      isActive: data.isActive !== false,
    }

    if (!defaultValues) {
      payload.domain = data.domain
      if (data.password && data.password.trim()) {
        payload.password = data.password.trim()
      }
    } else {
      if (clearExistingPassword) {
        payload.clearPassword = true
      } else if (data.password && data.password.trim()) {
        payload.password = data.password.trim()
      }
    }

    if (defaultValues && linkId) {
      const response = await fetch(`/api/link/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: payload,
        }),
      })

      if (response.ok) {
        router.refresh()
        toast({
          description: 'Link updated successfully',
        })
        setIsOpen(false)
        return
      }

      toast({
        title: 'Update failed',
        description: 'Failed to update link. Please check inputs.',
        variant: 'destructive',
      })
      return
    }

    const response = await fetch('/api/link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: payload,
      }),
    })

    if (response.ok) {
      router.refresh()
      toast({
        description: 'Link created successfully',
      })
      setIsOpen(false)
      return
    }

    if (response.status === 409) {
      form.setError('domain', {
        message: 'This domain / slug already exists. Please choose another.',
      })
      return
    }

    toast({
      title: 'Creation failed',
      description: 'Failed to create link. Please try again.',
      variant: 'destructive',
    })
  }

  const currentUrl = form.watch('url')

  return (
    <Form {...form}>
      <form
        className='flex flex-col gap-4 py-2'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Destination URL */}
        <FormField
          control={form.control}
          name='url'
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='url'>Destination URL</FormLabel>
              <FormControl>
                <Input
                  id='url'
                  placeholder='https://example.com/page'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug / Domain (for new links) */}
        {!defaultValues && (
          <FormField
            control={form.control}
            name='domain'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel htmlFor='domain'>Custom Slug</FormLabel>
                  <button
                    onClick={randomDomain}
                    type='button'
                    className='flex items-center text-xs text-muted-foreground transition hover:text-foreground'
                  >
                    <Shuffle className='mr-1.5 h-3.5 w-3.5' />
                    Randomize
                  </button>
                </div>
                <FormControl>
                  <Input id='domain' placeholder='my-link' {...field} />
                </FormControl>
                <FormDescription className='text-xs'>
                  Your shortened link: /{field.value || 'slug'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='description'>
                Description (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  id='description'
                  placeholder='Notes or campaign description...'
                  rows={2}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Toggle Advanced Settings */}
        <div className='pt-1'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='w-full text-xs font-medium'
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Sliders className='mr-2 h-3.5 w-3.5' />
            {showAdvanced ? 'Hide Advanced Settings' : 'Advanced Settings'}
          </Button>
        </div>

        {showAdvanced && (
          <div className='space-y-4 rounded-lg border bg-muted/20 p-4 animate-in fade-in-50'>
            {/* Real-time UTM Builder Tool */}
            <UtmBuilder
              currentUrl={currentUrl || ''}
              onUrlChange={(newUrl) =>
                form.setValue('url', newUrl, { shouldValidate: true })
              }
            />

            {/* Expiration Date */}
            <FormField
              control={form.control}
              name='expiresAt'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <FormLabel
                      htmlFor='expiresAt'
                      className='text-xs font-semibold'
                    >
                      Expiration Date & Time (Optional)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      id='expiresAt'
                      type='datetime-local'
                      className='h-9 text-xs'
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription className='text-[11px]'>
                    After this time, requests will receive an HTTP 410 Gone
                    response.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Maximum Clicks Limit */}
            <FormField
              control={form.control}
              name='maxClicks'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center space-x-2'>
                    <ShieldCheck className='h-4 w-4 text-muted-foreground' />
                    <FormLabel
                      htmlFor='maxClicks'
                      className='text-xs font-semibold'
                    >
                      Maximum Click Limit (Optional)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      id='maxClicks'
                      type='number'
                      min='1'
                      placeholder='e.g. 100'
                      className='h-9 text-xs'
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? null : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription className='text-[11px]'>
                    Link will return 410 Gone once this click ceiling is
                    reached.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Protection */}
            <div className='space-y-2 border-t border-border/60 pt-1'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Lock className='h-4 w-4 text-primary' />
                  <span className='text-xs font-semibold'>
                    Password Protection
                  </span>
                </div>
                {defaultValues?.hasPassword && !clearExistingPassword && (
                  <span className='rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary'>
                    Password Enabled
                  </span>
                )}
              </div>

              {defaultValues?.hasPassword && !clearExistingPassword && (
                <div className='flex items-center justify-between rounded-md border bg-background p-2.5 text-xs'>
                  <span className='text-muted-foreground'>
                    This link is currently password-protected.
                  </span>
                  <button
                    type='button'
                    onClick={() => setClearExistingPassword(true)}
                    className='flex items-center text-xs font-medium text-destructive hover:underline'
                  >
                    <Trash2 className='mr-1 h-3.5 w-3.5' />
                    Remove Password
                  </button>
                </div>
              )}

              {(!defaultValues?.hasPassword || clearExistingPassword) && (
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            placeholder={
                              defaultValues?.hasPassword
                                ? 'Enter new password to update...'
                                : 'Set optional password...'
                            }
                            className='h-9 pr-9 text-xs'
                            {...field}
                            value={field.value || ''}
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground'
                          >
                            {showPassword ? (
                              <EyeOff className='h-3.5 w-3.5' />
                            ) : (
                              <Eye className='h-3.5 w-3.5' />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription className='text-[11px]'>
                        Store password hashes only (bcrypt). Intercepts visitors
                        with a password entry screen.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        <Button
          type='submit'
          disabled={form.formState.isSubmitting}
          className='mt-2'
        >
          {form.formState.isSubmitting && (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          )}
          {defaultValues ? 'Save Changes' : 'Create Link'}
        </Button>
      </form>
    </Form>
  )
}
