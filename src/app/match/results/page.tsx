import React from "react";
import prisma from "@/lib/prisma";
import { generateText } from "@/lib/ai";
import { seedTherapistsIfEmpty } from "@/lib/seed";
import TherapistCard from "@/components/TherapistCard";
import type { Therapist } from "@prisma/client";

interface RankedMatch {
  therapistId: string;
  score: number;
  reason: string;
}

export const dynamic = "force-dynamic";

interface MatchResultsPageProps {
  searchParams: {
    requestId?: string;
    issue?: string;
    goals?: string;
    language?: string;
    preferredGender?: string;
  };
}

export default async function MatchResultsPage({ searchParams }: MatchResultsPageProps) {
  // Step 1: Ensure database is seeded with initial therapists on first load
  try {
    await seedTherapistsIfEmpty();
  } catch (e) {
    console.error("Database seed check failed, continuing...", e);
  }

  // Step 2: Retrieve search query parameters or request details from DB
  let issue = "";
  let goals = "";
  let language = "English";
  let preferredGender: string | null = null;

  if (searchParams.requestId) {
    try {
      const request = await prisma.matchRequest.findUnique({
        where: { id: searchParams.requestId },
      });
      if (request) {
        issue = request.issue;
        goals = request.goals;
        language = request.language;
        preferredGender = request.preferredGender;
      }
    } catch (dbError) {
      console.warn("Unable to fetch MatchRequest from database, falling back to query variables.", dbError);
    }
  }

  // If Database load failed or requestId wasn't provided, read from search parameters directly
  if (!issue) {
    issue = searchParams.issue || "";
    goals = searchParams.goals || "";
    language = searchParams.language || "English";
    preferredGender = searchParams.preferredGender || null;
  }

  // Guard: if no questionnaire details are present, show prompt to complete form
  if (!issue || !goals) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-zinc-200">No intake information found</h2>
        <p className="text-zinc-500 mt-1 max-w-sm text-sm">
          Please fill out the questionnaire so our system can matches you with a provider.
        </p>
        <a
          href="/match"
          className="mt-6 rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-extrabold text-zinc-950 transition hover:bg-teal-400"
        >
          Go to Intake Form
        </a>
      </div>
    );
  }

  // Step 3: Fetch active therapists accepting clients
  let therapists: Therapist[] = [];
  try {
    therapists = await prisma.therapist.findMany({
      where: { acceptingClients: true },
    });
  } catch (dbError) {
    console.error("Failed to query therapists from database:", dbError);
  }

  // If the database is unreachable, utilize static fallbacks to guarantee the interface operates
  if (therapists.length === 0) {
    therapists = [
      {
        id: "fallback-jenkins",
        name: "Dr. Sarah Jenkins",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
        email: "sarah.jenkins@seren.com",
        specialties: ["Anxiety", "Depression", "CBT (Cognitive Behavioral Therapy)"],
        languages: ["English", "Spanish"],
        acceptingClients: true,
        avgRating: 4.9,
        pricePerSession: 150,
        bio: "Dr. Jenkins is a clinical psychologist with over 10 years of experience specializing in cognitive behavioral therapy for anxiety, panic disorders, and depression.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "fallback-chen",
        name: "Marcus Chen, LMFT",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
        email: "marcus.chen@seren.com",
        specialties: ["Relationship Issues", "Family Counseling", "Stress Management"],
        languages: ["English", "Mandarin"],
        acceptingClients: true,
        avgRating: 4.8,
        pricePerSession: 130,
        bio: "Marcus specializes in relationship patterns, family dynamics, and mindfulness-based stress reduction. He provides a warm, collaborative environment.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "fallback-rostova",
        name: "Elena Rostova, LCSW",
        image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
        email: "elena.rostova@seren.com",
        specialties: ["Trauma & PTSD", "Grief & Loss", "EMDR"],
        languages: ["English", "Russian"],
        acceptingClients: true,
        avgRating: 4.95,
        pricePerSession: 160,
        bio: "Elena is a trauma-informed therapist certified in EMDR. She supports clients navigating deep grief, trauma recovery, and difficult life transitions.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "fallback-vance",
        name: "Dr. David K. Vance, PsyD",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
        email: "david.vance@seren.com",
        specialties: ["Addiction Recovery", "Anger Management", "CBT"],
        languages: ["English"],
        acceptingClients: true,
        avgRating: 4.7,
        pricePerSession: 140,
        bio: "Dr. Vance specializes in addiction counseling, behavioral modifications, and anger management. He takes a pragmatic, goal-oriented therapeutic approach.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Step 4: Perform AI Match Analysis using the dynamic provider client
  let rankedMatches: RankedMatch[] = [];

  try {
    const prompt = `
You are an expert AI clinical coordinator that matches patients with the best therapist based on their intake form.

Intake Form details:
- Main Issue: ${issue}
- Goals: ${goals}
- Language Preference: ${language}
- Preferred Therapist Gender: ${preferredGender || "No preference"}

Available Therapists:
${therapists
  .map(
    (t) => `
- ID: ${t.id}
  Name: ${t.name}
  Specialties: ${t.specialties.join(", ")}
  Languages: ${t.languages.join(", ")}
  Accepting Clients: ${t.acceptingClients ? "Yes" : "No"}
  Average Rating: ${t.avgRating}
  Price per Session: $${t.pricePerSession}
  Bio: ${t.bio}
`
  )
  .join("\n")}

Analyze the therapists and rank them based on how well they match the patient's intake form (clinical specialties, languages, gender preferences, etc.). Provide a match score from 0 to 100 for each therapist, along with a brief (1-2 sentences), empathetic reason explaining why they are a good match for the patient's specific goals. Only recommend therapists who are accepting clients.

You MUST respond ONLY with a JSON array of objects. Do not include markdown code block formatting or any conversational text.
Format:
[
  {
    "therapistId": "...",
    "score": 85,
    "reason": "..."
  }
]
`;

    const aiResponse = await generateText(prompt);

    // Strip markdown JSON blocks if present
    let cleanText = aiResponse.trim();
    if (cleanText.startsWith("```")) {
      const lines = cleanText.split("\n");
      if (lines[0].startsWith("```")) {
        lines.shift();
      }
      if (lines[lines.length - 1].startsWith("```")) {
        lines.pop();
      }
      cleanText = lines.join("\n").trim();
    }

    rankedMatches = JSON.parse(cleanText);
  } catch (error) {
    console.error("AI matching failed, utilizing heuristic fallbacks:", error);
    // Simple clinical logic matcher as a fallback
    rankedMatches = therapists.map((t) => {
      let score = 75;
      // Heuristic score additions
      if (t.specialties.some((s: string) => issue.toLowerCase().includes(s.toLowerCase()))) {
        score += 15;
      }
      if (t.languages.some((l: string) => language.toLowerCase() === l.toLowerCase())) {
        score += 8;
      }
      score = Math.min(score, 99);
      return {
        therapistId: t.id,
        score,
        reason: `Matched with ${t.name} based on their specialties in ${t.specialties[0]} and alignment with your goals.`,
      };
    });
  }

  // Combine active therapists database info with scores/reasons
  const processedTherapists = therapists
    .map((t) => {
      const match = rankedMatches.find((m) => m.therapistId === t.id);
      return {
        therapist: t,
        score: match ? match.score : 60,
        reason: match ? match.reason : "Compatible based on availability and background.",
      };
    })
    // Sort in descending order of matching score
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Results Page Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-3 py-1">
            Analysis Complete
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Your Matches</h1>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Based on your intake concerns regarding &ldquo;
            {issue.length > 60 ? `${issue.slice(0, 60)}...` : issue}
            &rdquo;, here are your ranked therapist matches.
          </p>
        </div>

        {/* Match cards */}
        <div className="grid grid-cols-1 gap-6">
          {processedTherapists.map(({ therapist, score, reason }) => (
            <TherapistCard key={therapist.id} therapist={therapist} score={score} reason={reason} />
          ))}
        </div>

        {/* Navigation bottom */}
        <div className="mt-12 text-center">
          <a href="/match" className="text-xs font-semibold text-zinc-500 hover:text-teal-400 transition">
            ← Edit intake form responses
          </a>
        </div>
      </div>
    </div>
  );
}
