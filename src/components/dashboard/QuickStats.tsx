import React from "react";

interface QuickStatsProps {
  unreadMessagesCount: number;
  savedResourcesCount: number;
  averageSentiment: number;
  threadId: string | null;
}

export default function QuickStats({
  unreadMessagesCount,
  savedResourcesCount,
  averageSentiment,
  threadId,
}: QuickStatsProps) {
  const getSentimentLabel = (score: number) => {
    if (score > 0.3) {
      return { label: "Positive", color: "text-teal-400 border-teal-900 bg-teal-950/20" };
    }
    if (score >= -0.3) {
      return { label: "Neutral", color: "text-amber-400 border-amber-900 bg-amber-950/20" };
    }
    return { label: "Low Mood", color: "text-rose-400 border-rose-900 bg-rose-950/20" };
  };

  const sentiment = getSentimentLabel(averageSentiment);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Messages Stat */}
      <a
        href={threadId ? `/messages/${threadId}` : "/journal"}
        className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-zinc-800 transition group h-[130px]"
      >
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Unread Chats</span>
          <p className="text-2xl font-black text-white">{unreadMessagesCount}</p>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-teal-400 font-bold transition">
          <span>Go to chat thread</span>
          <span>→</span>
        </div>
      </a>

      {/* Favorites Stat */}
      <a
        href="/resources"
        className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-zinc-800 transition group h-[130px]"
      >
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Favorites Saved</span>
          <p className="text-2xl font-black text-white">{savedResourcesCount}</p>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-teal-400 font-bold transition">
          <span>Browse resource library</span>
          <span>→</span>
        </div>
      </a>

      {/* Mood Baseline Stat */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-[130px]">
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Emotional Baseline</span>
          <div className="pt-1.5">
            <span
              className={`inline-block text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${sentiment.color}`}
            >
              {sentiment.label}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
          Calculated average of recent log scores
        </div>
      </div>
    </div>
  );
}
