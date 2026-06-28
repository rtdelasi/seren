import React from "react";

interface Therapist {
  name: string;
  image: string | null;
}

interface TherapySession {
  id: string;
  scheduledAt: Date;
  duration: number;
  status: string;
  therapist: Therapist;
}

interface UpcomingSessionProps {
  session: TherapySession | null;
}

export default function UpcomingSession({ session }: UpcomingSessionProps) {
  if (!session) {
    return (
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full min-h-[190px]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <h2 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Video Session</h2>
          </div>
          <h3 className="text-base font-bold text-zinc-200 mt-3">No Sessions Scheduled</h3>
          <p className="text-xs leading-relaxed text-zinc-400">
            Keep your momentum going. Connect with a professional to organize a personalized checking log.
          </p>
        </div>

        <a
          href="/match"
          className="mt-5 inline-block text-center text-xs font-black text-zinc-950 bg-teal-500 hover:bg-teal-400 px-4 py-2.5 rounded-xl shadow transition"
        >
          Match with a Therapist
        </a>
      </div>
    );
  }

  const formattedDate = new Date(session.scheduledAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const formattedTime = new Date(session.scheduledAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full min-h-[190px] transition hover:border-zinc-805">
      <div className="space-y-4">
        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h2 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Upcoming Session</h2>
          </div>
          <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950/30 border border-teal-900/50 px-2 py-0.5 rounded">
            {session.status}
          </span>
        </div>

        {/* Date / Time */}
        <div className="space-y-1">
          <p className="text-lg font-black text-white">{formattedDate}</p>
          <p className="text-xs font-medium text-zinc-400">
            {formattedTime} ({session.duration} minutes)
          </p>
        </div>

        {/* Therapist Meta */}
        <div className="flex items-center gap-3 bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-3">
          {session.therapist.image ? (
            <img
              src={session.therapist.image}
              alt={session.therapist.name}
              className="h-9 w-9 rounded-full object-cover border border-zinc-800"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-400">
              {session.therapist.name.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-200">{session.therapist.name}</span>
            <span className="text-[10px] text-zinc-500 font-semibold">Assigned Care Therapist</span>
          </div>
        </div>
      </div>

      <a
        href={`/session/${session.id}`}
        className="mt-6 block text-center text-xs font-black text-zinc-950 bg-teal-500 hover:bg-teal-400 px-5 py-3 rounded-xl shadow transition"
      >
        Join Video Consultation
      </a>
    </div>
  );
}
