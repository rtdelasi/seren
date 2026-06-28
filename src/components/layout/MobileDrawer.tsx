"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NavLink } from "./NavLink";
import { Menu, LayoutDashboard, BookOpen, User, MessageSquare, Library, Users, Calendar } from "lucide-react";

interface MobileDrawerProps {
  role: "client" | "therapist";
  threadId: string | null;
}

export function MobileDrawer({ role, threadId }: MobileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="rounded-xl p-2.5 text-zinc-400 hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:hidden transition"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[260px] bg-zinc-950 border-r border-zinc-900/60 p-4 text-zinc-150 flex flex-col justify-between">
        <div className="space-y-6">
          <SheetHeader className="text-left border-b border-zinc-900 pb-4">
            <SheetTitle className="text-sm font-black tracking-widest text-teal-400 uppercase">
              SEREN
            </SheetTitle>
          </SheetHeader>

          {/* Navigation Links Grid */}
          <nav className="flex flex-col gap-1.5" onClick={() => setIsOpen(false)}>
            {links.map((link) => (
              <NavLink
                key={link.label}
                href={link.href}
                label={link.label}
                icon={link.icon}
                collapsed={false}
              />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="text-[9px] text-zinc-650 font-bold uppercase tracking-widest pt-4 border-t border-zinc-900">
          Seren Care Network © 2026
        </div>
      </SheetContent>
    </Sheet>
  );
}
