import React from "react";

interface TherapistCardProps {
  therapist: {
    id: string;
    name: string;
    image?: string | null;
    specialties: string[];
    languages: string[];
    acceptingClients: boolean;
    avgRating: number;
    pricePerSession: number;
    bio: string;
  };
  score: number;
  reason: string;
}

export default function TherapistCard({ therapist, score, reason }: TherapistCardProps) {
  // Select color schemes based on the matching score
  const getScoreColor = (s: number) => {
    if (s >= 90) {
      return "from-emerald-500 to-teal-500 text-emerald-500";
    }
    if (s >= 75) {
      return "from-blue-500 to-indigo-500 text-blue-400";
    }
    return "from-amber-500 to-orange-500 text-amber-500";
  };

  const getAiBoxClass = (s: number) => {
    if (s >= 90) {
      return "bg-emerald-500/5 border-emerald-500/20 text-emerald-200/90";
    }
    if (s >= 75) {
      return "bg-blue-500/5 border-blue-500/20 text-blue-200/90";
    }
    return "bg-amber-500/5 border-amber-500/20 text-amber-200/90";
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)]">
      {/* Background radial gradient overlay on hover */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.08),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top section: Avatar, Info, and Match Score */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Therapist Avatar */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-zinc-800 bg-zinc-900">
            {therapist.image ? (
              <img src={therapist.image} alt={therapist.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-zinc-400">
                {therapist.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-zinc-100 transition-colors group-hover:text-white">
              {therapist.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* Rating */}
              <div className="flex items-center text-amber-400">
                <span className="text-sm font-semibold mr-1">{therapist.avgRating.toFixed(2)}</span>
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              <span className="text-zinc-700">•</span>

              {/* Client acceptance status */}
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  therapist.acceptingClients
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                }`}
              >
                {therapist.acceptingClients ? "Accepting Clients" : "Waitlist"}
              </span>
            </div>
          </div>
        </div>

        {/* Circular Match score indicator */}
        <div className="flex items-center gap-2 self-start rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 shadow-inner">
          <span className={`text-base font-extrabold leading-none ${getScoreColor(score)}`}>{score}%</span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Match</span>
        </div>
      </div>

      {/* Specialties & Languages tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {therapist.specialties.map((spec) => (
          <span
            key={spec}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300"
          >
            {spec}
          </span>
        ))}
        {therapist.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-lg bg-zinc-900/40 border border-zinc-800/40 px-2.5 py-1 text-xs text-zinc-400"
          >
            🗣️ {lang}
          </span>
        ))}
      </div>

      {/* Biography */}
      <p className="mt-4 text-sm leading-relaxed text-zinc-400">{therapist.bio}</p>

      {/* AI Reasoning Block */}
      <div className={`mt-4 rounded-xl border p-4 ${getAiBoxClass(score)}`}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="h-4 w-4 stroke-current opacity-80" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.795H13.62l.812-5.109L5.452 15.904h4.361z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">AI Match Insights</span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-300">{reason}</p>
      </div>

      {/* Pricing / Booking footer */}
      <div className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Price per session</span>
          <span className="text-base font-extrabold text-zinc-200 mt-0.5">
            ${therapist.pricePerSession} <span className="text-xs font-normal text-zinc-500">/ session</span>
          </span>
        </div>

        <button className="rounded-xl bg-teal-500/10 border border-teal-500/20 px-4 py-2 text-xs font-bold text-teal-400 transition hover:bg-teal-500 hover:text-zinc-950">
          Request Session
        </button>
      </div>
    </div>
  );
}
