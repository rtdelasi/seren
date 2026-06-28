"use client";

import React, { useState } from "react";
import ResourceCard from "./ResourceCard";
import { Resource, RecommendedResource } from "@/lib/resourceRanker";
import resourcesData from "@/data/resources.json";

interface ResourceLibraryClientProps {
  recommendedResources: RecommendedResource[];
  initialSavedIds: string[];
}

const ALL_RESOURCES = resourcesData as Resource[];

export default function ResourceLibraryClient({
  recommendedResources,
  initialSavedIds,
}: ResourceLibraryClientProps) {
  const [activeTab, setActiveTab] = useState<string>("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds);

  // Helper to handle client-side toggle callback updates
  const handleFavoriteToggle = (id: string, isFavoritedNow: boolean) => {
    setSavedIds((prev) => {
      if (isFavoritedNow) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter((item) => item !== id);
      }
    });
  };

  // Determine resources to display based on active tab
  let filteredResources: (Resource & { reason?: string })[] = [];

  if (activeTab === "recommended") {
    filteredResources = recommendedResources.map((item) => ({
      ...item,
      reason: item.recommendationReason,
    }));
  } else if (activeTab === "favorites") {
    filteredResources = ALL_RESOURCES.filter((res) => savedIds.includes(res.id)).map((item) => {
      const rec = recommendedResources.find((r) => r.id === item.id);
      return {
        ...item,
        reason: rec?.recommendationReason,
      };
    });
  } else if (activeTab === "all") {
    filteredResources = ALL_RESOURCES.map((item) => {
      const rec = recommendedResources.find((r) => r.id === item.id);
      return {
        ...item,
        reason: rec?.recommendationReason,
      };
    });
  } else {
    // Specific category tab
    filteredResources = ALL_RESOURCES.filter((res) => res.category === activeTab).map((item) => {
      const rec = recommendedResources.find((r) => r.id === item.id);
      return {
        ...item,
        reason: rec?.recommendationReason,
      };
    });
  }

  // Apply search query filter if exists
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredResources = filteredResources.filter(
      (res) => res.title.toLowerCase().includes(query) || res.description.toLowerCase().includes(query)
    );
  }

  const tabs = [
    { id: "recommended", label: "✨ Curated for You" },
    { id: "favorites", label: "❤️ Favorites" },
    { id: "all", label: "All Resources" },
    { id: "anxiety", label: "Anxiety" },
    { id: "depression", label: "Depression" },
    { id: "mindfulness", label: "Mindfulness" },
    { id: "sleep", label: "Sleep" },
    { id: "work-stress", label: "Work Stress" },
    { id: "self-esteem", label: "Self-Esteem" },
    { id: "relationships", label: "Relationships" },
    { id: "grief", label: "Grief" },
  ];

  return (
    <div className="space-y-6">
      {/* Search Input bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises, articles, and worksheets..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 pl-10 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-teal-500 focus:bg-zinc-900/60"
          />
          <span className="absolute left-3.5 top-3.5 text-zinc-550 text-xs select-none">🔍</span>
        </div>

        <div className="text-right text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          Total items: {filteredResources.length}
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-3 overflow-x-auto select-none no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={`text-xs font-black px-3.5 py-1.5 rounded-lg border transition whitespace-nowrap ${
                isActive
                  ? "bg-teal-500 text-zinc-950 border-teal-550 shadow-md"
                  : "bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-850"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Results grid list */}
      {filteredResources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/10 p-12 text-center">
          <span className="text-2xl">🌱</span>
          <h3 className="text-sm font-bold text-zinc-300 mt-3">No Resources Found</h3>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
            Try adjusting your search criteria or favoriting items in the main library grid to populate your personal
            favorites list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const favorited = savedIds.includes(res.id);
            return (
              <ResourceCard
                key={res.id}
                resource={res}
                recommendationReason={res.reason}
                isInitialFavorited={favorited}
                onFavoriteToggle={handleFavoriteToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
