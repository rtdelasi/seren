import { GroqProvider } from "./groq";
import { OllamaProvider } from "./ollama";
import { AIProvider } from "./provider";

// Instantiate the appropriate provider depending on the environment
const getProvider = (): AIProvider => {
  if (process.env.NODE_ENV === "production") {
    return new GroqProvider();
  } else {
    return new OllamaProvider();
  }
};

const activeProvider = getProvider();

/**
 * Generates a complete text response from the active AI provider.
 * Uses Groq (llama3-70b-8192) in production, and Ollama (llama3) in development.
 * @param prompt - The user prompt.
 */
export async function generateText(prompt: string): Promise<string> {
  return activeProvider.generateText(prompt);
}

/**
 * Streams the text response from the active AI provider token-by-token.
 * @param prompt - The user prompt.
 * @param onChunk - Callback executed when a new token chunk is received.
 */
export async function streamText(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
  return activeProvider.streamText(prompt, onChunk);
}
