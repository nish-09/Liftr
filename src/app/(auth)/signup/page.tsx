"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LiftrLogo } from "@/components/common/LiftrLogo";

export default function SignUpPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent already-authenticated users from staying on signup page
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
    const trimmedName = displayName.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            display_name: trimmedName || trimmedEmail.split("@")[0],
          },
          emailRedirectTo: `${origin}/auth/callback?next=/overview`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If user was auto-confirmed (session generated immediately)
      if (data?.session) {
        router.push("/overview");
        router.refresh();
      } else {
        // Confirmation email dispatched
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during account creation.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4 group">
            <LiftrLogo className="h-11 w-auto group-hover:scale-[1.02] transition-transform" />
          </Link>
          <h1 className="font-heading font-black text-2xl tracking-tight text-[#171717] uppercase mt-1">
            Build Your Strength
          </h1>
          <p className="text-sm font-sans text-[#171717]/70 mt-1">
            Join the precision progressive overload fitness platform.
          </p>
        </div>

        <div className="bg-white border-2 border-[#171717] rounded-xl p-8 shadow-neo-lg">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#3155F5] text-[#E9F56A] border-2 border-[#171717] flex items-center justify-center shadow-neo-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="font-heading font-black text-2xl text-[#171717] tracking-tight">Check Your Email</h2>
              <p className="text-sm font-sans text-[#171717]/80">
                We sent a confirmation link to verify your account. Once verified, you can sign in and start logging workouts.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 py-3 px-6 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] font-mono font-black uppercase text-xs tracking-wider border-2 border-[#171717] shadow-neo transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form method="POST" action="#" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-[#FF7043]/15 border-2 border-[#FF7043] text-[#171717] text-xs font-mono font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-2">
                  Athlete Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  autoComplete="name"
                  disabled={loading}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Hunter"
                  className="w-full px-4 py-3 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans shadow-neo-sm text-sm disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-2">
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
                  placeholder="alex@athlete.io"
                  className="w-full px-4 py-3 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans shadow-neo-sm text-sm disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans shadow-neo-sm text-sm disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white font-mono font-black uppercase tracking-wider text-xs border-2 border-[#171717] shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Athlete Account</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 pt-6 border-t-2 border-[#171717]/15 text-center">
              <p className="text-xs font-sans text-[#171717]/70 mb-3">
                Already tracking your lifts?
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-2.5 px-4 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] border-2 border-[#171717] text-[#171717] text-xs font-mono font-black uppercase tracking-wider text-center shadow-neo-sm transition-all cursor-pointer"
              >
                Sign In Instead
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
