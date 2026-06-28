import React from "react";

interface JournalEntry {
  id: string;
  content: string;
  sentiment: number;
  reflection: string;
  suggestion: string;
  createdAt: Date;
}

interface MoodStreakProps {
  entries: JournalEntry[];
}

export default function MoodStreak({ entries }: MoodStreakProps) {
  // 1. Calculate active mood streak
  const calculateStreak = (): number => {
    if (entries.length === 0) {
      return 0;
    }

    // Capture unique dates formatted as YYYY-MM-DD
    const uniqueDates = Array.from(
      new Set(
        entries.map((e) => {
          const d = new Date(e.createdAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")}`;
        })
      )
    )
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (latest first)

    if (uniqueDates.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const latestDate = uniqueDates[0];
    latestDate.setHours(0, 0, 0, 0);

    // If the latest entry date is neither today nor yesterday, the streak is broken
    if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 1;
    let currentDate = latestDate;

    for (let i = 1; i < uniqueDates.length; i++) {
      const nextDate = uniqueDates[i];
      nextDate.setHours(0, 0, 0, 0);

      // Check if nextDate is exactly 1 day before currentDate
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = nextDate;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }

    return streak;
  };

  const streak = calculateStreak();
  const latestEntry = entries[0] || null;

  const getSentimentDetails = (sentiment: number) => {
    if (sentiment > 0.3) {
      return { label: "Positive", color: "bg-teal-950/40 text-teal-300 border-teal-900/50" };
    }
    if (sentiment >= -0.3) {
      return { label: "Neutral", color: "bg-amber-950/40 text-amber-300 border-amber-900/50" };
    }
    return { label: "Low", color: "bg-rose-950/40 text-rose-300 border-rose-900/50" };
  };

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Streak Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <h2 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Mood Logging Streak</h2>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Consecutive calendar days logged</p>
          </div>
        </div>
        <div className="text-2xl font-black text-white bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-1.5 self-start sm:self-auto shadow-inner">
          {streak} {streak === 1 ? "Day" : "Days"}
        </div>
      </div>

      {/* Message and Last Entry Preview */}
      <div className="space-y-4">
        <p className="text-xs text-zinc-400 leading-relaxed">
          {streak === 0
            ? "No active streak. Write your first journal entry today to kick off your wellness journey!"
            : "Keep up the reflective habit! Recording your daily thoughts builds long-term self-awareness and emotional resilience."}
        </p>

        {latestEntry ? (
          <div className="space-y-3 bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500">
                LAST LOGGED: {new Date(latestEntry.createdAt).toLocaleDateString()}
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                  getSentimentDetails(latestEntry.sentiment).color
                }`}
              >
                {getSentimentDetails(latestEntry.sentiment).label}
              </span>
            </div>

            <p className="text-xs text-zinc-200 italic line-clamp-2 leading-relaxed">
              "{latestEntry.content}"
            </p>

            {latestEntry.reflection && (
              <div className="border-t border-zinc-900/50 pt-2.5 space-y-1">
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-wider">AI Reflection</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{latestEntry.reflection}</p>
              </div>
            )}
            
            {latestEntry.suggestion && (
              <div className="border-t border-zinc-900/50 pt-2.5 space-y-1">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Coping Suggestion</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{latestEntry.suggestion}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-900 p-6 text-center text-xs text-zinc-500">
            No logged notes yet. Log your first journal thought to start charting mood patterns.
          </div>
        )}
      </div>

      <a
        href="/journal"
        className="block text-center text-xs font-black text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950 px-4 py-2.5 rounded-xl transition"
      >
        Open Mood Journal
      </a>
    </div>
  );
}
