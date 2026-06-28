import resourcesData from "@/data/resources.json";
import { generateText } from "./ai";

export interface Resource {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  duration: string;
}

export interface RecommendedResource extends Resource {
  recommendationReason: string;
}

const ALL_RESOURCES: Resource[] = resourcesData as Resource[];

/**
 * Ranks static resources using a hybrid approach:
 * Stage 1: Categorize journal logs/goals using keyword frequencies to extract 15 candidates.
 * Stage 2: Query the LLM client to select the top 6 items and generate custom reasons.
 * Fallback: Uses default clinical heuristics if query streams or JSON parses fail.
 */
export async function rankResources(
  journalEntries: { content: string; sentiment: number }[],
  goals: string[]
): Promise<RecommendedResource[]> {
  const categoryScores: Record<string, number> = {
    anxiety: 0,
    depression: 0,
    mindfulness: 0,
    sleep: 0,
    "work-stress": 0,
    "self-esteem": 0,
    relationships: 0,
    grief: 0,
  };

  const journalsText = journalEntries.map((e) => e.content.toLowerCase()).join(" ");
  const goalsText = goals.map((g) => g.toLowerCase()).join(" ");
  const combinedText = journalsText + " " + goalsText;

  const keywordMap: Record<string, string[]> = {
    anxiety: ["anxious", "anxiety", "panic", "scared", "worry", "worried", "nervous", "fear", "tension", "tense"],
    depression: ["sad", "depressed", "depression", "empty", "hopeless", "low mood", "crying", "numb", "lonely"],
    mindfulness: ["calm", "present", "meditate", "breathe", "breathing", "mindful", "grounding", "acceptance"],
    sleep: ["sleep", "insomnia", "tired", "awake", "bedtime", "night", "restless", "fatigue"],
    "work-stress": ["work", "job", "career", "stress", "boss", "office", "burnout", "overwhelmed", "deadline"],
    "self-esteem": ["worth", "confidence", "insecure", "self-esteem", "critic", "doubt", "imposter", "value"],
    relationships: ["partner", "relationship", "love", "marriage", "conflict", "communication", "intimacy"],
    grief: ["grief", "loss", "mourning", "passed away", "died", "miss", "sadness"],
  };

  for (const [category, keywords] of Object.entries(keywordMap)) {
    for (const word of keywords) {
      const regex = new RegExp("\\b" + word + "\\b", "gi");
      const matches = combinedText.match(regex);
      if (matches) {
        categoryScores[category] += matches.length;
      }
    }
  }

  // Boost based on sentiment score trends
  const sentiments = journalEntries.map((e) => e.sentiment);
  const avgSentiment = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0;
  if (avgSentiment < -0.3) {
    categoryScores.depression += 3;
    categoryScores.anxiety += 2;
  }

  // Map and score all resources
  const scoredResources = ALL_RESOURCES.map((res) => {
    const score = categoryScores[res.category] || 0;
    return { res, score };
  });

  // Sort descending by score, randomized tie-breakers
  scoredResources.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  // Retrieve candidate pool
  const candidates = scoredResources.slice(0, 15).map((item) => item.res);

  const getHeuristicReason = (res: Resource): string => {
    switch (res.category) {
      case "anxiety":
        return "Recommended to help soothe physical symptoms of tension, panic, or persistent worry.";
      case "depression":
        return "Recommended to break low-energy withdrawal loops through active behavioral routines.";
      case "mindfulness":
        return "Recommended to bring self-awareness to the present moment and release mental anxiety cycles.";
      case "sleep":
        return "Recommended to guide night routines, calm active worries, and restore healthy circadian hygiene.";
      case "work-stress":
        return "Recommended to assist in pacing heavy workloads, counter burnout, and protect boundaries.";
      case "self-esteem":
        return "Recommended to reframe hyper-critical thoughts and reinforce core self-worth values.";
      case "relationships":
        return "Recommended to support assertive communication patterns and secure attachment boundaries.";
      case "grief":
        return "Recommended to help honor memories while validating the natural waves of mourning.";
      default:
        return "Recommended to support your active therapy goals and check-in history.";
    }
  };

  // Stage 2: Fine-grained AI ranking query
  try {
    const journalSummary = journalEntries
      .slice(0, 5)
      .map((e) => `- ${e.content}`)
      .join("\n");
    const prompt = `
You are a clinical AI match coordinator.
Select the top 6 most relevant mental health resources for a client based on their therapy goals and recent mood logs.

Client Goals:
${goals.length > 0 ? goals.map((g) => `- ${g}`).join("\n") : "None stated yet"}

Recent Journal Entries:
${journalSummary || "No recent entries written yet"}

Candidate Resources:
${JSON.stringify(candidates, null, 2)}

Provide a direct, empathetic 1-sentence explanation for why each is recommended.
Return ONLY a valid JSON array of objects. Do not include markdown code block formats.
JSON Schema:
[
  {
    "id": "res-x",
    "reason": "..."
  }
]
`;

    const response = await generateText(prompt);
    const cleanJSON = response.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedRecommendations = JSON.parse(cleanJSON) as { id: string; reason: string }[];

    const finalRecommendations: RecommendedResource[] = [];
    for (const rec of parsedRecommendations) {
      const match = candidates.find((c) => c.id === rec.id);
      if (match) {
        finalRecommendations.push({
          ...match,
          recommendationReason: rec.reason,
        });
      }
    }

    if (finalRecommendations.length >= 3) {
      return finalRecommendations;
    }
  } catch (error) {
    console.error("AI resource ranking failed, using heuristics fallback:", error);
  }

  // Fallback: Return top 6 programmatically ranked candidates with default clinical explanations
  return candidates.slice(0, 6).map((res) => ({
    ...res,
    recommendationReason: getHeuristicReason(res),
  }));
}
