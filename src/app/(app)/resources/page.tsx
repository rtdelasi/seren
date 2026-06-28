import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rankResources } from "@/lib/resourceRanker";
import { getSavedResourceIds } from "@/actions/resources";
import ResourceLibraryClient from "@/components/ResourceLibraryClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/journal");
  }

  // Fetch recent journal entries for mood context
  let journalEntries: { content: string; sentiment: number }[] = [];
  try {
    journalEntries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        content: true,
        sentiment: true,
      },
    });
  } catch (error) {
    console.warn("Failed to fetch journal entries for resource ranking, using empty history:", error);
  }

  // Fetch latest matched goals if any match request has been submitted
  let goals: string[] = [];
  try {
    const latestMatch = await prisma.matchRequest.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (latestMatch?.goals) {
      goals = [latestMatch.goals];
    }
  } catch (error) {
    console.warn("Failed to fetch match requests for resource ranking, using empty goals:", error);
  }

  // Rank resources using our hybrid AI categorizing + LLM ranking algorithm
  const recommendedResources = await rankResources(journalEntries, goals);

  // Fetch saved favorite resource IDs
  const savedIds = await getSavedResourceIds();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation back link */}
        <div>
          <a href="/journal" className="text-xs font-semibold text-zinc-500 hover:text-teal-400 transition">
            ← Back to journal dashboard
          </a>
        </div>

        {/* Page title header */}
        <div>
          <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
            Clinical Catalog
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Wellness Resource Library
          </h1>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-2xl">
            Browse our curated exercises, evidence-based articles, and cognitive behavioral sheets. Items under the
            Curated tab are dynamically tailored by AI based on your recent journal entries and therapy goals.
          </p>
        </div>

        {/* Interactive library search & catalog tabs */}
        <ResourceLibraryClient recommendedResources={recommendedResources} initialSavedIds={savedIds} />

      </div>
    </div>
  );
}
