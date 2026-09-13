'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface UtmBuilderProps {
  currentUrl: string
  onUrlChange: (newUrl: string) => void
}

export function UtmBuilder({ currentUrl, onUrlChange }: UtmBuilderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [source, setSource] = useState('')
  const [medium, setMedium] = useState('')
  const [campaign, setCampaign] = useState('')
  const [term, setTerm] = useState('')
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)

  // Parse existing UTM params from currentUrl when opened
  useEffect(() => {
    if (!currentUrl) return
    try {
      const urlObj = new URL(
        currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`
      )
      const s = urlObj.searchParams.get('utm_source') || ''
      const m = urlObj.searchParams.get('utm_medium') || ''
      const c = urlObj.searchParams.get('utm_campaign') || ''
      const t = urlObj.searchParams.get('utm_term') || ''
      const cn = urlObj.searchParams.get('utm_content') || ''

      if (s || m || c || t || cn) {
        setSource(s)
        setMedium(m)
        setCampaign(c)
        setTerm(t)
        setContent(cn)
      }
    } catch {
      // invalid URL while typing, ignore
    }
  }, [isOpen, currentUrl])

  // Apply UTM parameters to base URL
  const applyUtm = (
    newSource: string,
    newMedium: string,
    newCampaign: string,
    newTerm: string,
    newContent: string
  ) => {
    if (!currentUrl) return

    try {
      let baseUrlStr = currentUrl.trim()
      const hasProtocol = /^https?:\/\//i.test(baseUrlStr)
      const urlObj = new URL(hasProtocol ? baseUrlStr : `https://${baseUrlStr}`)

      if (newSource) urlObj.searchParams.set('utm_source', newSource)
      else urlObj.searchParams.delete('utm_source')

      if (newMedium) urlObj.searchParams.set('utm_medium', newMedium)
      else urlObj.searchParams.delete('utm_medium')

      if (newCampaign) urlObj.searchParams.set('utm_campaign', newCampaign)
      else urlObj.searchParams.delete('utm_campaign')

      if (newTerm) urlObj.searchParams.set('utm_term', newTerm)
      else urlObj.searchParams.delete('utm_term')

      if (newContent) urlObj.searchParams.set('utm_content', newContent)
      else urlObj.searchParams.delete('utm_content')

      const finalUrl = hasProtocol
        ? urlObj.toString()
        : urlObj.toString().replace(/^https?:\/\//i, '')

      onUrlChange(finalUrl)
    } catch {
      // Invalid URL format
    }
  }

  const handleFieldChange = (
    field: 'source' | 'medium' | 'campaign' | 'term' | 'content',
    value: string
  ) => {
    const s = field === 'source' ? value : source
    const m = field === 'medium' ? value : medium
    const c = field === 'campaign' ? value : campaign
    const t = field === 'term' ? value : term
    const cn = field === 'content' ? value : content

    if (field === 'source') setSource(value)
    if (field === 'medium') setMedium(value)
    if (field === 'campaign') setCampaign(value)
    if (field === 'term') setTerm(value)
    if (field === 'content') setContent(value)

    applyUtm(s, m, c, t, cn)
  }

  const applyPreset = (presetSource: string, presetMedium: string) => {
    setSource(presetSource)
    setMedium(presetMedium)
    applyUtm(presetSource, presetMedium, campaign, term, content)
  }

  const clearUtm = () => {
    setSource('')
    setMedium('')
    setCampaign('')
    setTerm('')
    setContent('')
    applyUtm('', '', '', '', '')
  }

  const handleCopy = () => {
    if (!currentUrl) return
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasAnyUtm = !!(source || medium || campaign || term || content)

  return (
    <div className='rounded-lg border border-border/80 bg-muted/30 transition-all'>
      <div
        className='flex cursor-pointer select-none items-center justify-between p-3'
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex items-center space-x-2'>
          <Sparkles className='h-4 w-4 text-primary' />
          <span className='text-sm font-semibold'>UTM Builder</span>
          {hasAnyUtm && (
            <span className='bg-primary/15 rounded-full px-2 py-0.5 text-[11px] font-medium text-primary'>
              Tags Active
            </span>
          )}
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 w-7 p-0'
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
        >
          {isOpen ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className='space-y-4 border-t border-border/60 p-3 pt-3'>
          {/* Quick Presets */}
          <div>
            <span className='text-xs font-medium text-muted-foreground'>
              Quick Presets
            </span>
            <div className='mt-1.5 flex flex-wrap gap-1.5'>
              <button
                type='button'
                onClick={() => applyPreset('twitter', 'social')}
                className='rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground'
              >
                Twitter / X
              </button>
              <button
                type='button'
                onClick={() => applyPreset('linkedin', 'social')}
                className='rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground'
              >
                LinkedIn
              </button>
              <button
                type='button'
                onClick={() => applyPreset('google', 'cpc')}
                className='rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground'
              >
                Google Ads
              </button>
              <button
                type='button'
                onClick={() => applyPreset('newsletter', 'email')}
                className='rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground'
              >
                Newsletter
              </button>
              <button
                type='button'
                onClick={() => applyPreset('facebook', 'social')}
                className='rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground'
              >
                Facebook
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='space-y-1'>
              <Label className='text-xs'>utm_source *</Label>
              <Input
                placeholder='google, twitter, newsletter'
                className='h-8 text-xs'
                value={source}
                onChange={(e) => handleFieldChange('source', e.target.value)}
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>utm_medium *</Label>
              <Input
                placeholder='cpc, social, email, banner'
                className='h-8 text-xs'
                value={medium}
                onChange={(e) => handleFieldChange('medium', e.target.value)}
              />
            </div>
            <div className='space-y-1 sm:col-span-2'>
              <Label className='text-xs'>utm_campaign</Label>
              <Input
                placeholder='summer_sale, launch_2026'
                className='h-8 text-xs'
                value={campaign}
                onChange={(e) => handleFieldChange('campaign', e.target.value)}
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>utm_term</Label>
              <Input
                placeholder='keyword or audience'
                className='h-8 text-xs'
                value={term}
                onChange={(e) => handleFieldChange('term', e.target.value)}
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>utm_content</Label>
              <Input
                placeholder='cta_button, banner_v2'
                className='h-8 text-xs'
                value={content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
              />
            </div>
          </div>

          {hasAnyUtm && (
            <div className='flex items-center justify-between pt-1'>
              <button
                type='button'
                onClick={clearUtm}
                className='flex items-center text-xs text-muted-foreground hover:text-destructive'
              >
                <X className='mr-1 h-3 w-3' /> Clear UTM Parameters
              </button>
              <button
                type='button'
                onClick={handleCopy}
                className='flex items-center text-xs text-muted-foreground hover:text-foreground'
              >
                {copied ? (
                  <>
                    <Check className='mr-1 h-3 w-3 text-emerald-500' /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className='mr-1 h-3 w-3' /> Copy URL
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
