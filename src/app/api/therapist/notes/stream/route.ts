import { NextRequest } from "next/server";
import { streamText } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * Route handler to stream structured SOAP notes based on raw therapist inputs.
 * Uses ReadableStream to pipe AI token chunks back in real-time.
 */
export async function POST(request: NextRequest) {
  try {
    const { rawNotes } = await request.json();

    if (!rawNotes || !rawNotes.trim()) {
      return new Response("Missing rawNotes parameter in request body.", { status: 400 });
    }

    const prompt = `
You are an expert clinical co-pilot assisting a therapist in structuring session notes.
Take the following raw, informal notes from a therapy session and structure them strictly into the clinical SOAP format (Subjective, Objective, Assessment, Plan), and suggest concrete goals for the next session.

Pasted Raw Notes:
"${rawNotes}"

Please structure your response with these exact markdown sections:
### SUBJECTIVE
[Structure patient's subjective symptoms, quotes, and reports here]

### OBJECTIVE
[Structure therapist observations, clinical signs, and behaviors here]

### ASSESSMENT
[Structure clinical diagnostic evaluations, progress tracking, and professional assessment here]

### PLAN
[Structure treatment plan details, interventions, and immediate next steps here]

### NEXT-SESSION GOALS
- [Goal 1]
- [Goal 2]
- [Goal 3]
`;

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          await streamText(prompt, (chunk) => {
            controller.enqueue(encoder.encode(chunk));
          });
          controller.close();
        } catch (error) {
          console.error("Error during streamText SOAP notes generation:", error);
          controller.enqueue(encoder.encode("\n\n[Error: Note generation aborted due to an internal failure.]"));
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("POST SOAP note handler failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
