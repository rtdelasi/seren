export interface AIProvider {
  /**
   * Generates a complete text response for a given prompt.
   * @param prompt - The user prompt.
   * @returns A promise that resolves to the full generated text response.
   */
  generateText(prompt: string): Promise<string>;

  /**
   * Generates a streaming text response for a given prompt, calling onChunk on every chunk received.
   * @param prompt - The user prompt.
   * @param onChunk - Callback triggered when a new token chunk is received.
   */
  streamText(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
}
