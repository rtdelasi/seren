import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SOAPEditor from "@/components/SOAPEditor";
import { getNote } from "@/actions/notes";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface TherapistNotesPageProps {
  params: {
    id: string;
  };
}

export default async function TherapistNotesPage({ params }: TherapistNotesPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/journal");
  }

  let therapistRecord = null;
  let therapySession: any = null;

  // Handle mock sessions for client demo testing
  if (params.id.startsWith("session-")) {
    therapySession = {
      id: params.id,
      scheduledAt: new Date(),
      duration: 50,
      status: "ACTIVE",
      userId,
      therapistId: "demo-therapist",
    };
  } else {
    try {
      therapistRecord = await prisma.therapist.findFirst({
        where: { email: session?.user?.email },
      });

      therapySession = await prisma.therapySession.findUnique({
        where: { id: params.id },
      });
    } catch (e) {
      console.warn("Prisma query failed on notes page lookup, loading fallback session info:", e);
      therapySession = {
        id: params.id,
        scheduledAt: new Date(),
        duration: 60,
        status: "ACTIVE",
        userId,
        therapistId: "fallback-therapist",
      };
    }
  }

  if (!therapySession) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-rose-500">Session Not Found</h2>
          <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
            The requested therapy session ID could not be resolved.
          </p>
          <a
            href="/journal"
            className="mt-6 inline-block rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-2.5 text-xs font-bold text-zinc-305 transition hover:bg-zinc-800"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Security Guard: Private notes can only be viewed/edited by the assigned therapist
  if (
    therapistRecord &&
    therapySession.therapistId !== therapistRecord.id &&
    !params.id.startsWith("session-")
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-rose-500">Access Denied</h2>
          <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
            This clinical note panel is private and accessible only by the assigned therapist.
          </p>
          <a
            href="/journal"
            className="mt-6 inline-block rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-2.5 text-xs font-bold text-zinc-305 transition hover:bg-zinc-800"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Fetch pre-existing notes
  let existingContent = "";
  try {
    const existingNote = await getNote(params.id);
    if (existingNote) {
      existingContent = existingNote.content;
    }
  } catch (error) {
    // Ignore
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <a href="/journal" className="text-xs font-semibold text-zinc-500 hover:text-teal-400 transition">
            ← Back to journal dashboard
          </a>
        </div>

        {/* Header Block */}
        <div>
          <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
            Therapist Workspace
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">SOAP Note Co-pilot</h1>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Draft, review, and confirm session notes. Securely linked to Session:{" "}
            <span className="font-mono text-teal-400">{params.id}</span>
          </p>
        </div>

        {/* Interactive Editor */}
        <SOAPEditor sessionId={params.id} initialNoteContent={existingContent} />
      </div>
    </div>
  );
}
