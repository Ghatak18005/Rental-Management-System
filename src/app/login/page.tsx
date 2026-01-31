"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
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
      toast.success("Password reset successfully! Please login with your new password.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      toast.success("Login successful! Redirecting...");
      
      if (profile.role === "VENDOR") {
        router.push("/vendor/dashboard");
      } else if (profile.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      
      if (error) {
        toast.error(error.message || "Failed to sign in with Google");
        setGoogleLoading(false);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    // 1. Page Background
    <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
      
      {/* 2. Card Container */}
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-xl p-8 transition-colors duration-300">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-2 text-foreground">Welcome Back</h2>
        <p className="text-center text-foreground/60 mb-8">Sign in to your account</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
              <input
                type="email"
                required
                value={formData.email}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                placeholder="you@example.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
              <input
                type="password"
                required
                value={formData.password}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div></div>
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            {/* Note: 'bg-card' here ensures the line doesn't cut through the text background */}
            <span className="px-2 bg-card text-foreground/50">Or continue with</span>
          </div>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full bg-card border border-border py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-accent hover:text-accent-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-foreground/60" />
          ) : (
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
          )}
          <span className="font-medium text-foreground/80">
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </span>
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-foreground/60 mt-6">
          Dont have an account?{" "}
          <Link href="/signup/customer" className="text-primary hover:text-primary/80 font-bold hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}