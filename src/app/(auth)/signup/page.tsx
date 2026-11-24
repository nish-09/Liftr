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
    <div className="min-h-screen bg-[#B8D99A] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-12 h-12 rounded-xl bg-forest border-2 border-dark flex items-center justify-center text-lime shadow-neo group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-heading font-black text-4xl tracking-tight text-dark uppercase">
              Liftr
            </span>
          </Link>
          <h1 className="font-heading font-black text-2xl tracking-tight text-dark uppercase mt-1">
            Build Your Strength
          </h1>
          <p className="text-sm font-sans text-dark/70 mt-1">
            Join the precision progressive overload fitness platform.
          </p>
        </div>

        <div className="bg-cream border-3 border-dark rounded-xl p-8 shadow-neo-lg">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-forest text-lime border-2 border-dark flex items-center justify-center shadow-neo-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="font-heading font-black text-2xl text-dark tracking-tight">Check Your Email</h2>
              <p className="text-sm font-sans text-dark/80">
                We sent a confirmation link to verify your account. Once verified, you can sign in and start logging workouts.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 py-3 px-6 rounded-lg bg-lime hover:bg-lime/90 text-dark font-mono font-black uppercase text-xs tracking-wider border-2 border-dark shadow-neo transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-orange/20 border-2 border-orange text-dark text-xs font-mono font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-black text-dark mb-2">
                    Full Name / Handle
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    placeholder="Alex Rivera"
                    className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-black text-dark mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="athlete@liftr.app"
                    className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-black text-dark mb-2">
                    Password (Min 6 Characters)
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-6 rounded-lg bg-lime hover:bg-lime/90 text-dark font-mono font-black uppercase tracking-wider text-xs border-2 border-dark shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Liftr Account</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t-2 border-dark/15 text-center">
                <p className="text-xs font-sans text-dark/70 mb-3">
                  Already have an account?
                </p>
                <Link
                  href="/login"
                  className="text-xs font-mono uppercase font-black tracking-wider text-forest hover:text-dark underline"
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
