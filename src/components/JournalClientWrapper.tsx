"use client";

import React, { useState } from "react";
import CrisisBanner from "@/components/CrisisBanner";
import JournalEntryForm from "@/components/JournalEntryForm";

export default function JournalClientWrapper() {
  const [crisisRisk, setCrisisRisk] = useState<"none" | "low" | "medium" | "high">("none");

  return (
    <div className="space-y-6">
      {/* Safety warning banner displayed when scanner identifies medium or high risk */}
      {crisisRisk !== "none" && (
        <CrisisBanner riskLevel={crisisRisk} onDismiss={() => setCrisisRisk("none")} />
      )}

      {/* Input Log Card */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-zinc-200">Log Your Thoughts</h2>
        <JournalEntryForm onCrisisDetected={(risk) => setCrisisRisk(risk)} />
      </div>
    </div>
  );
}
