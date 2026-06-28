import { getEmailLayout } from "./layout";

/**
 * Generates the HTML template for new secure chat message notifications.
 */
export function getNewMessageEmail(userName: string, senderName: string, contentPreview: string, chatLink: string): string {
  const title = "New Message on Seren";
  const body = `
    <h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700;">New Secure Message</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-top: 10px;">
      Hello ${userName}, you have received a new secure message from <strong>${senderName}</strong>:
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="padding: 16px; background-color: #27272a; border-left: 4px solid #C8962B; border-radius: 4px 12px 12px 4px; color: #e4e4e7; font-style: italic; font-size: 13.5px; line-height: 1.6;">
          "${contentPreview}"
        </td>
      </tr>
    </table>

    <div style="margin: 32px 0; text-align: center;">
      <a href="${chatLink}" style="background-color: #C8962B; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
        Reply in Thread
      </a>
    </div>
    
    <p style="font-size: 13px; line-height: 1.6; color: #71717a;">
      Note: To safeguard your privacy, please ensure you complete all communications inside the end-to-end encrypted Seren panel.
    </p>
  `;
  return getEmailLayout(title, body);
}
