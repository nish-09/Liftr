import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pathname = request.nextUrl.pathname;
  const isPublicAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");
  const isResetPasswordRoute = pathname.startsWith("/reset-password");
  const isAuthCallback = pathname.startsWith("/auth/callback");

  // Fail closed if Supabase env configuration is missing or placeholder
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("placeholder")
  ) {
    if (!isPublicAuthRoute && !isAuthCallback) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validate session against Supabase Auth server (not trusting unverified cookies alone)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users away from login/signup/forgot-password, but allow /reset-password
  if (user && isPublicAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/overview";
    return NextResponse.redirect(url);
  }

  // Require valid authenticated user for all protected dashboard routes and /reset-password
  if (!user && !isPublicAuthRoute && !isAuthCallback) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (!isResetPasswordRoute && pathname !== "/") {
      url.searchParams.set("redirectedFrom", pathname);
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
