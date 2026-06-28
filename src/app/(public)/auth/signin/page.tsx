"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        const roleRes = await fetch("/api/user/role");
        const data = await roleRes.json();
        if (data.role === "therapist") {
          router.push("/therapist/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white">Sign In to Seren</h1>
        <p className="text-xs text-zinc-400">Welcome back. Enter details to access your account.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-red-400 text-center font-semibold animate-in fade-in duration-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black p-3 transition disabled:opacity-50 shadow-md"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 border-t border-zinc-900" />
        <span className="relative bg-zinc-950 px-3 text-[10px] uppercase font-bold text-zinc-500">or</span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850 text-xs font-black p-3 transition flex items-center justify-center gap-2"
      >
        <span>Sign In with Google</span>
      </button>

      <p className="text-center text-[10px] text-zinc-550 font-semibold">
        Don't have an account?{" "}
        <a href="/auth/signup" className="text-teal-400 hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm mx-auto p-6 text-center text-xs text-zinc-500">
          Loading credentials...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
