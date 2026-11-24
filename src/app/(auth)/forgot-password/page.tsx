"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth/actions";
import { Dumbbell, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await forgotPassword(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-liftr-yellow flex items-center justify-center text-black shadow-neo">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="font-serif italic text-4xl tracking-tight text-liftr-white">
              Liftr
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Reset Password
          </h1>
          <p className="text-sm text-liftr-grey mt-1">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        <div className="bento-card p-8 shadow-neo border-border">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-liftr-yellow/20 text-liftr-yellow flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Reset Link Sent</h2>
              <p className="text-sm text-liftr-grey">
                Check your inbox for password reset instructions.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 py-3 px-6 rounded-lg bg-liftr-purple text-white font-medium text-sm shadow-neo"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-lg bg-liftr-coral/15 border border-liftr-coral/30 text-liftr-coral text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-liftr-grey mb-2">
                  Account Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="athlete@liftr.app"
                  className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-yellow focus:ring-1 focus:ring-liftr-yellow font-sans transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-lg bg-liftr-yellow hover:bg-liftr-yellow-light text-black font-semibold text-sm shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase text-liftr-grey hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
