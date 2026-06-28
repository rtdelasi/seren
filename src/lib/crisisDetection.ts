import { generateText } from "./ai";

/**
 * Analyzes journal entries or chat messages for crisis signals.
 * Prompts the unified AI client to return structured JSON classifications.
 */
export async function analyzeCrisisSignal(text: string): Promise<{ riskLevel: "none" | "low" | "medium" | "high"; reason: string }> {
  if (!text || !text.trim()) {
    return { riskLevel: "none", reason: "Blank input text." };
  }

  const prompt = `
Analyze the following personal statement (which could be a journal entry or chat message) for any signs of crisis, self-harm, suicidal ideation, hopelessness, or immediate emotional danger.

Classify the risk level as one of:
- "none": No signs of risk or self-harm.
- "low": Mild distress or frustration, but no self-harm or hopelessness.
- "medium": Significant distress, signs of severe hopelessness, or mild warnings, but no active self-harm plan/intent.
- "high": Active suicidal ideation, self-harm intent, planning, or immediate danger.

Respond ONLY with a valid JSON object matching this schema. Do not include any markdown formatting, code block markers (such as \`\`\`json), or trailing commas:
{
  "riskLevel": "none" | "low" | "medium" | "high",
  "reason": "brief explanation of the classification"
}

Statement to analyze:
"${text}"
`;

  try {
    const response = await generateText(prompt);
    // Sanitize any potential markdown wrappers (like ```json ... ```) that LLMs sometimes generate
    const cleaned = response.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    if (["none", "low", "medium", "high"].includes(parsed.riskLevel)) {
      return {
        riskLevel: parsed.riskLevel as "none" | "low" | "medium" | "high",
        reason: parsed.reason || "Classified via LLM analysis.",
      };
    }
    return { riskLevel: "none", reason: "Unexpected riskLevel parsed from JSON response." };
  } catch (error) {
    console.error("Crisis signal analysis failed, defaulting to none:", error);
    return { riskLevel: "none", reason: "Analysis process failure." };
  }
}
