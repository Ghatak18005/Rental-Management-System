"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; 
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Building2, FileText, Send, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function VendorSignup() {
  const router = useRouter();
  const supabase = createClient();
  
  // Steps: 1 = Details, 2 = OTP Verification
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "", // Mandatory for Vendor [cite: 32]
    gstin: "",        // Mandatory for Vendor [cite: 33]
  });

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Send OTP Flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
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
      console.error(error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP & Create User
  // Updated handleVerifyAndSignup for app/signup/vendor/page.tsx (and Customer page)

const handleVerifyAndSignup = async () => {
  setLoading(true);

  try {
    const res = await fetch("/api/auth/verify-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        otp: otp, // The OTP entered by user
        password: formData.password,
        name: formData.name,
        role: "VENDOR", // Change to "CUSTOMER" for the customer page
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

    toast.success("Account created successfully! Logging you in...");

    // Success! Log the user in automatically
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (loginError) {
      toast.error("Account created, but auto-login failed. Please sign in manually.");
      router.push("/login");
    } else {
      toast.success("Welcome! Redirecting to dashboard...");
      router.push("/vendor/dashboard"); // Redirect to vendor dashboard
    }

  } catch (error) {
    console.error(error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // 3. Google OAuth Flow
  const handleGoogleLogin = async () => {
    // We pass the role in the 'redirectTo' URL so the callback knows 
    // to ask for Vendor details if they are new.
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?role=VENDOR`,
      },
    });
    if (error) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Vendor Registration</h2>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            {/* Vendor Specific Fields  */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  name="company_name" 
                  required 
                  value={formData.company_name}
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Company Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  name="gstin" 
                  required 
                  value={formData.gstin}
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="GSTIN Number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email}
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  name="password" 
                  required 
                  value={formData.password}
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Verify Email & Signup
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
              Google
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600">Enter the OTP sent to {formData.email}</p>
            <input 
              type="text" 
              placeholder="123456" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              className="w-full p-2 border rounded text-center text-2xl tracking-widest"
            />
            <button 
              onClick={handleVerifyAndSignup} 
              disabled={loading} 
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Confirm OTP
                </>
              )}
            </button>
            <button 
              onClick={() => setStep(1)} 
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Wrong Email?
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}