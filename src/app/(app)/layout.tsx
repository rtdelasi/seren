import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  let role: "client" | "therapist" = "client";
  let threadId: string | null = null;

  try {
    const therapistRecord = await prisma.therapist.findFirst({
      where: { email: session.user.email },
    });

    if (therapistRecord) {
      role = "therapist";
    } else {
      // Find dynamic thread relationship for user message paths
      const lastSession = await prisma.therapySession.findFirst({
        where: { userId: session.user.id },
        orderBy: { scheduledAt: "desc" },
      });
      if (lastSession) {
        threadId = `${session.user.id}_${lastSession.therapistId}`;
      }
    }
  } catch (dbError) {
    console.warn("App layout queries failed, falling back:", dbError);
    role = "client";
    threadId = `${session.user.id}_fallback-jenkins`;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
      {/* Header navbar */}
      <Navbar user={session.user} role={role} threadId={threadId} />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar role={role} threadId={threadId} />

        {/* Content canvas wrapper */}
        <main className="flex-1 overflow-y-auto bg-zinc-900/10">
          {children}
        </main>
      </div>
    </div>
  );
}
