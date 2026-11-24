"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Lock } from "lucide-react";
import { LiftrLogo } from "@/components/common/LiftrLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        router.push("/overview");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
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
            Set New Password
          </h1>
          <p className="text-sm text-[#142746]/70 mt-1 font-medium">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <div className="bg-white border-[1.5px] border-[#142746] rounded-3xl p-5 sm:p-7 shadow-neo-lg">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#F8C3B5] border-[1.5px] border-[#142746] text-[#142746] text-xs font-semibold">
              {error}
            </div>
          )}

          <form method="POST" action="#" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:ring-2 focus:ring-[#142746]/30 text-sm disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-[#8993A5] absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:ring-2 focus:ring-[#142746]/30 text-sm disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-[#8993A5] absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn w-full mt-2 py-3 px-6 rounded-xl bg-[#142746] hover:bg-[#1e3863] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save New Password</span>
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
