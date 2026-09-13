import { db } from '../src/lib/db'

async function main() {
  await db.$executeRawUnsafe(
    `DELETE FROM payload.settings_footer_links WHERE _parent_id = 1;`
  )

  const links = [
    { order: 1, id: 'link-home', label: 'Home', url: '/', newTab: false },
    { order: 2, id: 'link-blog', label: 'Blog', url: '/blog', newTab: false },
    {
      order: 3,
      id: 'link-dashboard',
      label: 'Dashboard',
      url: '/dashboard',
      newTab: false,
    },
    {
      order: 4,
      id: 'link-privacy',
      label: 'Privacy Policy',
      url: '/privacy',
      newTab: false,
    },
    {
      order: 5,
      id: 'link-terms',
      label: 'Terms of Service',
      url: '/terms',
      newTab: false,
    },
    {
      order: 6,
      id: 'link-github',
      label: 'GitHub',
      url: 'https://github.com/rajuapp/link',
      newTab: true,
    },
  ]

  for (const l of links) {
    await db.$executeRawUnsafe(
      `INSERT INTO payload.settings_footer_links ("_order", "_parent_id", "id", "label", "url", "new_tab")
       VALUES ($1, 1, $2, $3, $4, $5);`,
      l.order,
      l.id,
      l.label,
      l.url,
      l.newTab
    )
  }

  const rows: any[] = await db.$queryRawUnsafe(
    `SELECT * FROM payload.settings_footer_links ORDER BY "_order" ASC;`
  )
  console.log('Updated footer links in DB:', rows)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error updating footer links:', err)
    process.exit(1)
  })
