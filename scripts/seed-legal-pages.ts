import { PrismaClient } from '@prisma/client'
import { privacyContent, termsContent } from '../src/lib/legal-content'

const prisma = new PrismaClient()

async function seed() {
  console.log('Seeding Privacy Policy page...')
  await prisma.$executeRawUnsafe(
    `INSERT INTO payload.pages (
      title, slug, content, 
      hero_heading, hero_subheading, hero_badge_text, hero_badge_url,
      hero_primary_button_text, hero_primary_button_url,
      metrics_section_show_metrics, features_section_show_features,
      created_at, updated_at
    )
    VALUES (
      $1::text, $2::text, $3::jsonb,
      $4::text, $5::text, $6::text, $7::text,
      $8::text, $9::text,
      false, false,
      NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      hero_heading = EXCLUDED.hero_heading,
      hero_subheading = EXCLUDED.hero_subheading,
      metrics_section_show_metrics = false,
      features_section_show_features = false,
      updated_at = NOW();`,
    'Privacy Policy',
    'privacy',
    JSON.stringify(privacyContent),
    'Privacy Policy',
    'Learn how Link collects, protects, and manages your data when you use our link shortening services.',
    'Legal & Transparency',
    '/privacy',
    'Back to Home',
    '/'
  )

  console.log('Seeding Terms of Service page...')
  await prisma.$executeRawUnsafe(
    `INSERT INTO payload.pages (
      title, slug, content, 
      hero_heading, hero_subheading, hero_badge_text, hero_badge_url,
      hero_primary_button_text, hero_primary_button_url,
      metrics_section_show_metrics, features_section_show_features,
      created_at, updated_at
    )
    VALUES (
      $1::text, $2::text, $3::jsonb,
      $4::text, $5::text, $6::text, $7::text,
      $8::text, $9::text,
      false, false,
      NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      hero_heading = EXCLUDED.hero_heading,
      hero_subheading = EXCLUDED.hero_subheading,
      metrics_section_show_metrics = false,
      features_section_show_features = false,
      updated_at = NOW();`,
    'Terms of Service',
    'terms',
    JSON.stringify(termsContent),
    'Terms of Service',
    'Please read these Terms of Service carefully before creating links or using the Link platform.',
    'Terms & Agreements',
    '/terms',
    'Back to Home',
    '/'
  )

  console.log('Successfully seeded legal pages in payload.pages!')
}

seed()
  .catch((e) => {
    console.error('Error seeding legal pages:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
