"use client";

import React from "react";

interface AvailabilityStepProps {
  selectedTimes: string[];
  onChange: (times: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVAILABILITY_OPTIONS = [
  { id: "wd_morning", label: "Weekday Mornings", time: "8 AM - 12 PM" },
  { id: "wd_afternoon", label: "Weekday Afternoons", time: "12 PM - 5 PM" },
  { id: "wd_evening", label: "Weekday Evenings", time: "5 PM - 9 PM" },
  { id: "we_morning", label: "Weekend Mornings", time: "9 AM - 12 PM" },
  { id: "we_afternoon", label: "Weekend Afternoons", time: "12 PM - 6 PM" },
];

export default function AvailabilityStep({ selectedTimes, onChange, onNext, onBack }: AvailabilityStepProps) {
  const handleToggle = (label: string) => {
    if (selectedTimes.includes(label)) {
      onChange(selectedTimes.filter((t) => t !== label));
    } else {
      onChange([...selectedTimes, label]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-black text-white">Your Availability</h2>
        <p className="text-xs text-zinc-400">Select when you are typically available for video sessions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AVAILABILITY_OPTIONS.map((opt) => {
          const isSelected = selectedTimes.includes(opt.label);
          return (
            <button
              key={opt.id}
              onClick={() => handleToggle(opt.label)}
              className={`text-left rounded-xl p-4 border transition-all ${
                isSelected
                  ? "bg-teal-500/10 text-white border-teal-500 shadow-md"
                  : "bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="mt-1 h-3.5 w-3.5 rounded border-zinc-800 text-teal-500 bg-zinc-950 focus:ring-teal-500"
                />
                <div className="space-y-1">
                  <span className="text-xs font-black block">{opt.label}</span>
                  <span className="text-[10px] text-zinc-500 font-semibold block leading-relaxed">{opt.time}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
        <button
          onClick={onBack}
          className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition"
        >
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
