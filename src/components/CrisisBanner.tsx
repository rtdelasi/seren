"use client";

import React, { useState } from "react";

interface CrisisBannerProps {
  riskLevel: "none" | "low" | "medium" | "high";
  onDismiss?: () => void;
}

export default function CrisisBanner({ riskLevel, onDismiss }: CrisisBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible || riskLevel === "none" || riskLevel === "low") {
    return null;
  }

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (riskLevel === "high") {
    return (
      <div className="w-full bg-rose-950/40 border border-rose-500/25 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row gap-5 justify-between items-start md:items-center transition-all">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-rose-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              Critical Warning
            </span>
            <h3 className="text-sm font-black text-rose-200">You Are Not Alone. Support is Here.</h3>
          </div>
          <p className="text-xs leading-relaxed text-zinc-400 max-w-2xl">
            Our automated safety scanner flagged severe distress. If you are experiencing thoughts of self-harm or are
            in crisis, please connect with these free, immediate, and confidential safety resources:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="rounded-xl bg-rose-950/20 border border-rose-500/10 p-4">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                988 Suicide & Crisis Lifeline
              </span>
              <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                Call or text <strong className="text-white text-sm">988</strong> (Available 24/7, free, confidential)
              </p>
            </div>
            <div className="rounded-xl bg-rose-950/20 border border-rose-500/10 p-4">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Crisis Text Line</span>
              <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                Text <strong className="text-white text-sm">HOME</strong> to{" "}
                <strong className="text-white text-sm">741741</strong>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full md:w-auto text-center text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/45 px-4 py-2 rounded-lg transition"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Medium Risk Prompt
  return (
    <div className="w-full bg-amber-950/40 border border-amber-500/25 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
            Wellness Check
          </span>
          <h3 className="text-sm font-black text-amber-200">Recommendation to Connect</h3>
        </div>
        <p className="text-xs leading-relaxed text-zinc-400 max-w-xl">
          It looks like you might be going through a highly stressful situation. Please consider scheduling a session
          or messaging your matched therapist to check in.
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="w-full sm:w-auto text-center text-xs font-bold text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/45 px-4 py-2 rounded-lg transition"
      >
        Dismiss
      </button>
    </div>
  );
}
