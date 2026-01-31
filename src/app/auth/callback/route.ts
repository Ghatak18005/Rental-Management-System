import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Default role is only used if they end up needing to Sign Up (Onboarding)
  const role = requestUrl.searchParams.get("role") || "CUSTOMER";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Check existing profile in 'public.users'
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        // --- DYNAMIC REDIRECT LOGIC ---
        // Profile exists, send to their specific dashboard
        if (profile.role === 'VENDOR') {
          return NextResponse.redirect(`${requestUrl.origin}/vendor/dashboard`);
        } else if (profile.role === 'ADMIN') {
          return NextResponse.redirect(`${requestUrl.origin}/admin/dashboard`);
        } else {
          // Default for CUSTOMER
          return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
        }
      } else {
        // No profile found -> Send to Onboarding
        // Pass the role param so onboarding knows what they initially intended to be (if applicable)
        return NextResponse.redirect(`${requestUrl.origin}/onboarding?role=${role}`);
      }
    }
  }

  // If something went wrong (no code, error exchange, etc.)
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
}
