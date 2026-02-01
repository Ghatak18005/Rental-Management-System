"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react';
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "next-themes";
import { StaticNavbar } from "@/components/StaticNavbar";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setTheme, resolvedTheme } = useTheme(); // <--- Hook for theme

  // State
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 1. Initialization & Session Check
  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Invalid or expired reset link.");
          router.push("/forgot-password");
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Security verification failed.");
        router.push("/forgot-password");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router, supabase]);

  // 2. Validation
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/(?=.*[a-z])/.test(pwd)) return "Include at least one lowercase letter.";
    if (!/(?=.*[A-Z])/.test(pwd)) return "Include at least one uppercase letter.";
    if (!/(?=.*\d)/.test(pwd)) return "Include at least one number.";
    return null;
  };

  // 3. Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      toast.success("Password updated successfully!");

      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Loading State
  if (!mounted || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="opacity-50 text-sm font-medium animate-pulse">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex items-center justify-center p-4 relative">
      <StaticNavbar/>
      {/* ================= THEME TOGGLE (Floating Top Right) ================= */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 p-3 rounded-full bg-card border border-border shadow-lg text-foreground hover:text-primary hover:border-primary/50 transition-all z-50 group"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        ) : (
          <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />
        )}
      </button>

      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]"></div>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card border border-border shadow-2xl rounded-3xl p-8 md:p-10 backdrop-blur-xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Set New Password</h2>
            <p className="opacity-50 text-sm">Create a strong credentials to secure your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30 group-focus-within:text-primary group-focus-within:opacity-100 transition-all duration-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-accent/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:opacity-20 text-sm md:text-base font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 hover:text-foreground transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Requirements Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {['8+ Chars', 'A-Z', '0-9'].map((req) => (
                  <span key={req} className="inline-flex items-center px-2 py-1 rounded bg-accent/50 border border-border text-[9px] font-bold opacity-60 tracking-wide">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1 opacity-50" /> {req}
                  </span>
                ))}
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30 group-focus-within:text-primary group-focus-within:opacity-100 transition-all duration-300" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-accent/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:opacity-20 text-sm md:text-base font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 hover:text-foreground transition-all cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-primary/20 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating Credentials...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Update Password
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <button
              onClick={() => router.push('/login')}
              className="group flex items-center justify-center gap-2 text-sm text-primary font-bold hover:opacity-80 transition-all mx-auto"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}