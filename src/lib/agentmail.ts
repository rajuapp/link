export interface SendAgentMailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendAgentMail({
  to,
  subject,
  text,
  html,
}: SendAgentMailOptions): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  const apiKey =
    process.env.AGENTMAIL_API_KEY ||
    'am_us_inbox_84833b2e786766cdc9340806e5eafce263394c6428f1b09aaa30b4c7f97e021a'
  const inboxId = process.env.AGENTMAIL_INBOX || 'rajuapp@agentmail.to'

  if (!apiKey) {
    console.error('[AgentMail] Missing AGENTMAIL_API_KEY')
    return { success: false, error: 'AgentMail API key missing' }
  }

  try {
    const endpoint = `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inboxId)}/messages/send`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        html,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[AgentMail] Send error response:', res.status, errText)
      return { success: false, error: errText || `HTTP ${res.status}` }
    }

    const data = await res.json()
    return { success: true, messageId: data.message_id }
  } catch (error) {
    console.error('[AgentMail] Network error sending email:', error)
    return { success: false, error: (error as Error).message }
  }
}

export interface VerificationEmailProps {
  email: string
  name?: string
  code: string
  token: string
  baseUrl?: string
}

export async function sendVerificationEmail({
  email,
  name,
  code,
  token,
  baseUrl = process.env.NEXT_PUBLIC_URL || 'https://link.raju.app',
}: VerificationEmailProps) {
  const verificationUrl = `${baseUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  const displayName = name ? name.trim() : 'there'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your Link account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container matching Login Page w-[90vw] max-w-[400px] -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 400px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Card Header matching Login Header & Logo -->
          <tr>
            <td style="padding: 32px 28px 20px 28px; text-align: center;">
              <!-- Link Logo matching src/assets/icons/logo.tsx -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center">
                    <img src="https://link.raju.app/apple-touch-icon.png" width="38" height="38" alt="Link" style="display: block; width: 38px; height: 38px; border-radius: 8px; background-color: #262424; color: #ffffff; font-size: 12px; font-weight: 700; line-height: 38px; text-align: center; border: 0; outline: none; margin: 0 auto;" />
                  </td>
                </tr>
              </table>

              <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: #18181b;">
                Verify Your Email
              </h1>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a;">
                Hi ${displayName}, enter the 6-digit code or click the button below to activate your account.
              </p>
            </td>
          </tr>

          <!-- Card Content -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- 6-Digit OTP Box styled like Input -->
              <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 18px 12px; text-align: center; margin-bottom: 20px;">
                <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; margin-bottom: 6px;">
                  Verification Code
                </span>
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #18181b; display: inline-block;">
                  ${code}
                </span>
              </div>

              <!-- Centered Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #18181b;">
                          <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 32px; border-radius: 6px; text-align: center; border: 1px solid #18181b; min-width: 180px; box-sizing: border-box;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider matching Login Page Separator -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr>
                  <td style="border-top: 1px solid #e4e4e7; text-align: center; height: 1px;">
                  </td>
                </tr>
              </table>

              <!-- Direct link note -->
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717a; text-align: center;">
                Or open this link directly:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; line-height: 1.4; text-align: center; word-break: break-all;">
                <a href="${verificationUrl}" target="_blank" style="color: #18181b; text-decoration: underline;">
                  ${verificationUrl}
                </a>
              </p>

              <!-- Footer note -->
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                This code and link will expire in 24 hours. If you did not create an account with Link, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Subtle Bottom Footer -->
          <tr>
            <td style="padding: 14px 28px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} Link. Quick and Easy URL Shortening.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
Hi ${displayName},

Verify your Link account.

Your 6-digit verification code is: ${code}

Or verify directly by opening this link:
${verificationUrl}

This code and link expire in 24 hours. If you didn't create an account, you can ignore this email.
`

  return sendAgentMail({
    to: email,
    subject: `Verify your Link account (${code})`,
    text,
    html,
  })
}

export interface PasswordResetEmailProps {
  email: string
  name?: string
  code: string
  token: string
  baseUrl?: string
}

export async function sendPasswordResetEmail({
  email,
  name,
  code,
  token,
  baseUrl = process.env.NEXT_PUBLIC_URL || 'https://link.raju.app',
}: PasswordResetEmailProps) {
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  const displayName = name ? name.trim() : 'there'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Link password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container matching Login Page w-[90vw] max-w-[400px] -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 400px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Card Header matching Login Header & Logo -->
          <tr>
            <td style="padding: 32px 28px 20px 28px; text-align: center;">
              <!-- Link Logo matching src/assets/icons/logo.tsx -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center">
                    <img src="https://link.raju.app/apple-touch-icon.png" width="38" height="38" alt="Link" style="display: block; width: 38px; height: 38px; border-radius: 8px; background-color: #262424; color: #ffffff; font-size: 12px; font-weight: 700; line-height: 38px; text-align: center; border: 0; outline: none; margin: 0 auto;" />
                  </td>
                </tr>
              </table>

              <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: #18181b;">
                Reset Your Password
              </h1>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a;">
                Hi ${displayName}, enter the 6-digit code or click the button below to choose a new password.
              </p>
            </td>
          </tr>

          <!-- Card Content -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- 6-Digit OTP Box styled like Input -->
              <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 18px 12px; text-align: center; margin-bottom: 20px;">
                <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; margin-bottom: 6px;">
                  Password Reset Code
                </span>
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #18181b; display: inline-block;">
                  ${code}
                </span>
              </div>

              <!-- Centered Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #18181b;">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 32px; border-radius: 6px; text-align: center; border: 1px solid #18181b; min-width: 180px; box-sizing: border-box;">
                            Choose New Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider matching Login Page Separator -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr>
                  <td style="border-top: 1px solid #e4e4e7; text-align: center; height: 1px;">
                  </td>
                </tr>
              </table>

              <!-- Direct link note -->
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717a; text-align: center;">
                Or open this link directly:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; line-height: 1.4; text-align: center; word-break: break-all;">
                <a href="${resetUrl}" target="_blank" style="color: #18181b; text-decoration: underline;">
                  ${resetUrl}
                </a>
              </p>

              <!-- Footer note -->
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                This code and link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Subtle Bottom Footer -->
          <tr>
            <td style="padding: 14px 28px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} Link. Quick and Easy URL Shortening.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
Hi ${displayName},

Reset your Link password.

Your 6-digit reset code is: ${code}

Or reset directly by opening this link:
${resetUrl}

This code and link expire in 1 hour. If you didn't request a password reset, you can ignore this email.
`

  return sendAgentMail({
    to: email,
    subject: `Reset your Link password (${code})`,
    text,
    html,
  })
}
