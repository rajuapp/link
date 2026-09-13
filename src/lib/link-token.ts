import crypto from 'crypto'

export function getLinkUnlockToken(
  domain: string,
  passwordHash: string
): string {
  const secret =
    process.env.NEXTAUTH_SECRET || 'link-default-secret-key-32chars'
  return crypto
    .createHmac('sha256', secret)
    .update(`${domain}:${passwordHash}`)
    .digest('hex')
}
