"use client";

import { useEffect, useState, useRef } from "react";

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Custom React hook to subscribe to a thread's message stream via Server-Sent Events (SSE).
 * Falls back to 3-second interval HTTP polling if SSE is disconnected.
 */
export function useMessageStream(threadId: string, initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSSEActive, setIsSSEActive] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedRef = useRef<string>(
    initialMessages.length > 0
      ? new Date(initialMessages[initialMessages.length - 1].createdAt).toISOString()
      : new Date().toISOString()
  );

  // Synchronize component state with fresh initial props on navigation
  useEffect(() => {
    setMessages(initialMessages);
    if (initialMessages.length > 0) {
      lastCheckedRef.current = new Date(initialMessages[initialMessages.length - 1].createdAt).toISOString();
    }
  }, [initialMessages, threadId]);

  // Fallback Polling Functionality
  const startPollingFallback = () => {
    if (pollingIntervalRef.current) {
      return;
    }
    setIsSSEActive(false);
    console.warn("SSE connection error. Invoking 3s fallback HTTP polling.");

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const sinceStr = encodeURIComponent(lastCheckedRef.current);
        const res = await fetch(`/api/messages?threadId=${threadId}&since=${sinceStr}`);

        if (res.ok) {
          const newMsgs: Message[] = await res.json();
          if (newMsgs.length > 0) {
            lastCheckedRef.current = new Date(newMsgs[newMsgs.length - 1].createdAt).toISOString();
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const uniqueMsgs = newMsgs.filter((m) => !existingIds.has(m.id));
              return [...prev, ...uniqueMsgs];
            });
          }
        }
      } catch (err) {
        console.error("Fallback polling request error:", err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Manage EventSource Connection lifecycle
  useEffect(() => {
    const connectSSE = () => {
      stopPolling();

      const es = new EventSource(`/api/messages/stream?threadId=${threadId}`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsSSEActive(true);
        console.log("SSE Stream connection established.");
      };

      es.onmessage = (event) => {
        if (event.data === "connected") {
          return;
        }
        try {
          const newMsg: Message = JSON.parse(event.data);
          lastCheckedRef.current = new Date(newMsg.createdAt).toISOString();

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        } catch (e) {
          console.error("Failed to parse SSE payload:", e);
        }
      };

      es.onerror = (err) => {
        console.error("SSE connection error, shutting down stream to trigger polling:", err);
        es.close();
        startPollingFallback();
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      stopPolling();
    };
  }, [threadId]);

  return { messages, setMessages, isSSEActive };
}
