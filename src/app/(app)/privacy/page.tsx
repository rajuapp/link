import type { Metadata } from 'next'
import { getCmsPageBySlug } from '@/lib/cms-pages'
import { CmsPageView } from '@/components/cms-page-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Privacy Policy | Link',
  description:
    'Learn how Link collects, protects, and manages your personal data and link redirects.',
  openGraph: {
    title: 'Privacy Policy | Link',
    description:
      'Learn how Link collects, protects, and manages your personal data and link redirects.',
  },
}

export default async function PrivacyPage() {
  const page = await getCmsPageBySlug('privacy')

  return (
    <CmsPageView
      page={
        page || {
          id: 2,
          title: 'Privacy Policy',
          slug: 'privacy',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
      defaultType='privacy'
    />
  )
}
