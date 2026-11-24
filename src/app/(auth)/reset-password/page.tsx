"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { Dumbbell, ArrowRight, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await resetPassword(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-liftr-purple flex items-center justify-center text-white shadow-neo">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="font-serif italic text-4xl tracking-tight text-liftr-white">
              Liftr
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Set New Password
          </h1>
          <p className="text-sm text-liftr-grey mt-1">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <div className="bento-card p-8 shadow-neo border-border">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-liftr-coral/15 border border-liftr-coral/30 text-liftr-coral text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-liftr-grey mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-purple focus:ring-1 focus:ring-liftr-purple font-sans transition-all text-sm"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white font-medium text-sm shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Password & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
