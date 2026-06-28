"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useNoteStream } from "@/hooks/useNoteStream";
import { saveNote } from "@/actions/notes";

interface SOAPEditorProps {
  sessionId: string;
  initialNoteContent: string;
}

export default function SOAPEditor({ sessionId, initialNoteContent }: SOAPEditorProps) {
  const { streamedText, setStreamedText, isStreaming, generateSOAPNote } = useNoteStream();
  const [rawNotes, setRawNotes] = useState("");
  const [editorText, setEditorText] = useState(initialNoteContent || "");
  const [reviewed, setReviewed] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleGenerate = () => {
    if (!rawNotes.trim()) {
      return;
    }
    setSaveStatus(null);
    setReviewed(false);
    generateSOAPNote(rawNotes);
  };

  // Synchronize dynamic stream tokens into editor workspace
  useEffect(() => {
    if (isStreaming) {
      setEditorText(streamedText);
    }
  }, [streamedText, isStreaming]);

  const handleSave = () => {
    if (!reviewed || !editorText.trim() || isSaving) {
      return;
    }

    setSaveStatus(null);
    startSaving(async () => {
      try {
        const res = await saveNote(sessionId, editorText);
        if (res.success) {
          setSaveStatus({ success: true, message: "Clinical SOAP note finalized and successfully saved to session." });
        } else {
          setSaveStatus({ success: false, message: "Failed to save SOAP note to database." });
        }
      } catch (err: any) {
        setSaveStatus({ success: false, message: err.message || "An unexpected error occurred during save." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Paste Area */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-zinc-200">1. Raw Session Log Inputs</h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Pasted session descriptions, quotes, and behavioral facts will be analyzed and structured by the AI co-pilot.
        </p>
        <textarea
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          disabled={isStreaming}
          placeholder="Paste therapist logs, raw bullet points, or session quotes here..."
          rows={5}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none transition focus:border-teal-500 focus:bg-zinc-900/60 disabled:opacity-50"
        />
        <button
          onClick={handleGenerate}
          disabled={isStreaming || !rawNotes.trim()}
          className="w-full sm:w-auto rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black px-5 py-3 shadow transition disabled:opacity-50"
        >
          {isStreaming ? "Streaming SOAP Note..." : "Generate SOAP Draft"}
        </button>
      </div>

      {/* Editor Review Area */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-zinc-200">2. Review & Commit SOAP Note</h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The drafted note remains editable. Revise or refine sections directly inside the text box below.
        </p>
        <textarea
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
          disabled={isStreaming}
          placeholder="Draft note will stream here. You can type and modify details once generation is complete..."
          rows={12}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none transition focus:border-teal-500 focus:bg-zinc-900/60 font-mono text-xs leading-relaxed disabled:opacity-50"
        />

        {/* Verification Check (Mandatory Constraint!) */}
        <div className="flex items-start gap-3 bg-zinc-900/20 p-4 rounded-xl border border-zinc-800">
          <input
            type="checkbox"
            id="reviewed-checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            disabled={isStreaming || !editorText.trim()}
            className="mt-1 h-4 w-4 rounded border-zinc-800 text-teal-500 bg-zinc-950 focus:ring-teal-500 cursor-pointer"
          />
          <label
            htmlFor="reviewed-checkbox"
            className="text-xs text-zinc-400 leading-relaxed cursor-pointer select-none"
          >
            I verify that I have clinically reviewed, corrected where necessary, and authorized the final contents of
            this SOAP note. AI drafts are not saved automatically.
          </label>
        </div>

        {saveStatus && (
          <div
            className={`rounded-xl border p-4 text-xs font-semibold ${
              saveStatus.success
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {saveStatus.message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isStreaming || isSaving || !reviewed || !editorText.trim()}
          className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black px-6 py-3 h-[46px] shadow transition disabled:opacity-50 flex items-center justify-center"
        >
          {isSaving ? "Finalizing Note..." : "Save SOAP Note"}
        </button>
      </div>
    </div>
  );
}
