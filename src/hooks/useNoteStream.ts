"use client";

import { useState } from "react";

/**
 * Hook to stream structured SOAP note content from the API stream route.
 */
export function useNoteStream() {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const generateSOAPNote = async (rawNotes: string) => {
    setStreamedText("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/therapist/notes/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawNotes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize streaming request: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Unable to initialize response stream reader.");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        setStreamedText((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Error streaming SOAP note:", error);
      setStreamedText((prev) => prev + "\n\n[Error occurred during real-time streaming note generation.]");
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    streamedText,
    setStreamedText,
    isStreaming,
    generateSOAPNote,
  };
}
