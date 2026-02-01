"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { StaticNavbar } from "@/components/StaticNavbar";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const error = searchParams.get("error");
    const reset = searchParams.get("reset");

    if (error === "auth_failed") {
      toast.error("Authentication failed. Please try again.");
    }
    if (reset === "success") {
      toast.success("Password reset successfully! Please login.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. ADMIN BYPASS (Hardcoded Logic)
      if (formData.email === "admin@gmail.com" && formData.password === "admin123") {
        await new Promise((resolve) => setTimeout(resolve, 800));
        localStorage.setItem("isAdminAuthenticated", "true");
        toast.success("Welcome back, Admin!");
        router.push("/admin/dashboard");
        return;
      }

      // 2. SUPABASE AUTH
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 3. FETCH USER ROLE
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      toast.success("Login successful!");

      // Role-based redirection
      if (profile.role === "VENDOR") {
        router.push("/vendor/dashboard");
      } else if (profile.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      // Fixed the "Unexpected any" error by narrowing the type
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Login error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(errorMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 tracking-widest">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={formData.email}
                className="w-full pl-11 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="you@example.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Password
              </label>
              {/* Fixed the "size" error by removing it and using Tailwind classes */}
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={formData.password}
                className="w-full pl-11 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 bg-card text-muted-foreground font-semibold">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full border border-border py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-secondary/50 transition-all font-medium text-sm disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="h-5 w-5"
              alt="Google"
            />
          )}
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-8 relative z-10">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup/customer"
            className="text-primary hover:underline font-bold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

// Exported component with Suspense to prevent build errors
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
      <StaticNavbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}