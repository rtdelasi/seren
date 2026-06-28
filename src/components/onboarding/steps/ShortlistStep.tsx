"use client";

import React, { useState, useEffect } from "react";
import { getTherapistMatchesAction } from "@/actions/matching";
import TherapistCard from "@/components/TherapistCard";

interface ShortlistStepProps {
  formData: {
    goals: string[];
    concerns: string;
    preferredGender: string | null;
    language: string;
    availability: string[];
  };
  onFinish: () => void;
  onBack: () => void;
}

export default function ShortlistStep({ formData, onFinish, onBack }: ShortlistStepProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError("");
        const goalsSummary = formData.goals.join(", ") || "General therapy guidance";
        const res = await getTherapistMatchesAction(
          formData.concerns,
          goalsSummary,
          formData.language,
          formData.preferredGender
        );
        setMatches(res);
      } catch (err) {
        console.error("Shortlist matching error:", err);
        setError("Unable to calculate recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [formData]);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-black text-white">Your Therapist Shortlist</h2>
        <p className="text-xs text-zinc-400">
          Our matching engine curated these recommendations based on your goals and symptoms.
        </p>
      </div>

      {loading ? (
        // Shimmer loaders
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-5 animate-pulse space-y-4">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-zinc-900" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-1/3 bg-zinc-900 rounded" />
                  <div className="h-2 w-1/4 bg-zinc-900 rounded" />
                </div>
              </div>
              <div className="h-2.5 w-full bg-zinc-900 rounded" />
              <div className="h-2.5 w-5/6 bg-zinc-900 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-900/30 bg-rose-950/10 p-4 text-xs text-rose-400">{error}</div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-900 p-8 text-center text-xs text-zinc-500">
          No matches found accepting new clients matching your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((item) => (
            <div key={item.therapist.id} className="space-y-2">
              <div className="relative">
                {/* Score badge overlay */}
                <div className="absolute right-4 top-4 bg-teal-500/10 border border-teal-500/35 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase text-teal-400 z-10 backdrop-blur-md">
                  Match: {item.score}%
                </div>

                <TherapistCard therapist={item.therapist} score={item.score} reason={item.reason} />
              </div>

              {/* Match reason bubble */}
              <div className="p-4 bg-zinc-900/20 border border-zinc-900/60 rounded-xl text-xs text-zinc-400 leading-relaxed">
                <span className="block font-black text-teal-400 text-[9px] uppercase tracking-wider mb-1">
                  Why you were matched
                </span>
                {item.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onFinish}
          disabled={loading}
          className="rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black px-6 py-3 shadow transition disabled:opacity-50"
        >
          Complete Onboarding
        </button>
      </div>
    </div>
  );
}
