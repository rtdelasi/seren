import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { joinSession, endSession } from "@/actions/sessions";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

// Lazy-load JitsiRoom component to isolate client-side-only Jitsi scripts from SSR
const JitsiRoom = nextDynamic(() => import("@/components/JitsiRoom"), { ssr: false });

interface SessionPageProps {
  params: {
    id: string;
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-zinc-200">Authentication Required</h2>
          <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
            Please sign in to join your secure scheduled therapy session.
          </p>
          <a
            href="/api/auth/signin"
            className="mt-6 inline-block w-full rounded-xl bg-teal-500 px-6 py-3 text-xs font-black text-zinc-950 transition hover:bg-teal-400"
          >
            Sign In to Seren
          </a>
        </div>
      </div>
    );
  }

  const joinResult = await joinSession(params.id);
  const userName = session.user.name || "Client Participant";

  if (!joinResult.allowed) {
    let title = "Unable to Join Session";
    let message = "You cannot join this video call at this time.";

    if (joinResult.reason === "TOO_EARLY") {
      title = "Too Early to Join";
      const minutesLeft = joinResult.minutesLeft;
      const timeStr = new Date(joinResult.scheduledAt!).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      message = `This session is scheduled for ${timeStr}. You can join up to 5 minutes before the start time. (Remaining time: ~${minutesLeft} minutes).`;
    } else if (joinResult.reason === "EXPIRED") {
      title = "Session Expired";
      message = "This video session's scheduled duration has already expired.";
    } else if (joinResult.reason === "COMPLETED") {
      title = "Session Completed";
      message = "This therapy session has already been marked as completed.";
    } else if (joinResult.reason === "UNAUTHORIZED") {
      title = "Access Denied";
      message = "You do not have permission to access this private video room.";
    } else if (joinResult.reason === "NOT_FOUND") {
      title = "Session Not Found";
      message = "The requested session ID does not exist in our systems.";
    }

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-400 mb-4">
            🔒
          </div>
          <h2 className="text-xl font-bold text-zinc-200">{title}</h2>
          <p className="text-zinc-500 mt-2 text-sm leading-relaxed">{message}</p>
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

  // End Session Action
  const handleEndSession = async () => {
    "use server";
    await endSession(params.id);
    redirect("/journal");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col gap-6">
        {/* Room Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-4 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
              Encrypted Meeting Room
            </span>
            <h1 className="mt-3 text-2xl font-black text-white tracking-tight">Active Teletherapy Session</h1>
            <p className="text-xs text-zinc-500 mt-0.5">HIPAA-compliant end-to-end encrypted connection</p>
          </div>

          <form action={handleEndSession}>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-rose-500/10 border border-rose-500/20 px-5 py-2.5 text-xs font-extrabold text-rose-400 transition hover:bg-rose-500 hover:text-zinc-950 shadow-md"
            >
              Terminate Session
            </button>
          </form>
        </div>

        {/* Video Embedding Frame */}
        <div className="flex-1 flex flex-col justify-center">
          <JitsiRoom roomName={joinResult.roomName!} userName={userName} userEmail={session.user.email || ""} onClose={handleEndSession} />
        </div>
      </div>
    </div>
  );
}
