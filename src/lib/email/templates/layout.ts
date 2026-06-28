/**
 * Wrap email bodies with a consistent HTML layout matching the Seren brand system.
 * Uses inline styling only for HTML email client compatibility.
 */
export function getEmailLayout(title: string, bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;">
          <!-- Brand Header Banner -->
          <tr>
            <td style="padding: 32px; text-align: center; background-color: #0A7C72;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase;">SEREN</h1>
              <p style="margin: 4px 0 0 0; color: #b2f1ec; font-size: 11px; font-weight: 500; tracking-widest: 0.1em; uppercase">Your space for emotional clarity</p>
            </td>
          </tr>
          <!-- Body Content Container -->
          <tr>
            <td style="padding: 40px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer Details -->
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #27272a; background-color: #0c0c0e;">
              <p style="margin: 0; font-size: 10px; color: #52525b; line-height: 1.6;">
                Seren Teletherapy & journaling platforms. All rights reserved.<br>
                You received this transactional service note because you are a registered member.
                To change your subscription settings, log in and manage your Account preferences.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
