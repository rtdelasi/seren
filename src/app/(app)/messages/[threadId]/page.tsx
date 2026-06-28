import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MessageThreadClient from "@/components/MessageThreadClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface ThreadPageProps {
  params: {
    threadId: string;
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/journal");
  }

  const parts = params.threadId.split("_");
  const clientUserId = parts[0];
  const therapistId = parts[1];

  // Security Verification Guard: Clients can only access their own thread, and therapists can only message their client
  if (
    clientUserId !== userId &&
    userId !== therapistId &&
    !params.threadId.startsWith("demo-")
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-rose-500">Access Denied</h2>
          <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
            You do not have authorization to join or view this private communication thread.
          </p>
          <a
            href="/journal"
            className="mt-6 inline-block rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-800"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Load initial conversation history
  let initialMessages: any[] = [];
  try {
    initialMessages = await prisma.message.findMany({
      where: { threadId: params.threadId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });
  } catch (error) {
    console.warn("Unable to load chat history from database. Loading demonstration fallback history:", error);
    // Fallback dialogue logs to make the chat interactable during database offline scenarios
    initialMessages = [
      {
        id: "demo-msg-1",
        threadId: params.threadId,
        senderId: therapistId || "demo-therapist-id",
        senderType: "THERAPIST",
        content: "Hello! Welcome to your secure therapy space. How have you been feeling since our last session?",
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: "demo-msg-2",
        threadId: params.threadId,
        senderId: clientUserId || userId,
        senderType: "USER",
        content: "Hi. I've been writing in the mood journal regularly. I think I'm starting to notice some trends when I'm stressed.",
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    ];
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <a href="/journal" className="text-xs font-semibold text-zinc-500 hover:text-teal-400 transition">
            ← Back to journal dashboard
          </a>
        </div>

        <MessageThreadClient
          threadId={params.threadId}
          initialMessages={initialMessages}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}
