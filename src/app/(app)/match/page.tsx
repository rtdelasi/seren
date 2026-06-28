"use client";

import React, { useTransition } from "react";
import { submitIntakeForm } from "@/actions/matching";

export default function MatchPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await submitIntakeForm(formData);
      } catch (error) {
        console.error("Form submission failed:", error);
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        {/* AI Processing loading spinner */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="h-24 w-24 animate-spin rounded-full border-4 border-zinc-900 border-t-teal-500" />
          <div className="absolute h-12 w-12 animate-pulse rounded-full bg-teal-500/20" />
        </div>
        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Finding Your Matches</h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
          Our AI client is reviewing therapist profiles, languages, and specialties to rank the best options for your needs.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Block */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
            Matching Portal
          </span>
          <h1 className="mt-4 text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Find Your Match
          </h1>
          <p className="mt-3 text-lg text-zinc-400">
            Tell us about yourself and we will match you with a therapist who understands your goals.
          </p>
        </div>

        {/* Intake Form */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 backdrop-blur-xl shadow-xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Issue */}
            <div className="flex flex-col gap-2">
              <label htmlFor="issue" className="text-sm font-bold text-zinc-300">
                What challenges or issues are you currently facing?
              </label>
              <textarea
                id="issue"
                name="issue"
                required
                rows={3}
                placeholder="e.g. Navigating stress from a career transition, dealing with anxious thoughts..."
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-teal-500 focus:bg-zinc-900"
              />
            </div>

            {/* Goals */}
            <div className="flex flex-col gap-2">
              <label htmlFor="goals" className="text-sm font-bold text-zinc-300">
                What are your main goals for therapy?
              </label>
              <textarea
                id="goals"
                name="goals"
                required
                rows={3}
                placeholder="e.g. Developing healthy coping mechanisms, improving communication, work-life balance..."
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-teal-500 focus:bg-zinc-900"
              />
            </div>

            {/* Two column dropdown section */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Language */}
              <div className="flex flex-col gap-2">
                <label htmlFor="language" className="text-sm font-bold text-zinc-300">
                  Preferred Language
                </label>
                <select
                  id="language"
                  name="language"
                  required
                  defaultValue="English"
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 outline-none transition focus:border-teal-500 focus:bg-zinc-900"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Russian">Russian</option>
                </select>
              </div>

              {/* Gender Preference */}
              <div className="flex flex-col gap-2">
                <label htmlFor="preferredGender" className="text-sm font-bold text-zinc-300">
                  Therapist Gender Preference
                </label>
                <select
                  id="preferredGender"
                  name="preferredGender"
                  defaultValue=""
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 outline-none transition focus:border-teal-500 focus:bg-zinc-900"
                >
                  <option value="">No Preference</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full rounded-xl bg-teal-500 px-4 py-3.5 text-sm font-extrabold text-zinc-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-400 hover:shadow-teal-400/30"
              >
                Submit & Find Therapist Matches
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
