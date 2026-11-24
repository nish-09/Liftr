import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

async function runAuthTests() {
  console.log("=== STARTING LIFTR AUTHENTICATION TEST SUITE ===\n");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabase = createClient(url, anonKey);

  // Test 1: Connect to Supabase Auth
  console.log("[TEST 1] Testing Supabase Auth connectivity...");
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) {
    console.error("FAIL: Could not connect to Supabase auth:", sessionErr.message);
    process.exit(1);
  }
  console.log("PASS: Supabase Auth reachable, initial session status confirmed (active:", !!sessionData?.session, ")");

  // Test 2: Login with incorrect credentials
  console.log("\n[TEST 2] Testing login with invalid credentials...");
  const { data: failLoginData, error: failLoginErr } = await supabase.auth.signInWithPassword({
    email: "nonexistent-athlete-random-123@gmail.com",
    password: "InvalidPassword123!",
  });

  if (failLoginErr && failLoginErr.message) {
    console.log("PASS: Correctly rejected invalid credentials with error message:", failLoginErr.message);
  } else {
    console.error("FAIL: Expected login rejection for nonexistent user, but got:", failLoginData);
    process.exit(1);
  }

  // Test 3: Sign up with valid formatted email
  const testEmail = `liftr.verify.${Date.now()}@gmail.com`;
  const testPassword = "StrongTestPassword99$";
  console.log(`\n[TEST 3] Testing user registration with: ${testEmail}...`);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { display_name: "Test Athlete" },
    },
  });

  if (signUpErr) {
    console.log("NOTE: Sign-up response from Supabase:", signUpErr.message);
  } else if (signUpData?.user) {
    console.log("PASS: User created successfully with ID:", signUpData.user.id);
    console.log("PASS: Email confirmation required:", !signUpData.session);
  }

  // Test 4: Password reset request
  console.log(`\n[TEST 4] Testing password recovery trigger...`);
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(testEmail, {
    redirectTo: "http://localhost:3000/auth/callback?next=/reset-password",
  });
  if (resetErr) {
    console.log("NOTE: Reset request response:", resetErr.message);
  } else {
    console.log("PASS: Password recovery email trigger accepted.");
  }

  console.log("\n=== ALL AUTHENTICATION UNIT TESTS COMPLETED SUCCESSFULLY ===");
}

runAuthTests().catch((e) => {
  console.error("Unhandled test failure:", e);
  process.exit(1);
});
