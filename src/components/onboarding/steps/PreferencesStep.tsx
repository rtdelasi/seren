"use client";

import React from "react";

interface PreferencesStepProps {
  preferredGender: string | null;
  language: string;
  onGenderChange: (gender: string | null) => void;
  onLanguageChange: (lang: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const GENDER_OPTIONS = [
  { id: "none", label: "No Preference", value: null },
  { id: "female", label: "Female Therapist", value: "Female" },
  { id: "male", label: "Male Therapist", value: "Male" },
];

export default function PreferencesStep({
  preferredGender,
  language,
  onGenderChange,
  onLanguageChange,
  onNext,
  onBack,
}: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-black text-white">Your Therapist Preferences</h2>
        <p className="text-xs text-zinc-400">Specify preferences to help us match you with the right fit.</p>
      </div>

      {/* Gender Preferences */}
      <div className="space-y-3">
        <span className="text-xs font-black text-zinc-300 block">Preferred Therapist Gender</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GENDER_OPTIONS.map((opt) => {
            const isSelected = preferredGender === opt.value;
            return (
              <button
                key={opt.id}
                onClick={() => onGenderChange(opt.value)}
                className={`text-center rounded-xl p-3 border text-xs font-bold transition ${
                  isSelected
                    ? "bg-teal-500/10 text-white border-teal-500"
                    : "bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:border-zinc-800"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Preferences */}
      <div className="space-y-3 pt-2">
        <label htmlFor="language" className="text-xs font-black text-zinc-300 block">
          Preferred Language
        </label>
        <input
          type="text"
          id="language"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          placeholder="e.g. English, Spanish, French, Mandarin..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-teal-500 focus:bg-zinc-900/60"
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
        <button onClick={onBack} className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black px-6 py-3 shadow transition"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
