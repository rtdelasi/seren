import Groq from "groq-sdk";
import { AIProvider } from "./provider";

export class GroqProvider implements AIProvider {
  private client: Groq;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY is not defined in environment variables.");
    }
    // We allow passing standard config or reading automatically from GROQ_API_KEY
    this.client = new Groq({ apiKey });
    this.model = "llama3-70b-8192";
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Groq generateText error:", error);
      throw error;
    }
  }

  async streamText(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const responseStream = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
        stream: true,
      });

      for await (const chunk of responseStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error("Groq streamText error:", error);
      throw error;
    }
  }
}
