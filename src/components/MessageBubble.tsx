"use client";

import React from "react";
import { Message } from "@/hooks/useMessageStream";

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

export default function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isMe = message.senderId === currentUserId;
  const isTherapist = message.senderType === "THERAPIST";

  return (
    <div className={`flex w-full flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
      {/* Sender Header */}
      <div className="flex items-center gap-1.5 px-2">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          {isMe ? "You" : isTherapist ? "Therapist" : "Patient"}
        </span>
        {isTherapist && !isMe && (
          <span className="bg-teal-500/10 text-teal-400 text-[8px] font-black border border-teal-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Therapist
          </span>
        )}
      </div>

      {/* Message Balloon */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md transition-all ${
          isMe
            ? "bg-teal-500 text-zinc-950 font-semibold rounded-tr-none"
            : "bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* Date Timestamp */}
      <span className="text-[9px] text-zinc-600 px-2 font-medium">
        {new Date(message.createdAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
