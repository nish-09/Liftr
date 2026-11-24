"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { LiftrLogo } from "@/components/common/LiftrLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
      } else {
        setSent(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <LiftrLogo className="h-11 w-auto" />
          </Link>
          <h1 className="font-heading font-black text-2xl tracking-tight text-[#171717] uppercase mt-1">
            Reset Password
          </h1>
          <p className="text-sm font-sans text-[#171717]/70 mt-1">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        <div className="bg-white border-2 border-[#171717] rounded-xl p-8 shadow-neo-lg">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#3155F5] text-[#E9F56A] border-2 border-[#171717] flex items-center justify-center shadow-neo-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="font-heading font-black text-2xl text-[#171717] tracking-tight">Reset Link Sent</h2>
              <p className="text-sm font-sans text-[#171717]/80">
                Check your inbox for password recovery instructions.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 py-3 px-6 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] font-mono font-black uppercase text-xs tracking-wider border-2 border-[#171717] shadow-neo transition-all"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form method="POST" action="#" onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-[#FF7043]/15 border-2 border-[#FF7043] text-[#171717] text-xs font-mono font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-2">
                  Account Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@liftr.app"
                  className="w-full px-4 py-3 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans shadow-neo-sm text-sm disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white font-mono font-black uppercase tracking-wider text-xs border-2 border-[#171717] shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t-2 border-[#171717]/15 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#3155F5] hover:text-[#171717] underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
