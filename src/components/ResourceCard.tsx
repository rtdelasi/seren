"use client";

import React, { useState, useTransition } from "react";
import { Resource } from "@/lib/resourceRanker";
import { toggleFavoriteResource } from "@/actions/resources";

interface ResourceCardProps {
  resource: Resource;
  recommendationReason?: string;
  isInitialFavorited: boolean;
  onFavoriteToggle?: (id: string, isFavorited: boolean) => void;
}

export default function ResourceCard({
  resource,
  recommendationReason,
  isInitialFavorited,
  onFavoriteToggle,
}: ResourceCardProps) {
  const [isFavorited, setIsFavorited] = useState(isInitialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isFavorited;
    setIsFavorited(nextState);
    if (onFavoriteToggle) {
      onFavoriteToggle(resource.id, nextState);
    }

    startTransition(async () => {
      try {
        const res = await toggleFavoriteResource(resource.id);
        if (res.success) {
          setIsFavorited(res.saved);
          if (onFavoriteToggle) {
            onFavoriteToggle(resource.id, res.saved);
          }
        }
      } catch (error) {
        setIsFavorited(!nextState);
        if (onFavoriteToggle) {
          onFavoriteToggle(resource.id, !nextState);
        }
      }
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "anxiety":
        return "bg-rose-950/40 text-rose-300 border-rose-900/30";
      case "depression":
        return "bg-indigo-950/40 text-indigo-300 border-indigo-900/30";
      case "mindfulness":
        return "bg-teal-950/40 text-teal-300 border-teal-900/30";
      case "sleep":
        return "bg-purple-950/40 text-purple-300 border-purple-900/30";
      case "work-stress":
        return "bg-amber-950/40 text-amber-300 border-amber-900/30";
      case "self-esteem":
        return "bg-pink-950/40 text-pink-300 border-pink-900/30";
      case "relationships":
        return "bg-blue-950/40 text-blue-300 border-blue-900/30";
      case "grief":
        return "bg-zinc-900/60 text-zinc-300 border-zinc-800/40";
      default:
        return "bg-zinc-950/40 text-zinc-300 border-zinc-900/30";
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "article") {
      return "📰 Article";
    }
    if (type === "exercise") {
      return "🧘 Exercise";
    }
    return "📝 Worksheet";
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 transition-all duration-300 hover:border-zinc-800 hover:shadow-xl backdrop-blur-xl">
      <div className="space-y-3">
        {/* Header Badges & Heart Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryColor(
                resource.category
              )}`}
            >
              {resource.category}
            </span>
            <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800/50 px-2 py-0.5 rounded">
              {getTypeLabel(resource.type)}
            </span>
          </div>

          <button
            onClick={handleFavoriteToggle}
            disabled={isPending}
            className="text-zinc-500 hover:text-rose-500 focus:outline-none transition-colors duration-250"
            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isFavorited ? "#f43f5e" : "none"}
              stroke={isFavorited ? "#f43f5e" : "currentColor"}
              strokeWidth="2"
              className="h-5 w-5 transform active:scale-130 transition-all duration-200"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </button>
        </div>

        {/* Text descriptions */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-black text-zinc-200 group-hover:text-white transition-colors">
            {resource.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 group-hover:text-zinc-300 transition-colors">
            {resource.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-900/50 pt-3 text-[10px] font-medium text-zinc-500">
        <span>🕒 {resource.duration}</span>

        {/* Custom Recommended Info Tooltip Overlay */}
        {recommendationReason && (
          <div className="relative group/tooltip">
            <span className="cursor-pointer text-teal-400 hover:text-teal-300 font-black flex items-center gap-1 select-none">
              ✨ Recomm. Info
            </span>
            {/* Tooltip Content */}
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-xl border border-zinc-800 bg-zinc-950/95 text-[11px] leading-relaxed text-zinc-300 shadow-2xl backdrop-blur-xl opacity-0 translate-y-1 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-200 z-30">
              <span className="block font-black text-teal-400 text-[9px] uppercase tracking-wider mb-1">
                AI Recommendation Reason
              </span>
              {recommendationReason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
