"use client";

import React, { useState, useTransition } from "react";
import { createJournalEntry } from "@/actions/journal";
import { triggerCrisisAnalysis } from "@/actions/crisis";

interface JournalEntryFormProps {
  onCrisisDetected?: (riskLevel: "none" | "low" | "medium" | "high") => void;
}

export default function JournalEntryForm({ onCrisisDetected }: JournalEntryFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const res = await createJournalEntry(content);
        if (res.success) {
          const contentSnapshot = content;
          setContent("");

          // Run crisis scanner asynchronously in the background (post-send, non-blocking)
          if (res.data && res.data.userId) {
            triggerCrisisAnalysis(contentSnapshot, res.data.userId)
              .then((crisisRes) => {
                if (crisisRes && (crisisRes.riskLevel === "high" || crisisRes.riskLevel === "medium")) {
                  onCrisisDetected?.(crisisRes.riskLevel);
                }
              })
              .catch((err) => console.warn("Background crisis scan failed:", err));
          }
        } else {
          setError("Unable to process log entry. Please try again.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-900/30 bg-rose-950/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        placeholder="How are you feeling today? Write down your thoughts, struggles, or successes..."
        rows={4}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none transition focus:border-teal-500 focus:bg-zinc-900/60 disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="w-full rounded-xl bg-teal-500 px-4 py-3 text-xs font-black text-zinc-950 shadow-md transition hover:bg-teal-400 disabled:opacity-50"
      >
        {isPending ? "Analyzing Sentiment & Logging..." : "Save Entry"}
      </button>
    </form>
  );
}
