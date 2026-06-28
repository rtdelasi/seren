import React from "react";

export default function AlertBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-300 shadow-sm backdrop-blur-xl">
      {/* Pulse ring indicating unresolved alert */}
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
      </span>
      <span>Crisis Alert</span>
    </div>
  );
}
