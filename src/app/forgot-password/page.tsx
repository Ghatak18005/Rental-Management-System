"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send reset email");
        return;
      }

      setSubmitted(true);
      toast.success("Reset link sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 font-sans transition-colors duration-300">
      
      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]"></div>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card border border-border shadow-2xl rounded-3xl p-8 md:p-10 backdrop-blur-xl">
          
          {/* Header Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
              {submitted ? (
                <Mail className="h-7 w-7 text-primary animate-bounce" />
              ) : (
                <KeyRound className="h-7 w-7 text-primary" />
              )}
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              {submitted ? "Check your inbox" : "Forgot Password?"}
            </h2>
            
            <p className="opacity-50 text-sm leading-relaxed max-w-[80%] mx-auto">
              {submitted 
                ? <>We've sent a secure reset link to <span className="text-primary font-bold">{email}</span></>
                : "Enter your email address and we'll send you a link to reset your credentials."
              }
            </p>
          </div>

          {submitted ? (
            /* ================= SUBMITTED STATE ================= */
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-accent/30 border border-border rounded-2xl p-4 text-center">
                <p className="text-xs text-foreground/60 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" /> 
                  Link valid for 15 minutes
                </p>
              </div>

              <button 
                onClick={() => router.push('/login')}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
              >
                Back to Sign In
              </button>

              <button 
                onClick={() => setSubmitted(false)}
                className="w-full text-xs text-foreground/40 hover:text-primary transition-colors"
              >
                Didn't receive email? Try again
              </button>
            </div>
          ) : (
            /* ================= FORM STATE ================= */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30 group-focus-within:text-primary group-focus-within:opacity-100 transition-all duration-300" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-accent/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:opacity-20 text-sm md:text-base font-medium"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          {!submitted && (
            <div className="mt-8 pt-6 border-t border-border text-center">
              <Link 
                href="/login" 
                className="group flex items-center justify-center gap-2 text-sm text-foreground/60 hover:text-primary font-bold transition-all mx-auto"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}