"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed?: boolean;
}

export function NavLink({ href, label, icon: Icon, collapsed }: NavLinkProps) {
  const pathname = usePathname();
  // Match exact match or child paths
  const isActive = pathname === href || (href !== "/dashboard" && href !== "/therapist/dashboard" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-xs font-black transition-all border-l-3 select-none outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        isActive
          ? "border-brand-teal text-teal-600 dark:text-teal-400 bg-teal-500/5 dark:bg-teal-500/10 font-black"
          : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
      )}
      aria-label={label}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      <span
        className={cn(
          "tracking-wide uppercase text-[10px]",
          collapsed ? "hidden" : "hidden lg:inline md:hidden sm:inline"
        )}
      >
        {label}
      </span>
    </Link>
  );
}
