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
    <div className="min-h-screen bg-[#B8D99A] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-forest border-2 border-dark flex items-center justify-center text-lime shadow-neo">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-heading font-black text-4xl tracking-tight text-dark uppercase">
              Liftr
            </span>
          </Link>
          <h1 className="font-heading font-black text-2xl tracking-tight text-dark uppercase mt-1">
            Reset Password
          </h1>
          <p className="text-sm font-sans text-dark/70 mt-1">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        <div className="bg-cream border-3 border-dark rounded-xl p-8 shadow-neo-lg">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-forest text-lime border-2 border-dark flex items-center justify-center shadow-neo-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="font-heading font-black text-2xl text-dark tracking-tight">Reset Link Sent</h2>
              <p className="text-sm font-sans text-dark/80">
                Check your inbox for password reset instructions.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 py-3 px-6 rounded-lg bg-lime hover:bg-lime/90 text-dark font-mono font-black uppercase text-xs tracking-wider border-2 border-dark shadow-neo transition-all"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-orange/20 border-2 border-orange text-dark text-xs font-mono font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase font-black text-dark mb-2">
                  Account Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="athlete@liftr.app"
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-lg bg-lime hover:bg-lime/90 text-dark font-mono font-black uppercase tracking-wider text-xs border-2 border-dark shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase font-bold text-dark/70 hover:text-dark transition-colors"
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
