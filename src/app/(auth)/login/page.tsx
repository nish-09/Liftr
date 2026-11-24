"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import { LiftrLogo } from "@/components/common/LiftrLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/overview");
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("invalid login credentials") ||
          authError.message.toLowerCase().includes("invalid grant")
        ) {
          setError("Invalid email or password. Please verify your credentials or create an account.");
        } else if (authError.message.toLowerCase().includes("email not confirmed")) {
          setError("Email not verified yet. Please check your inbox for the confirmation link.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        router.push("/overview");
        router.refresh();
      } else {
        setError("Unable to initialize session. Please try again.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected authentication error occurred.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#EBCBF7] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <div className="px-4 py-2 rounded-2xl bg-[#BDF7B6] border-[1.5px] border-[#142746]">
              <LiftrLogo className="h-7 w-auto" symbolColor="#142746" textColor="#142746" />
            </div>
          </Link>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight text-[#142746]">
            Welcome back
          </h1>
        </div>

        <div className="bg-white border-[1.5px] border-[#142746] rounded-3xl p-5 sm:p-7 shadow-neo-lg">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#F8C3B5] border-[1.5px] border-[#142746] text-[#142746] text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#142746] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form method="POST" action="#" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Email Address
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#142746]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#142746] underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:ring-2 focus:ring-[#142746]/30 text-sm disabled:opacity-50"
              />
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
                  <span>Sign In to Liftr</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#142746]/15 text-center">
            <p className="text-xs text-[#8993A5] mb-3">Don&apos;t have an account yet?</p>
            <Link
              href="/signup"
              className="neo-btn inline-block w-full py-2.5 px-4 rounded-xl bg-[#E9FF91] text-[#142746] text-xs font-heading font-bold text-center"
            >
              Create An Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
