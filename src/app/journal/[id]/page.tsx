import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface JournalEntryDetailPageProps {
  params: {
    id: string;
  };
}

export default async function JournalEntryDetailPage({ params }: JournalEntryDetailPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/journal");
  }

  let entry = null;

  // Render mock fallbacks for demo logs to ensure compatibility
  if (params.id.startsWith("demo-journal-")) {
    const fallbacks: Record<string, any> = {
      "demo-journal-1": {
        id: "demo-journal-1",
        userId,
        content: "Had a great productive day at work today! Felt very satisfied with the progress we made on the new release.",
        sentiment: 0.8,
        reflection: "It's wonderful to see your hard work yielding visible results and boosting your spirits.",
        suggestion: "Take a moment to write down what specific task felt most rewarding to anchor this feeling.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      "demo-journal-2": {
        id: "demo-journal-2",
        userId,
        content: "Felt a bit overwhelmed in the afternoon by the sheer number of emails, but a short walk helped clear my head.",
        sentiment: 0.15,
        reflection: "Stepping away when things get hectic is a fantastic self-regulation tactic.",
        suggestion: "Keep up the practice of quick timeouts when you notice stress levels creeping up.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      "demo-journal-3": {
        id: "demo-journal-3",
        userId,
        content: "Really poor sleep last night, woke up with a headache and felt low energy all day.",
        sentiment: -0.6,
        reflection: "Sleep quality directly impacts our resilience and mood, validating why today felt extra difficult.",
        suggestion: "Focus on gentle self-care tonight: a warm tea, no screens before bed, and an early sleep time.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    };
    entry = fallbacks[params.id] || null;
  } else {
    try {
      entry = await prisma.journalEntry.findUnique({
        where: { id: params.id },
      });
    } catch (e) {
      console.error("Failed to query journal entry:", e);
    }
  }

  if (!entry) {
    notFound();
  }

  // Security Privacy Guard: Entries are private by default; must belong to the authenticated user only
  if (entry.userId !== userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-rose-500">Access Denied</h2>
          <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
            This journal entry is private and belongs to another user. You do not have permission to view it.
          </p>
          <a
            href="/journal"
            className="mt-6 inline-block rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-2.5 text-xs font-bold text-zinc-305 transition hover:bg-zinc-800"
          >
            Back to Journal Dashboard
          </a>
        </div>
      </div>
    );
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

  const label = getSentimentLabel(entry.sentiment);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <a href="/journal" className="text-xs font-semibold text-zinc-500 hover:text-teal-400 transition">
            ← Back to journal dashboard
          </a>
        </div>

        {/* Detailed Insights Card */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Logged on</span>
              <span className="text-sm font-bold text-zinc-300 mt-0.5">
                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Mood State</span>
              <span
                className={`text-[9px] px-2.5 py-0.5 mt-1.5 rounded-full font-bold border uppercase tracking-wider ${label.color}`}
              >
                {label.text} ({entry.sentiment.toFixed(2)})
              </span>
            </div>
          </div>

          {/* User Entry text */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Your Entry</span>
            <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">{entry.content}</p>
          </div>

          {/* AI reflection box */}
          <div
            className={`rounded-xl border p-5 bg-gradient-to-br from-zinc-900/10 to-zinc-950/30 ${
              entry.sentiment > 0.3 ? "border-emerald-500/10" : entry.sentiment < -0.3 ? "border-rose-500/10" : "border-zinc-800"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
              AI Emotional Reflection
            </span>
            <p className="text-sm leading-relaxed text-zinc-300">{entry.reflection}</p>
          </div>

          {/* AI suggestion box */}
          <div className="rounded-xl border border-teal-500/10 bg-teal-500/[0.02] p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block mb-2">
              Coping & Wellness Suggestion
            </span>
            <p className="text-sm leading-relaxed text-teal-200/90">{entry.suggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
