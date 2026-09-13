import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCmsPageBySlug } from '@/lib/cms-pages'
import { CmsPageView } from '@/components/cms-page-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const page = await getCmsPageBySlug(slug)

  if (!page) {
    return {
      title: 'Page Not Found | Link',
    }
  }

  return {
    title: `${page.title} | Link`,
    description: page.hero?.subheading || `${page.title} on Link`,
    openGraph: {
      title: `${page.title} | Link`,
      description: page.hero?.subheading || `${page.title} on Link`,
    },
  }
}

export default async function DynamicCmsPage(props: PageProps) {
  const { slug } = await props.params
  const page = await getCmsPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return <CmsPageView page={page} />
}
