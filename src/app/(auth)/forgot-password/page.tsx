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

      if (resetError && resetError.status === 429) {
        setError("Too many reset requests. Please wait a moment and try again.");
        setLoading(false);
      } else {
        // Avoid exposing whether an account exists for the entered email
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
    <div className="min-h-screen bg-[#EBCBF7] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <div className="px-4 py-2.5 rounded-2xl bg-[#BDF7B6] border-[1.5px] border-[#142746] shadow-neo-sm">
              <LiftrLogo className="h-8 w-auto" symbolColor="#142746" textColor="#142746" />
            </div>
          </Link>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight text-[#142746]">
            Reset Password
          </h1>
          <p className="text-sm text-[#142746]/70 mt-1 font-medium">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        <div className="bg-white border-[1.5px] border-[#142746] rounded-3xl p-5 sm:p-7 shadow-neo-lg">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#BDF7B6] text-[#142746] border-[1.5px] border-[#142746] flex items-center justify-center shadow-neo-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h2 className="font-heading font-extrabold text-xl text-[#142746]">
                Reset Link Sent
              </h2>
              <p className="text-sm text-[#8993A5]">
                Check your inbox for password recovery instructions.
              </p>
              <Link
                href="/login"
                className="neo-btn inline-block mt-2 py-2.5 px-6 rounded-xl bg-[#E9FF91] text-[#142746] font-heading font-bold text-xs"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form method="POST" action="#" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-[#F8C3B5] border-[1.5px] border-[#142746] text-[#142746] text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
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
                  className="w-full px-4 py-3 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:ring-2 focus:ring-[#142746]/30 text-sm disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn w-full py-3 px-6 rounded-xl bg-[#142746] hover:bg-[#1e3863] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#142746]/15 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142746] underline"
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
