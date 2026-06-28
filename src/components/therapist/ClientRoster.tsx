import React from "react";
import AlertBadge from "./AlertBadge";

interface ClientRecord {
  id: string;
  name: string | null;
  email: string | null;
  hasActiveAlert: boolean;
  latestAlertReason: string | null;
  lastSessionDate: Date;
  lastSessionId: string;
}

interface ClientRosterProps {
  clients: ClientRecord[];
  therapistId: string;
}

export default function ClientRoster({ clients, therapistId }: ClientRosterProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-900 p-12 text-center bg-zinc-950/20">
        <span className="text-2xl">👥</span>
        <h3 className="text-sm font-bold text-zinc-300 mt-3">No Clients Found</h3>
        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
          Your client list will populate once users match with you and schedule therapy sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {clients.map((client) => {
        const formattedDate = new Date(client.lastSessionDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div
            key={client.id}
            className={`group relative overflow-hidden rounded-2xl border bg-zinc-950/40 p-5 transition hover:shadow-lg ${
              client.hasActiveAlert
                ? "border-rose-500/30 bg-rose-950/5 hover:border-rose-500/50"
                : "border-zinc-900 hover:border-zinc-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                {/* Meta details */}
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-zinc-200 group-hover:text-white transition-colors">
                    {client.name || "Anonymous Patient"}
                  </h3>
                  {client.hasActiveAlert && <AlertBadge />}
                </div>

                <p className="text-xs text-zinc-400 font-medium">
                  {client.email || "No contact email linked"}
                </p>

                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Last Session: <span className="text-zinc-400 font-semibold">{formattedDate}</span>
                </p>

                {client.hasActiveAlert && client.latestAlertReason && (
                  <div className="mt-2.5 rounded-lg border border-rose-500/10 bg-rose-950/20 p-3">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-0.5">
                      Flagged Warning Reason
                    </span>
                    <p className="text-xs text-rose-300 leading-relaxed font-medium">
                      {client.latestAlertReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2.5 self-start sm:self-center">
                <a
                  href={`/messages/${client.id}_${therapistId}`}
                  className="rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 px-4.5 py-2.5 text-xs font-black text-zinc-300 hover:text-white transition"
                >
                  Message
                </a>
                <a
                  href={`/therapist/sessions/${client.lastSessionId}/notes`}
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-4.5 py-2.5 text-xs font-black text-zinc-950 shadow transition"
                >
                  Write SOAP Notes
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
