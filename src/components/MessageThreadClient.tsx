"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Message, useMessageStream } from "@/hooks/useMessageStream";
import { sendMessage } from "@/actions/messages";
import MessageBubble from "@/components/MessageBubble";
import { triggerCrisisAnalysis } from "@/actions/crisis";
import CrisisBanner from "@/components/CrisisBanner";

interface MessageThreadClientProps {
  threadId: string;
  initialMessages: Message[];
  currentUserId: string;
}

export default function MessageThreadClient({ threadId, initialMessages, currentUserId }: MessageThreadClientProps) {
  const { messages, setMessages, isSSEActive } = useMessageStream(threadId, initialMessages);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [crisisRisk, setCrisisRisk] = useState<"none" | "low" | "medium" | "high">("none");
  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom of the timeline on new messages
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isPending) {
      return;
    }

    const messageText = content.trim();
    setContent("");

    startTransition(async () => {
      try {
        const res = await sendMessage(threadId, messageText);
        if (res.success && res.data) {
          const sentMessage: Message = {
            id: res.data.id,
            threadId: res.data.threadId,
            senderId: res.data.senderId,
            senderType: res.data.senderType,
            content: res.data.content,
            createdAt: res.data.createdAt,
            updatedAt: res.data.updatedAt,
          };

          // Append locally if not already streamed
          setMessages((prev) => {
            if (prev.some((m) => m.id === sentMessage.id)) {
              return prev;
            }
            return [...prev, sentMessage];
          });

          // Run background crisis check asynchronously (post-send, non-blocking)
          triggerCrisisAnalysis(messageText, currentUserId)
            .then((crisisRes) => {
              if (crisisRes && (crisisRes.riskLevel === "high" || crisisRes.riskLevel === "medium")) {
                setCrisisRisk(crisisRes.riskLevel);
              }
            })
            .catch((err) => console.warn("Background crisis scan failed:", err));
        }
      } catch (err: any) {
        console.error("Failed to send message:", err);
        // Put text back on error
        setContent(messageText);
      }
    });
  };

  return (
    <div className="space-y-4">
      {crisisRisk !== "none" && (
        <CrisisBanner riskLevel={crisisRisk} onDismiss={() => setCrisisRisk("none")} />
      )}

      <div className="flex flex-col h-[650px] border border-zinc-900 bg-zinc-950/40 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Thread Status Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950 p-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-300">Therapy Chat Thread</span>
          <span className="text-[10px] text-zinc-500 mt-0.5">Thread ID: {threadId}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isSSEActive ? "bg-teal-500 animate-pulse" : "bg-amber-500"}`} />
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            {isSSEActive ? "SSE: Real-time" : "Polling fallback"}
          </span>
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-zinc-650 max-w-xs leading-relaxed">
              No messages logged yet. Send a note below to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} />)
        )}
        <div ref={listEndRef} />
      </div>

      {/* Message Input controls */}
      <form onSubmit={handleSend} className="border-t border-zinc-900 bg-zinc-950 p-4 flex gap-3 items-end">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          disabled={isPending}
          placeholder="Type your message here... (Enter to send)"
          rows={1}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-teal-500 focus:bg-zinc-900 resize-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black px-5 py-3 h-[44px] shadow transition disabled:opacity-50 flex items-center justify-center"
        >
          {isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  </div>
  );
}
