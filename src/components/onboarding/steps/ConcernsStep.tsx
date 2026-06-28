"use client";

import React from "react";

interface ConcernsStepProps {
  concerns: string;
  onChange: (concerns: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ConcernsStep({ concerns, onChange, onNext, onBack }: ConcernsStepProps) {
  const isValid = concerns.trim().length >= 10;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-black text-white">Tell us about your main concerns</h2>
        <p className="text-xs text-zinc-400">
          Describe the challenges or symptoms you're currently facing (minimum 10 characters). This provides key clinical context for therapist matching.
        </p>
      </div>

      <textarea
        value={concerns}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type details about what brings you to therapy (stress, low mood, sleep issues, etc.)..."
        rows={6}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none transition focus:border-teal-500 focus:bg-zinc-900/60"
      />

      <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
        <button
          onClick={onBack}
          className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black px-6 py-3 shadow transition disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
