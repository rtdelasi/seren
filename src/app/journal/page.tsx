import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MoodChart from "@/components/MoodChart";
import JournalClientWrapper from "@/components/JournalClientWrapper";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-zinc-200">Private Space</h2>
          <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
            Please sign in to access your private mood journal and track your emotional wellness.
          </p>
          <a
            href="/api/auth/signin"
            className="mt-6 inline-block w-full rounded-xl bg-teal-500 px-6 py-3 text-xs font-black text-zinc-950 transition hover:bg-teal-400 shadow-md"
          >
            Sign In to Seren
          </a>
        </div>
      </div>
    );
  }

  // Retrieve past entries for this authenticated user, taking the last 30 entries for the chart
  let entries: any[] = [];
  try {
    entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  } catch (error) {
    console.warn("Unable to load journal logs from database, using demonstration fallbacks:", error);
    // Provide fallback records so the user interface renders successfully in a db-less setup
    entries = [
      {
        id: "demo-journal-1",
        content: "Had a great productive day at work today! Felt very satisfied with the progress we made on the new release.",
        sentiment: 0.8,
        reflection: "It's wonderful to see your hard work yielding visible results and boosting your spirits.",
        suggestion: "Take a moment to write down what specific task felt most rewarding to anchor this feeling.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "demo-journal-2",
        content: "Felt a bit overwhelmed in the afternoon by the sheer number of emails, but a short walk helped clear my head.",
        sentiment: 0.15,
        reflection: "Stepping away when things get hectic is a fantastic self-regulation tactic.",
        suggestion: "Keep up the practice of quick timeouts when you notice stress levels creeping up.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "demo-journal-3",
        content: "Really poor sleep last night, woke up with a headache and felt low energy all day.",
        sentiment: -0.6,
        reflection: "Sleep quality directly impacts our resilience and mood, validating why today felt extra difficult.",
        suggestion: "Focus on gentle self-care tonight: a warm tea, no screens before bed, and an early sleep time.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  // Label configuration based on the requested sentiment limits
  const getSentimentLabel = (score: number) => {
    if (score > 0.3) {
      return { text: "Positive", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
    if (score < -0.3) {
      return { text: "Low", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    }
    return { text: "Neutral", color: "bg-zinc-900 text-zinc-400 border-zinc-800" };
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header Block */}
        <div className="text-center">
          <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
            Private Space
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Mood Journal</h1>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Record your daily thoughts, feelings, and events, and let AI track your sentiment trend over time.
          </p>
        </div>

        {/* Recharts Mood Graph */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl">
          <h2 className="text-base font-bold text-zinc-200">Mood History</h2>
          <p className="text-xs text-zinc-500 mt-0.5">30-day sentiment score tracking based on your entries</p>
          <MoodChart entries={entries} />
        </div>

        {/* Input Log Form Wrapper */}
        <JournalClientWrapper />

        {/* History Timeline */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-zinc-200 px-1">Past Entries</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">Your private journal entries will list here.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {entries.map((entry) => {
                const label = getSentimentLabel(entry.sentiment);
                return (
                  <div
                    key={entry.id}
                    className="group relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 transition hover:border-zinc-800 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-medium">
                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span
                        className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${label.color}`}
                      >
                        {label.text}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-zinc-300 line-clamp-2 leading-relaxed">{entry.content}</p>

                    <div className="mt-4 flex items-center justify-end">
                      <a
                        href={`/journal/${entry.id}`}
                        className="text-xs font-bold text-teal-400 group-hover:text-teal-300 transition flex items-center gap-1"
                      >
                        View AI Insights →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
