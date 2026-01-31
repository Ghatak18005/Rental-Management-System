"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Send, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CustomerSignup() {
  const router = useRouter();
  const supabase = createClient();

  // Steps: 1 = Details, 2 = OTP Verification
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    gstin: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setStep(2);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
          password: formData.password,
          name: formData.name,
          role: "CUSTOMER",
          company_name: null,
          gstin: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully!");

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        toast.error("Auto-login failed. Please sign in manually.");
        router.push("/login");
      } else {
        toast.success("Welcome! Redirecting...");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?role=CUSTOMER`,
        },
      });
      if (error) toast.error(error.message);
    } catch (error: any) {
      toast.error("Google signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 font-sans selection:bg-primary/30">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-2xl p-8 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <div className={`h-2 w-12 rounded-full mx-1 transition-all duration-500 ${step === 1 ? 'bg-primary' : 'bg-primary/20'}`} />
            <div className={`h-2 w-12 rounded-full mx-1 transition-all duration-500 ${step === 2 ? 'bg-primary' : 'bg-primary/20'}`} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="text-foreground/40 text-sm mt-2">Join us as a valued customer</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <input 
                    name="name" 
                    required 
                    value={formData.name}
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" 
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" 
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    value={formData.password}
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Continue</>}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-card text-foreground/30 font-semibold tracking-tighter">Secure Social Signup</span></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="w-full border border-border py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-secondary/80 transition-all font-medium">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
              Sign up with Google
            </button>
          </form>
        ) : (
          <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <p className="text-foreground/60 text-sm">We've sent a 6-digit code to</p>
                <p className="font-semibold text-foreground">{formData.email}</p>
            </div>
            
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-4 bg-secondary/50 border border-border rounded-xl text-center text-3xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
            
            <button 
              onClick={handleVerifyAndSignup} 
              disabled={loading || otp.length < 6} 
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Complete Signup</>}
            </button>

            <button 
              onClick={() => setStep(1)} 
              className="w-full text-xs text-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-1"
            >
              Edit email address
            </button>
          </div>
        )}

        <p className="text-center text-sm text-foreground/40 mt-8 relative z-10">
          Already a member?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}