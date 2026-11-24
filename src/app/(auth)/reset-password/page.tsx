"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, ArrowRight, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    if (!password || password.length < 6) {
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
            Set New Password
          </h1>
          <p className="text-sm font-sans text-dark/70 mt-1">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <div className="bg-cream border-3 border-dark rounded-xl p-8 shadow-neo-lg">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-orange/20 border-2 border-orange text-dark text-xs font-mono font-bold">
              {error}
            </div>
          )}

          <form method="POST" action="#" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase font-black text-dark mb-2">
                New Password
              </label>
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
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-dark/40 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-black text-dark mb-2">
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
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-dark/40 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-lg bg-lime hover:bg-lime/90 text-dark font-mono font-black uppercase tracking-wider text-xs border-2 border-dark shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Password &amp; Continue</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
