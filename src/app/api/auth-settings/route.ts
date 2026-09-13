import { NextResponse } from 'next/server'
import { getAuthSettings } from '@/lib/cms-auth-settings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const settings = await getAuthSettings()
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
  } catch (error) {
    console.error('[API] Error in auth-settings route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auth settings' },
      { status: 500 }
    )
  }
}
