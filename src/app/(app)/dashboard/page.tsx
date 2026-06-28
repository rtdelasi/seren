import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UpcomingSession from "@/components/dashboard/UpcomingSession";
import MoodStreak from "@/components/dashboard/MoodStreak";
import QuickStats from "@/components/dashboard/QuickStats";
import { getSavedResourceIds } from "@/actions/resources";
import { rankResources } from "@/lib/resourceRanker";
import ResourceCard from "@/components/ResourceCard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/journal");
  }

  // Concurrent RSC Data Fetching (under 1s performance budgets)
  let upcomingSession: any = null;
  let journalEntries: any[] = [];
  let unreadMessagesCount = 0;
  let savedResourcesCount = 0;
  let threadId: string | null = null;
  let goals: string[] = [];

  try {
    const [dbSession, dbEntries, dbUnread, dbSaved, latestMatch] = await Promise.all([
      prisma.therapySession.findFirst({
        where: {
          userId,
          status: "SCHEDULED",
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        include: { therapist: true },
      }),
      prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.message.count({
        where: {
          threadId: { startsWith: `${userId}_` },
          senderType: "THERAPIST",
        },
      }),
      prisma.savedResource.count({
        where: { userId },
      }),
      prisma.matchRequest.findFirst({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    upcomingSession = dbSession;
    journalEntries = dbEntries;
    unreadMessagesCount = dbUnread;
    savedResourcesCount = dbSaved;

    if (latestMatch) {
      goals = latestMatch.goals ? [latestMatch.goals] : [];
    }

    // Build user thread relation if therapist assignment exists
    const someSession =
      dbSession ||
      (await prisma.therapySession.findFirst({
        where: { userId },
      }));
    if (someSession) {
      threadId = `${userId}_${someSession.therapistId}`;
    }
  } catch (error) {
    console.warn("Dashboard database queries failed, utilizing mock fallbacks:", error);
    // Offline/Fallback values
    upcomingSession = {
      id: "demo-session-id",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      duration: 50,
      status: "SCHEDULED",
      therapist: {
        name: "Dr. Sarah Jenkins",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
      },
    };
    journalEntries = [
      {
        id: "demo-journal-1",
        content: "Feeling stressed about upcoming work projects but overall stable.",
        sentiment: -0.1,
        reflection: "It's normal to feel stress around major deadlines. Try scheduling rest blocks.",
        suggestion: "Consider writing down a single priority task today to clarify workload.",
        createdAt: new Date(),
      },
    ];
    unreadMessagesCount = 2;
    savedResourcesCount = 3;
    threadId = `${userId}_fallback-jenkins`;
  }

  // Calculate average sentiment baseline
  const sentiments = journalEntries.map((e) => e.sentiment);
  const averageSentiment = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0.0;

  // Rank 3 recommended resources
  let recommendedResources: any[] = [];
  try {
    const ranked = await rankResources(journalEntries, goals);
    recommendedResources = ranked.slice(0, 3);
  } catch (error) {
    // Default fallback resources
    recommendedResources = [];
  }

  // Retrieve favorited resource list
  let savedIds: string[] = [];
  try {
    savedIds = await getSavedResourceIds();
  } catch (e) {
    // Ignore
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
              Member Portal
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Hello, {session?.user?.name || "Welcome Back"}
            </h1>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Welcome to your health dashboard. View logs, calendar schedules, and AI recommended documents.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/journal"
              className="text-xs font-black text-zinc-950 bg-teal-500 hover:bg-teal-400 px-4 py-2.5 rounded-xl shadow transition"
            >
              Log New Entry
            </a>
            <a
              href="/resources"
              className="text-xs font-black text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950 px-4 py-2.5 rounded-xl transition"
            >
              Care Library
            </a>
          </div>
        </div>

        {/* Core items section - Stacks to single column on small screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UpcomingSession session={upcomingSession} />
          <MoodStreak entries={journalEntries} />
        </div>

        {/* Quick Stats list */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-wider px-1">Overview Metrics</h2>
          <QuickStats
            unreadMessagesCount={unreadMessagesCount}
            savedResourcesCount={savedResourcesCount}
            averageSentiment={averageSentiment}
            threadId={threadId}
          />
        </div>

        {/* Recommended Files */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-wider">AI Recommended Files</h2>
            <a href="/resources" className="text-xs font-bold text-teal-400 hover:text-teal-350 transition">
              Search Library →
            </a>
          </div>

          {recommendedResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-900 p-8 text-center text-xs text-zinc-500">
              Journal entries or matching questionnaires are required to curate specific care suggestions.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedResources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  recommendationReason={res.recommendationReason}
                  isInitialFavorited={savedIds.includes(res.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
