import React from "react";

export default function MatchingResultsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Loading Header */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-6 w-32 bg-zinc-900 rounded-full mx-auto" />
          <div className="mt-4 h-10 w-64 bg-zinc-900 rounded-xl mx-auto" />
          <div className="mt-2 h-4 w-80 bg-zinc-900 rounded-md mx-auto" />
        </div>

        {/* List of loading skeleton cards */}
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 animate-pulse"
            >
              {/* Header profile section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-zinc-900 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-zinc-900 rounded-md" />
                    <div className="h-3.5 w-24 bg-zinc-900 rounded-md" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-zinc-900 rounded-full" />
              </div>

              {/* Tags block */}
              <div className="mt-5 flex gap-2">
                <div className="h-6 w-16 bg-zinc-900 rounded-md" />
                <div className="h-6 w-24 bg-zinc-900 rounded-md" />
                <div className="h-6 w-20 bg-zinc-900 rounded-md" />
              </div>

              {/* Text description block */}
              <div className="mt-5 space-y-2">
                <div className="h-4 w-full bg-zinc-900 rounded-md" />
                <div className="h-4 w-11/12 bg-zinc-900 rounded-md" />
              </div>

              {/* AI Insights block */}
              <div className="mt-5 h-20 w-full bg-zinc-900/30 border border-zinc-900 rounded-xl" />

              {/* Footer pricing section */}
              <div className="mt-6 border-t border-zinc-905 pt-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-zinc-900 rounded" />
                  <div className="h-5 w-24 bg-zinc-900 rounded-md" />
                </div>
                <div className="h-9 w-28 bg-zinc-900 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
