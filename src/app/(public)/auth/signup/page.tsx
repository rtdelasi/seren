"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "therapist">("client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.error || "Failed to sign up");
        setLoading(false);
        return;
      }

      // Automatically sign in credentials on success
      const signinRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signinRes?.error) {
        setError("Account created, but sign-in failed. Please sign in manually.");
        setLoading(false);
        return;
      }

      if (role === "therapist") {
        router.push("/therapist/onboarding");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white">Create your Account</h1>
        <p className="text-xs text-zinc-400">Specify your account role to set up your workspace.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-red-400 text-center font-semibold animate-in fade-in duration-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-650 outline-none focus:border-teal-500 transition"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-650 outline-none focus:border-teal-500 transition"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-650 outline-none focus:border-teal-500 transition"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-bold text-zinc-400">Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`p-3 rounded-xl border text-xs font-bold transition select-none ${
                role === "client"
                  ? "bg-teal-500/10 text-white border-teal-500"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setRole("therapist")}
              className={`p-3 rounded-xl border text-xs font-bold transition select-none ${
                role === "therapist"
                  ? "bg-teal-500/10 text-white border-teal-500"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              Therapist
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black p-3 transition disabled:opacity-50 shadow-md"
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-[10px] text-zinc-550 font-semibold">
        Already have an account?{" "}
        <a href="/auth/signin" className="text-teal-400 hover:underline">
          Sign In
        </a>
      </p>
    </div>
  );
}
