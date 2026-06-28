import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between select-none">
      {/* Brand logo header */}
      <header className="flex h-16 w-full items-center border-b border-zinc-900/60 bg-zinc-950 px-4 sm:px-6">
        <span className="text-sm font-black tracking-widest text-teal-400 uppercase">
          SEREN
        </span>
      </header>

      {/* Main page container */}
      <main className="flex-1 flex flex-col justify-center bg-zinc-900/10">
        {children}
      </main>

      {/* Footer copyright */}
      <footer className="py-4 border-t border-zinc-900/60 text-center text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
        Seren Care Network © 2026
      </footer>
    </div>
  );
}
