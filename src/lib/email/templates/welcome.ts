import { getEmailLayout } from "./layout";

/**
 * Generates the welcome HTML template for new user accounts.
 */
export function getWelcomeEmail(userName: string): string {
  const title = "Welcome to Seren";
  const body = `
    <h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Welcome to Seren, ${userName}!</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-top: 10px;">
      We are honored to accompany you on your emotional wellness journey. Seren provides a private, secure space for mood tracking, teletherapy matchmaking, and confidential real-time dialogue with licensed professionals.
    </p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="http://localhost:3000/journal" style="background-color: #C8962B; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
        Begin Your Mood Journal
      </a>
    </div>
    <p style="font-size: 13px; line-height: 1.6; color: #71717a;">
      If you have any questions or require support setting up your matched sessions, feel free to reply directly to this email.
    </p>
  `;
  return getEmailLayout(title, body);
}
