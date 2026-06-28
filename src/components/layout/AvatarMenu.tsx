"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";

interface AvatarMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AvatarMenu({ user }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard accessibility listeners (Escape to close)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User profile settings"
      >
        <Avatar className="h-8 w-8 border border-zinc-900/60 dark:border-zinc-800">
          {user?.image && <AvatarImage src={user.image} alt={user.name || "User Avatar"} />}
          <AvatarFallback className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-black">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Custom Dropdown Container */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2.5 w-52 origin-top-right rounded-xl border border-zinc-900 bg-zinc-950 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          {/* User profile brief */}
          <div className="px-3 py-2 border-b border-zinc-900 text-left mb-1">
            <span className="block text-xs font-black text-white truncate">{user?.name || "Client User"}</span>
            <span className="block text-[10px] text-zinc-500 truncate mt-0.5">{user?.email}</span>
          </div>

          {/* Links list */}
          <div className="space-y-0.5">
            <a
              href="/profile"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition text-left"
            >
              <User className="h-3.5 w-3.5" />
              <span>Profile</span>
            </a>
            <a
              href="/settings"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition text-left"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              role="menuitem"
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition text-left outline-none"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
