import { getEmailLayout } from "./layout";

/**
 * Generates the HTML template for scheduled teletherapy session reminders.
 */
export function getReminderEmail(
  userName: string,
  scheduledTimeStr: string,
  sessionLink: string,
  timeframeLabel: string // e.g. "1 hour" or "24 hours"
): string {
  const title = "Therapy Session Reminder";
  const body = `
    <h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Session Reminder (${timeframeLabel})</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-top: 10px;">
      Hello ${userName}, this is a reminder that your matched teletherapy session is scheduled to start in <strong>${timeframeLabel}</strong>.
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background-color: #27272a; border-radius: 12px; border: 1px solid #3f3f46;">
      <tr>
        <td style="padding: 20px; text-align: left;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #a1a1aa; font-weight: 700; tracking-widest: 0.05em;">Session Start Time</p>
          <p style="margin: 4px 0 0 0; font-size: 15px; color: #ffffff; font-weight: 750;">${scheduledTimeStr}</p>
        </td>
      </tr>
    </table>

    <div style="margin: 32px 0; text-align: center;">
      <a href="${sessionLink}" style="background-color: #0A7C72; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
        Join Video Consultation
      </a>
    </div>
    
    <p style="font-size: 13px; line-height: 1.6; color: #71717a;">
      * You will be allowed to connect to the secure HIPAA-compliant video session 5 minutes prior to the scheduled start time.
    </p>
  `;
  return getEmailLayout(title, body);
}
