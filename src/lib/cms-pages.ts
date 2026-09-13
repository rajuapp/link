import { getPayload } from 'payload'
import config from '@payload-config'
import type { Page } from '@/../payload-types'
import { privacyContent, termsContent } from '@/lib/legal-content'

export async function getCmsPageBySlug(slug: string): Promise<Page | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    if (result.docs && result.docs.length > 0) {
      return result.docs[0] as Page
    }
  } catch (error) {
    console.warn(`[Payload CMS] Failed to fetch page "${slug}":`, error)
  }

  // Fallback defaults if not found in database yet
  if (slug === 'privacy' || slug === 'privacy-policy') {
    return {
      id: 2,
      title: 'Privacy Policy',
      slug: 'privacy',
      hero: {
        heading: 'Privacy Policy',
        subheading:
          'Learn how Link collects, protects, and manages your data when you use our link shortening services.',
        badgeText: 'Legal & Transparency',
      },
      content: privacyContent as any,
      createdAt: '2026-09-13T00:00:00.000Z',
      updatedAt: '2026-09-13T00:00:00.000Z',
    }
  }

  if (slug === 'terms' || slug === 'terms-of-service') {
    return {
      id: 3,
      title: 'Terms of Service',
      slug: 'terms',
      hero: {
        heading: 'Terms of Service',
        subheading:
          'Please read these Terms of Service carefully before creating links or using the Link platform.',
        badgeText: 'Terms & Agreements',
      },
      content: termsContent as any,
      createdAt: '2026-09-13T00:00:00.000Z',
      updatedAt: '2026-09-13T00:00:00.000Z',
    }
  }

  return null
}
