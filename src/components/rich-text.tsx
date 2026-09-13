import React from 'react'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import { cn } from '@/lib/utils'

interface RichTextProps {
  data: any
  className?: string
}

export function RichText({ data, className }: RichTextProps) {
  if (!data || !data.root || !data.root.children?.length) {
    return null
  }

  return (
    <div
      className={cn('prose prose-slate max-w-none text-gray-700', className)}
    >
      <LexicalRichText data={data} />
    </div>
  )
}
