import { AIProvider } from "./provider";

export class OllamaProvider implements AIProvider {
  private host: string;
  private model: string;

  constructor() {
    this.host = process.env.OLLAMA_HOST || "http://localhost:11434";
    this.model = "llama3";
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.host}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Ollama response error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || "";
    } catch (error) {
      console.error("Ollama generateText error:", error);
      throw error;
    }
  }

  async streamText(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await fetch(`${this.host}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Ollama response error (${response.status}): ${errorText || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Ollama response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last segment in the buffer as it might be incomplete
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content || "";
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.warn("Failed to parse Ollama JSON line:", line, e);
          }
        }
      }

      // Check if there is anything left in the buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          const content = parsed.message?.content || "";
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          // Ignore parse errors on the final chunk if incomplete
        }
      }
    } catch (error) {
      console.error("Ollama streamText error:", error);
      throw error;
    }
  }
}
