"use client";

import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AvatarMenu } from "./AvatarMenu";
import { MobileDrawer } from "./MobileDrawer";
import { Bell } from "lucide-react";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  role: "client" | "therapist";
  threadId: string | null;
}

export function Navbar({ user, role, threadId }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-900/60 bg-zinc-950 px-4 sm:px-6 shadow-sm select-none">
      {/* Mobile drawer hamburger menu + Brand Wordmark */}
      <div className="flex items-center gap-3">
        <MobileDrawer role={role} threadId={threadId} />
        
        <a href={role === "therapist" ? "/therapist/dashboard" : "/dashboard"} className="outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg">
          <span className="text-sm font-black tracking-widest text-teal-400 uppercase">
            SEREN
          </span>
        </a>
      </div>

      {/* Action items on the right side */}
      <div className="flex items-center gap-4">
        {/* UI-only notification bell */}
        <button
          className="relative rounded-xl p-2.5 text-zinc-400 hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          aria-label="View notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {/* Subtle unread dot */}
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Avatar Dropdown Menu */}
        <AvatarMenu user={user} />
      </div>
    </header>
  );
}
