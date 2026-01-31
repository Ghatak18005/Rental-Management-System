"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { StaticNavbar } from "@/components/StaticNavbar";

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

<<<<<<< HEAD
    // --- 1. CHECK FOR STATIC ADMIN CREDENTIALS ---
    // This allows the specific admin email/password to bypass Supabase
    if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set Admin Session Flag (Local Storage)
      // This is used by the Admin Dashboard to verify access
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminName', 'Super Admin');
      
      toast.success('Welcome back, Admin!');
      router.push('/admin/dashboard'); 
      setLoading(false);
      return; // Stop execution here
    }

    // --- 2. REGULAR USER LOGIN (SUPABASE) ---
    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
=======
        if (error === "auth_failed") {
            toast.error("Authentication failed. Please try again.");
        }
        if (reset === "success") {
            toast.success("Password reset successfully! Please login with your new password.");
        }
    }, [searchParams]);
>>>>>>> c1bcebd69d40974988875fed94353e83e687f4d7

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

<<<<<<< HEAD
      // Fetch User Role from 'public.users' to know WHERE to send them
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();
=======
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });
>>>>>>> c1bcebd69d40974988875fed94353e83e687f4d7

            if (authError) throw authError;

<<<<<<< HEAD
      // Conditional Redirect Logic
      toast.success("Login successful!");
      
      if (profile.role === "VENDOR") {
        router.push("/vendor/dashboard");
      } else if (profile.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
=======
            // Fetch the role from the public.users table
            const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("role")
                .eq("id", authData.user.id)
                .single();
>>>>>>> c1bcebd69d40974988875fed94353e83e687f4d7

            if (profileError) throw profileError;

            toast.success("Login successful! Redirecting...");

            // Role-based redirection
            if (profile.role === "VENDOR") {
                router.push("/vendor/dashboard");
            } else if (profile.role === "ADMIN") {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }

<<<<<<< HEAD
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                placeholder="you@example.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
=======
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
            console.error("Login error:", error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };
>>>>>>> c1bcebd69d40974988875fed94353e83e687f4d7

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

            if (error) throw error;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to sign in with Google";
            console.error("Google login error:", error);
            toast.error(message);
            setGoogleLoading(false);
        }
    };

    return (
        // flex-col stacks the Navbar and the Main content area
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
            <StaticNavbar />

            {/* main fills the remaining space and centers the card */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-8 relative overflow-hidden transition-all duration-300">

                    {/* Decorative Ambient Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center mb-8 relative z-10">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                        <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 tracking-widest">Email Address</label>
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

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Signing in...</>
                            ) : (
                                <><LogIn className="h-5 w-5" /> Sign In</>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="px-3 bg-card text-muted-foreground font-semibold">Or continue with</span></div>
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading || googleLoading}
                        className="w-full border border-border py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-secondary/50 transition-all font-medium text-sm disabled:opacity-50"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                        )}
                        {googleLoading ? "Connecting..." : "Continue with Google"}
                    </button>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-muted-foreground mt-8 relative z-10">
                        Dont have an account?{" "}
                        <Link href="/signup/customer" className="text-primary hover:underline font-bold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}