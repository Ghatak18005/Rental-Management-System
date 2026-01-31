"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Building2, FileText, Send, CheckCircle2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function VendorSignup() {
  const router = useRouter();
  const supabase = createClient();

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

    if (!formData.company_name || !formData.gstin) {
      toast.error("Company Name and GSTIN are required for Vendors.");
      setLoading(false);
      return;
    }

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
          role: "VENDOR",
          company_name: formData.company_name,
          gstin: formData.gstin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      toast.success("Vendor account created!");

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        toast.error("Account created. Please sign in manually.");
        router.push("/login");
      } else {
        toast.success("Welcome aboard! Redirecting...");
        router.push("/vendor/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?role=VENDOR`,
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 font-sans selection:bg-primary/30">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-2xl p-8 relative overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Building2 className="h-3 w-3" /> Vendor Portal
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Business Registration</h2>
          <p className="text-foreground/40 text-sm mt-2">Create your vendor profile to start selling</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Contact Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <input name="name" required value={formData.name} onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John Doe" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Business Details</label>
                <div className="flex flex-col gap-3">
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input name="company_name" required value={formData.company_name} onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Company Name" />
                  </div>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input name="gstin" required value={formData.gstin} onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="GSTIN Number" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Login Credentials</label>
                <div className="flex flex-col gap-3">
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="biz@email.com" />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} 
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Verify Email</>}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="px-2 bg-card text-foreground/30 font-bold">Quick Access</span></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="w-full border border-border py-2.5 rounded-xl flex items-center justify-center gap-3 hover:bg-secondary transition-all font-medium text-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google" />
              Sign up as Vendor
            </button>
          </form>
        ) : (
          <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center p-6 bg-secondary/30 rounded-2xl border border-border">
                <p className="text-foreground/60 text-sm mb-1">Enter code sent to</p>
                <p className="font-bold text-primary truncate">{formData.email}</p>
            </div>
            
            <input type="text" placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
              className="w-full p-4 bg-secondary border border-border rounded-xl text-center text-3xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            
            <button onClick={handleVerifyAndSignup} disabled={loading || otp.length < 6} 
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Launch Dashboard</>}
            </button>

            <button onClick={() => setStep(1)} className="w-full text-xs text-foreground/40 hover:text-foreground transition-colors underline">
              Back to registration
            </button>
          </div>
        )}

        <p className="text-center text-sm text-foreground/40 mt-8 relative z-10">
          Already registered?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}