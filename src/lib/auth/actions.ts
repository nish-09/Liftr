"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface AuthResponse {
  error?: string | null;
  success?: boolean;
}

function getSafeAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function signUp(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string)?.trim().slice(0, 80);

  if (!email || !password || password.length < 6 || password.length > 128) {
    return { error: "Valid email and a password between 6 and 128 characters are required." };
  }

  const appUrl = getSafeAppUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
      emailRedirectTo: `${appUrl}/auth/callback?next=/overview`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signIn(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid login credentials." };
  }

  revalidatePath("/", "layout");
  redirect("/overview");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPassword(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Valid email is required." };
  }

  const appUrl = getSafeAppUrl();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  // Always return generic success to avoid email enumeration
  return { success: true };
}

export async function resetPassword(formData: FormData): Promise<AuthResponse> {
  const password = formData.get("password") as string;
  if (!password || password.length < 6 || password.length > 128) {
    return { error: "Password must be between 6 and 128 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Active recovery session required." };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/overview");
}

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
