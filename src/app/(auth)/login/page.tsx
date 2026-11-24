"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
import { Dumbbell, ArrowRight, ShieldCheck, Flame } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signIn(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Editorial Decorative Background Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-liftr-purple/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-liftr-yellow/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-xl bg-liftr-purple flex items-center justify-center text-white shadow-neo group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="font-serif italic text-4xl tracking-tight text-liftr-white">
              Liftr
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Welcome Back
          </h1>
          <p className="text-sm text-liftr-grey mt-1">
            Progressive overload. Data-driven strength.
          </p>
        </div>

        {/* Bento Login Card */}
        <div className="bento-card p-8 shadow-neo border-border">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-liftr-coral/15 border border-liftr-coral/30 text-liftr-coral text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-liftr-coral animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-liftr-grey mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="athlete@liftr.app"
                className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-purple focus:ring-1 focus:ring-liftr-purple font-sans transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono tracking-wider uppercase text-liftr-grey">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-liftr-purple hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-purple focus:ring-1 focus:ring-liftr-purple font-sans transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white font-medium text-sm shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Liftr</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Preview Note */}
          <div className="mt-6 pt-6 border-t border-[#232323] text-center">
            <p className="text-xs text-liftr-grey mb-3">
              Don&apos;t have an account yet?
            </p>
            <Link
              href="/signup"
              className="inline-block w-full py-2.5 px-4 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#2c2c2c] text-white text-xs font-mono uppercase tracking-wider text-center transition-all"
            >
              Create An Account
            </Link>
          </div>
        </div>

        {/* Brand Perks Pill */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-liftr-grey font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-liftr-green" />
            <span>RLS Isolated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-liftr-coral" />
            <span>Double Progression</span>
          </div>
        </div>
      </div>
    </div>
  );
}
