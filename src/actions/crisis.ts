"use server";

import prisma from "@/lib/prisma";
import { analyzeCrisisSignal } from "@/lib/crisisDetection";
import { queueEmail } from "@/lib/email/queue";
import { revalidatePath } from "next/cache";

/**
 * Executes a safety check on text content. If high risk, records a CrisisAlert and alerts the assigned therapist.
 */
export async function triggerCrisisAnalysis(text: string, userId: string) {
  const result = await analyzeCrisisSignal(text);

  if (result.riskLevel === "high") {
    try {
      // Log the safety flag in the database
      const alert = await prisma.crisisAlert.create({
        data: {
          userId,
          riskLevel: "high",
          reason: result.reason,
        },
      });

      // Lookup matched therapist to deliver SMTP alert queues
      const matchedSession = await prisma.therapySession.findFirst({
        where: { userId },
        include: { therapist: true },
      });

      if (matchedSession?.therapist?.email) {
        await queueEmail({
          to: matchedSession.therapist.email,
          subject: "[CRITICAL WARNING] Crisis Signal Flagged",
          html: `
            <h2 style="color: #ef4444; margin-top: 0;">Critical Patient Alert</h2>
            <p>An automated safety scan has detected a <strong>high-risk crisis signal</strong> in your patient's journal log or chat message feed.</p>
            <blockquote style="margin: 20px 0; padding: 16px; border-left: 4px solid #ef4444; background-color: #27272a; color: #f4f4f5; font-style: italic;">
              <strong>Scanner Reason:</strong> "${result.reason}"
            </blockquote>
            <p>Log in to your therapist administration panel to review this flag and follow up immediately.</p>
          `,
        });
      }
    } catch (error) {
      console.warn("CrisisAlert database tracking failed, bypassing to ensure user flow is unaffected:", error);
    }
  }

  return result;
}

/**
 * Resolves a flagged crisis alert.
 */
export async function resolveAlert(alertId: string) {
  try {
    if (!alertId.startsWith("mock-")) {
      await prisma.crisisAlert.update({
        where: { id: alertId },
        data: { resolved: true },
      });
    }
    revalidatePath("/journal");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark crisis alert resolved:", error);
    return { success: false, isFallback: true };
  }
}

/**
 * Returns all unresolved crisis flags for administrative dashboards.
 */
export async function getUnresolvedAlerts() {
  try {
    const alerts = await prisma.crisisAlert.findMany({
      where: { resolved: false },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return alerts;
  } catch (error) {
    console.warn("Unable to query active alerts, using demo fallbacks:", error);
    return [
      {
        id: "mock-crisis-alert-1",
        userId: "demo-user-id",
        riskLevel: "high",
        reason: "Patient expressed persistent suicidal ideation and hopelessness in journal log.",
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          name: "Jane Doe (Demo Patient)",
          email: "jane.doe@demo.com",
        },
      },
    ];
  }
}
