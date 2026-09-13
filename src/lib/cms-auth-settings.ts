import { getPayload } from 'payload'
import config from '@/../payload.config'

export interface AuthSettings {
  allowRegistration: boolean
  enableEmailAuth: boolean
  enableGoogleAuth: boolean
  enableGithubAuth: boolean
  registrationDisabledMessage: string
}

export const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  allowRegistration: true,
  enableEmailAuth: true,
  enableGoogleAuth: true,
  enableGithubAuth: true,
  registrationDisabledMessage:
    'New user registrations are currently disabled by administrator.',
}

export async function getAuthSettings(): Promise<AuthSettings> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'settings',
    })

    const auth = (settings as any)?.auth

    return {
      allowRegistration:
        typeof auth?.allowRegistration === 'boolean'
          ? auth.allowRegistration
          : DEFAULT_AUTH_SETTINGS.allowRegistration,
      enableEmailAuth:
        typeof auth?.enableEmailAuth === 'boolean'
          ? auth.enableEmailAuth
          : DEFAULT_AUTH_SETTINGS.enableEmailAuth,
      enableGoogleAuth:
        typeof auth?.enableGoogleAuth === 'boolean'
          ? auth.enableGoogleAuth
          : DEFAULT_AUTH_SETTINGS.enableGoogleAuth,
      enableGithubAuth:
        typeof auth?.enableGithubAuth === 'boolean'
          ? auth.enableGithubAuth
          : DEFAULT_AUTH_SETTINGS.enableGithubAuth,
      registrationDisabledMessage:
        auth?.registrationDisabledMessage?.trim() ||
        DEFAULT_AUTH_SETTINGS.registrationDisabledMessage,
    }
  } catch (error) {
    console.warn('[Payload CMS] Error fetching auth settings:', error)
    return DEFAULT_AUTH_SETTINGS
  }
}
