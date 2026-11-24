"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth/actions";
import { Dumbbell, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signUp(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-liftr-purple/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-liftr-green/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-xl bg-liftr-green flex items-center justify-center text-black shadow-neo group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="font-serif italic text-4xl tracking-tight text-liftr-white">
              Liftr
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Build Your Strength
          </h1>
          <p className="text-sm text-liftr-grey mt-1">
            Join the precision progressive overload fitness platform.
          </p>
        </div>

        <div className="bento-card p-8 shadow-neo border-border">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-liftr-green/20 text-liftr-green flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Check Your Email</h2>
              <p className="text-sm text-liftr-grey">
                We sent a confirmation link to verify your account. Once verified, you can sign in and start logging workouts.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 py-3 px-6 rounded-lg bg-liftr-purple text-white font-medium text-sm shadow-neo"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-liftr-coral/15 border border-liftr-coral/30 text-liftr-coral text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-liftr-coral animate-pulse" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-liftr-grey mb-2">
                    Full Name / Handle
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    placeholder="Alex Rivera"
                    className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-green focus:ring-1 focus:ring-liftr-green font-sans transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-liftr-grey mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="athlete@liftr.app"
                    className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-green focus:ring-1 focus:ring-liftr-green font-sans transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-liftr-grey mb-2">
                    Password (Min 6 Characters)
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-green focus:ring-1 focus:ring-liftr-green font-sans transition-all text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-6 rounded-lg bg-liftr-green hover:bg-liftr-green-light text-black font-semibold text-sm shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Liftr Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#232323] text-center">
                <p className="text-xs text-liftr-grey mb-3">
                  Already have an account?
                </p>
                <Link
                  href="/login"
                  className="text-xs font-mono uppercase tracking-wider text-liftr-purple hover:underline"
                >
                  Sign In Instead
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
