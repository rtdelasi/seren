import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  console.warn("SMTP_USER and SMTP_PASS environment variables are missing. Mailer operating in mock console mode.");
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email. If SMTP settings are missing, prints mail contents to console.
 */
export async function sendMail({ to, subject, html }: SendMailOptions) {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Seren Platform" <${smtpUser}>`,
        to,
        subject,
        html,
      });
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error("Nodemailer sendMail failed:", error);
      throw error;
    }
  } else {
    // Mock fallbacks for offline testing
    console.log("\n=======================================================");
    console.log("               MOCK TRANSACTIONAL EMAIL                ");
    console.log("=======================================================");
    console.log(`Recipient: ${to}`);
    console.log(`Subject:   ${subject}`);
    console.log(`Content (Truncated):\n${html.replace(/<[^>]*>/g, " ").substring(0, 350)}...`);
    console.log("=======================================================\n");
    return { success: true, messageId: `mock-email-id-${Date.now()}` };
  }
}
