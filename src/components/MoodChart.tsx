"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface JournalEntryData {
  createdAt: Date | string;
  sentiment: number;
  [key: string]: any;
}

interface MoodChartProps {
  entries: JournalEntryData[];
}

export default function MoodChart({ entries }: MoodChartProps) {
  // Reverse entries so chronological order runs from left to right
  const chartData = [...entries].reverse().map((entry) => ({
    date: new Date(entry.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    score: entry.sentiment,
  }));

  // Custom tooltips matching the dashboard theme
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      let label = "Neutral";
      let colorClass = "text-zinc-400";

      if (score > 0.3) {
        label = "Positive";
        colorClass = "text-emerald-400";
      } else if (score < -0.3) {
        label = "Low";
        colorClass = "text-rose-400";
      }

      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{payload[0].payload.date}</p>
          <p className="text-sm font-bold mt-1 text-zinc-200">
            Score: <span className="text-white">{score.toFixed(2)}</span>
          </p>
          <p className={`text-xs font-semibold mt-0.5 ${colorClass}`}>State: {label}</p>
        </div>
      );
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-900 bg-zinc-950/20 p-6 text-center">
        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
          No mood history found. Write a new journal entry below to populate your 30-day mood chart.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis
            stroke="#71717a"
            fontSize={10}
            domain={[-1.0, 1.0]}
            tickLine={false}
            axisLine={false}
            ticks={[-1.0, -0.5, 0, 0.5, 1.0]}
            tickFormatter={(tick) => {
              if (tick === 1.0) {
                return "Positive";
              }
              if (tick === 0) {
                return "Neutral";
              }
              if (tick === -1.0) {
                return "Low";
              }
              return "";
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#moodGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
