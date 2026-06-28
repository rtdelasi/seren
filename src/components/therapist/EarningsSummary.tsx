import React from "react";

interface EarningsSummaryProps {
  pricePerSession: number;
  completedSessionsCount: number;
  weeklyCompletedCount: number;
}

export default function EarningsSummary({
  pricePerSession,
  completedSessionsCount,
  weeklyCompletedCount,
}: EarningsSummaryProps) {
  const weeklyEarnings = weeklyCompletedCount * pricePerSession;
  const lifetimeEarnings = completedSessionsCount * pricePerSession;

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
        <span className="text-xl">💰</span>
        <div>
          <h2 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Earnings Summary</h2>
          <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Calculated based on completed sessions</p>
        </div>
      </div>

      {/* Grid containing Weekly vs Lifetime */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Weekly Earnings */}
        <div className="rounded-xl border border-amber-500/10 bg-amber-950/5 p-4 space-y-2">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Weekly Revenue</span>
          <p className="text-2xl font-black text-white">${weeklyEarnings.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-400 font-medium">
            {weeklyCompletedCount} completed {weeklyCompletedCount === 1 ? "session" : "sessions"} this week
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-4 space-y-2">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Lifetime Revenue</span>
          <p className="text-2xl font-black text-white">${lifetimeEarnings.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-400 font-medium">
            {completedSessionsCount} total completed {completedSessionsCount === 1 ? "session" : "sessions"}
          </p>
        </div>
      </div>

      {/* Pricing Stats Footer */}
      <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-3.5 text-xs">
        <span className="text-zinc-400 font-medium">Your Base Session Rate:</span>
        <span className="font-black text-teal-400">${pricePerSession} / session</span>
      </div>
    </div>
  );
}
