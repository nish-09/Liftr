"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, ArrowRight, ShieldCheck, Flame } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prevent already-authenticated users from staying on the login page
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
    <div className="min-h-screen bg-[#B8D99A] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
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
            Welcome Back
          </h1>
          <p className="text-sm font-sans text-dark/70 mt-1">
            Progressive overload. Data-driven athletic performance.
          </p>
        </div>

        {/* Bento Login Card */}
        <div className="bg-cream border-3 border-dark rounded-xl p-8 shadow-neo-lg">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-orange/20 border-2 border-orange text-dark text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form strictly uses method="POST" and action="#" to guarantee credentials never leak to URL */}
          <form method="POST" action="#" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase font-black text-dark mb-2">
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
                className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono uppercase font-black text-dark">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-mono font-bold text-forest hover:text-dark underline"
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
                className="w-full px-4 py-3 rounded-lg bg-white border-2 border-dark text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-forest font-sans shadow-neo-sm text-sm disabled:opacity-50"
              />
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
                  <span>Sign In to Liftr</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Create Account link */}
          <div className="mt-6 pt-6 border-t-2 border-dark/15 text-center">
            <p className="text-xs font-sans text-dark/70 mb-3">
              Don&apos;t have an account yet?
            </p>
            <Link
              href="/signup"
              className="inline-block w-full py-2.5 px-4 rounded-lg bg-white hover:bg-cream border-2 border-dark text-dark text-xs font-mono font-black uppercase tracking-wider text-center shadow-neo-sm transition-all cursor-pointer"
            >
              Create An Account
            </Link>
          </div>
        </div>

        {/* Brand Perks Pill */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-dark/80 font-mono font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-forest text-cream border-2 border-dark shadow-neo-sm">
            <ShieldCheck className="w-4 h-4 text-lime stroke-[2.5]" />
            <span>RLS Isolated</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-forest text-cream border-2 border-dark shadow-neo-sm">
            <Flame className="w-4 h-4 text-orange stroke-[2.5]" />
            <span>Double Progression</span>
          </div>
        </div>
      </div>
    </div>
  );
}
