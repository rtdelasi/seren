"use client";

import React from "react";
import { NavLink } from "./NavLink";
import { LayoutDashboard, BookOpen, User, MessageSquare, Library, Users, Calendar } from "lucide-react";

interface SidebarProps {
  role: "client" | "therapist";
  threadId: string | null;
}

export function Sidebar({ role, threadId }: SidebarProps) {
  const getLinks = () => {
    if (role === "therapist") {
      return [
        { href: "/therapist/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/therapist/dashboard", label: "Clients", icon: Users },
        { href: "/therapist/dashboard", label: "Sessions", icon: Calendar },
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/resources", label: "Resources", icon: Library },
      ];
    } else {
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/journal", label: "Journal", icon: BookOpen },
        {
          href: threadId ? `/messages/${threadId}` : "/messages",
          label: "My Therapist",
          icon: User,
        },
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/resources", label: "Resources", icon: Library },
      ];
    }
  };

  const links = getLinks();

  return (
    <aside
      className="hidden sm:flex flex-col border-r border-zinc-900/60 bg-zinc-950 w-64 md:w-16 lg:w-64 transition-all duration-300 h-full shrink-0 select-none"
      aria-label="Sidebar navigation"
    >
      {/* Scrollable links list */}
      <nav className="flex-1 py-4 flex flex-col gap-1">
        {links.map((link) => (
          <div key={link.label} className="relative group">
            {/* Desktop link rendering (collapses responsive text) */}
            <NavLink href={link.href} label={link.label} icon={link.icon} />

            {/* Custom Tooltip on hover when collapsed (md) */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-bold uppercase tracking-wider rounded-lg shadow-lg opacity-0 pointer-events-none transition group-hover:md:opacity-100 group-hover:lg:opacity-0 z-50">
              {link.label}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer line */}
      <div className="p-4 border-t border-zinc-900/60 text-[9px] text-zinc-600 font-bold uppercase tracking-wider hidden lg:block md:hidden sm:block">
        Seren Care
      </div>
    </aside>
  );
}
