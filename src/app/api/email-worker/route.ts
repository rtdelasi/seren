import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

/**
 * GET and POST endpoint handlers to process scheduled email tasks.
 * Typically triggered by a cron job periodically (e.g. every minute).
 */
export async function GET(request: NextRequest) {
  return processJobs();
}

export async function POST(request: NextRequest) {
  return processJobs();
}

async function processJobs() {
  let jobs = [];

  // Query up to 10 pending email jobs whose schedules have arrived
  try {
    jobs = await prisma.emailJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: new Date() },
        attempts: { lt: 3 }, // Maximum of 3 delivery attempts
      },
      take: 10,
    });
  } catch (error) {
    console.error("Cron worker database query failed:", error);
    return NextResponse.json({ success: false, reason: "Database offline" }, { status: 500 });
  }

  const results = [];

  for (const job of jobs) {
    let skip = false;

    // Retrieve the User preferences in the database to verify opt-in/opt-out status
    try {
      const user = await prisma.user.findUnique({
        where: { email: job.to },
      });

      if (user) {
        const subjectLower = job.subject.toLowerCase();
        // Skip if user opted out of corresponding email types
        if (subjectLower.includes("welcome") && !user.emailWelcome) {
          skip = true;
        }
        if ((subjectLower.includes("reminder") || subjectLower.includes("session")) && !user.emailReminders) {
          skip = true;
        }
        if ((subjectLower.includes("message") || subjectLower.includes("chat")) && !user.emailMessages) {
          skip = true;
        }
      }
    } catch (e) {
      // If user lookup fails (e.g., db issues), proceed with sending to guarantee service delivery
    }

    if (skip) {
      try {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: "SKIPPED" },
        });
      } catch (e) {
        // Ignore DB update errors
      }
      results.push({ id: job.id, status: "SKIPPED", reason: "Opted out by user preferences" });
      continue;
    }

    const nextAttempts = job.attempts + 1;

    try {
      // Attempt to transmit the email
      await sendMail({
        to: job.to,
        subject: job.subject,
        html: job.html,
      });

      // Update task to SENT on success
      await prisma.emailJob.update({
        where: { id: job.id },
        data: {
          status: "SENT",
          attempts: nextAttempts,
          lastError: null,
        },
      });
      results.push({ id: job.id, status: "SENT" });
    } catch (error: any) {
      console.error(`Email job delivery failed on job ${job.id}:`, error);
      const limitReached = nextAttempts >= 3;

      // Update task attempts and check for retry thresholds
      try {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: {
            status: limitReached ? "FAILED" : "PENDING",
            attempts: nextAttempts,
            lastError: error.message || String(error),
          },
        });
      } catch (e) {
        // Ignore DB update errors
      }

      results.push({
        id: job.id,
        status: limitReached ? "FAILED" : "PENDING_RETRY",
        error: error.message || String(error),
      });
    }
  }

  return NextResponse.json({
    success: true,
    processed: jobs.length,
    results,
  });
}
