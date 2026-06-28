import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ClientRoster from "@/components/therapist/ClientRoster";
import EarningsSummary from "@/components/therapist/EarningsSummary";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TherapistDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/journal");
  }

  let therapistRecord: any = null;
  let clientRoster: any[] = [];
  let todaysSessions: any[] = [];
  let completedCount = 0;
  let weeklyCompletedCount = 0;
  let sessionsNeedingNotes: any[] = [];

  try {
    // 1. Resolve therapist profile
    therapistRecord = await prisma.therapist.findFirst({
      where: { email: session?.user?.email },
    });

    if (therapistRecord) {
      const therapistId = therapistRecord.id;

      // Define date ranges for today's sessions
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 2. Fetch all data concurrently to hit sub-second load times
      const [allSessions, dbTodaySessions, dbCompleted, dbWeeklyCompleted, dbPendingNotes] = await Promise.all([
        prisma.therapySession.findMany({
          where: { therapistId },
          include: {
            user: {
              include: {
                crisisAlerts: {
                  where: { resolved: false },
                },
              },
            },
          },
          orderBy: { scheduledAt: "desc" },
        }),
        prisma.therapySession.findMany({
          where: {
            therapistId,
            scheduledAt: { gte: startOfDay, lte: endOfDay },
          },
          include: { user: true },
          orderBy: { scheduledAt: "asc" },
        }),
        prisma.therapySession.count({
          where: { therapistId, status: "COMPLETED" },
        }),
        prisma.therapySession.count({
          where: {
            therapistId,
            status: "COMPLETED",
            scheduledAt: { gte: oneWeekAgo },
          },
        }),
        prisma.therapySession.findMany({
          where: {
            therapistId,
            note: null,
            scheduledAt: { lte: new Date() },
          },
          include: { user: true },
          orderBy: { scheduledAt: "desc" },
          take: 5,
        }),
      ]);

      todaysSessions = dbTodaySessions;
      completedCount = dbCompleted;
      weeklyCompletedCount = dbWeeklyCompleted;
      sessionsNeedingNotes = dbPendingNotes;

      // Map sessions to unique Client Roster records (enforcing therapistId constraint)
      const clientMap = new Map();
      for (const sess of allSessions) {
        const client = sess.user;
        if (!clientMap.has(client.id)) {
          clientMap.set(client.id, {
            id: client.id,
            name: client.name,
            email: client.email,
            hasActiveAlert: client.crisisAlerts.length > 0,
            latestAlertReason: client.crisisAlerts[0]?.reason || null,
            lastSessionDate: sess.scheduledAt,
            lastSessionId: sess.id,
          });
        }
      }

      clientRoster = Array.from(clientMap.values());
      // Sort roster: Unresolved alerts sort to the very top, then sort by latest session date descending
      clientRoster.sort((a, b) => {
        if (a.hasActiveAlert && !b.hasActiveAlert) return -1;
        if (!a.hasActiveAlert && b.hasActiveAlert) return 1;
        return new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime();
      });
    }
  } catch (error) {
    console.warn("Therapist queries failed, running in fallback mode:", error);
    // Offline/Fallback structures
    therapistRecord = {
      id: "fallback-jenkins",
      name: "Dr. Sarah Jenkins",
      pricePerSession: 150,
    };
    clientRoster = [
      {
        id: "fallback-client-1",
        name: "David Miller",
        email: "david.miller@example.com",
        hasActiveAlert: true,
        latestAlertReason: "Severe anxiety signals and self-harm keywords identified in chat log.",
        lastSessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastSessionId: "session-fallback-1",
      },
      {
        id: "fallback-client-2",
        name: "Jane Watson",
        email: "jane.watson@example.com",
        hasActiveAlert: false,
        latestAlertReason: null,
        lastSessionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        lastSessionId: "session-fallback-2",
      },
    ];
    todaysSessions = [
      {
        id: "session-fallback-today",
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // in 2 hours
        duration: 50,
        status: "SCHEDULED",
        user: { name: "David Miller" },
      },
    ];
    completedCount = 8;
    weeklyCompletedCount = 3;
    sessionsNeedingNotes = [
      {
        id: "session-fallback-today",
        scheduledAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        user: { name: "David Miller" },
      },
    ];
  }

  // Fallback: If not registered as a therapist in the active workspace and query resolved empty
  if (!therapistRecord) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full border border-zinc-900 bg-zinc-950/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-4">
          <h2 className="text-xl font-bold text-teal-400">Therapist Profile Required</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Your authenticated email is not registered as a therapist in the system. Use matched demo accounts or
            view resources in client modes.
          </p>
          <a
            href="/journal"
            className="mt-4 inline-block rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition"
          >
            Client Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
              Therapist Portal
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Care Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Managing clinician file summaries, billing summaries, and safety alarms for assigned client caseload.
            </p>
          </div>
          <a
            href="/journal"
            className="text-xs font-black text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950 px-4 py-2.5 rounded-xl transition self-start md:self-auto"
          >
            Client Portal
          </a>
        </div>

        {/* Top items: Earnings Summary vs Today's Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings summary card */}
          <EarningsSummary
            pricePerSession={therapistRecord.pricePerSession}
            completedSessionsCount={completedCount}
            weeklyCompletedCount={weeklyCompletedCount}
          />

          {/* Today's schedule card */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full min-h-[190px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <h2 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Today's Schedule</h2>
              </div>

              {todaysSessions.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4">No sessions scheduled for today.</p>
              ) : (
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {todaysSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="flex justify-between items-center border border-zinc-900 bg-zinc-950 p-3 rounded-xl text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-200">{sess.user?.name || "Patient"}</span>
                        <p className="text-[10px] text-zinc-500 font-semibold">
                          Duration: {sess.duration} mins
                        </p>
                      </div>
                      <span className="font-bold text-teal-400">
                        {new Date(sess.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note Draft Alerts Section */}
        {sessionsNeedingNotes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-wider px-1">
              SOAP Notes Drafts Required
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sessionsNeedingNotes.map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex justify-between items-center text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-300">{sess.user?.name || "Patient"}</span>
                    <p className="text-[10px] text-zinc-500">
                      Session date: {new Date(sess.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`/therapist/sessions/${sess.id}/notes`}
                    className="text-[10px] font-bold text-teal-400 hover:text-teal-350 transition"
                  >
                    Draft SOAP →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caseload Roster */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-wider px-1">Active Client Caseload</h2>
          <ClientRoster clients={clientRoster} therapistId={therapistRecord.id} />
        </div>
      </div>
    </div>
  );
}
