import type { Metadata } from 'next'
import { getCmsPageBySlug } from '@/lib/cms-pages'
import { CmsPageView } from '@/components/cms-page-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Terms of Service | Link',
  description:
    'Review the terms of service, acceptable use policy, and guidelines for using the Link shortening platform.',
  openGraph: {
    title: 'Terms of Service | Link',
    description:
      'Review the terms of service, acceptable use policy, and guidelines for using the Link shortening platform.',
  },
}

export default async function TermsPage() {
  const page = await getCmsPageBySlug('terms')

  return (
    <CmsPageView
      page={
        page || {
          id: 3,
          title: 'Terms of Service',
          slug: 'terms',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
      defaultType='terms'
    />
  )
}
