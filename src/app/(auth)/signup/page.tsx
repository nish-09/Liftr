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

      if (data?.session) {
        router.push("/overview");
        router.refresh();
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during account creation.";
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
            Create your account
          </h1>
        </div>

        <div className="bg-white border-[1.5px] border-[#142746] rounded-3xl p-5 sm:p-7 shadow-neo-lg">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#BDF7B6] text-[#142746] border-[1.5px] border-[#142746] flex items-center justify-center shadow-neo-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h2 className="font-heading font-extrabold text-xl text-[#142746]">
                Check Your Email
              </h2>
              <p className="text-sm text-[#8993A5]">
                We sent a confirmation link to verify your account. Once verified, you can sign in and start logging workouts.
              </p>
              <Link
                href="/login"
                className="neo-btn inline-block mt-2 py-2.5 px-6 rounded-xl bg-[#E9FF91] text-[#142746] font-heading font-bold text-xs"
              >
                Go to Sign In
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
                  className="w-full px-4 py-3 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:ring-2 focus:ring-[#142746]/30 text-sm disabled:opacity-50"
                />
              </div>

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
                  placeholder="alex@athlete.io"
                  className="w-full px-4 py-3 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:ring-2 focus:ring-[#142746]/30 text-sm disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">Password</label>
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
                    <span>Create Athlete Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 pt-5 border-t border-[#142746]/15 text-center">
              <p className="text-xs text-[#8993A5] mb-3">Already tracking your lifts?</p>
              <Link
                href="/login"
                className="neo-btn inline-block w-full py-2.5 px-4 rounded-xl bg-[#E9FF91] text-[#142746] text-xs font-heading font-bold text-center"
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
