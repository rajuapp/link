import { type ClassValue, clsx } from 'clsx'

import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFirstLetters = (name: string | undefined | null) => {
  if (!name) return 'NA'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

export const onCopy = (text: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  const url = `${baseUrl}/${text}`
  if (typeof window !== 'undefined') {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {})
    } else {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
  }
}
