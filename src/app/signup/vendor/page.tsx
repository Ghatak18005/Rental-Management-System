"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; 
import { useRouter } from "next/navigation";

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
      alert("Company Name and GSTIN are required for Vendors.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) setStep(2);
      else alert("Failed to send OTP");
    } catch (error) {
      console.error(error);
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
      alert(data.error);
      setLoading(false);
      return;
    }

    // Success! Log the user in automatically
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (loginError) {
      alert("Account created, but auto-login failed. Please sign in manually.");
    } else {
      router.push("/dashboard"); // Redirect to dashboard
    }

  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  // 3. Google OAuth Flow
  const handleGoogleLogin = async () => {
    // We pass the role in the 'redirectTo' URL so the callback knows 
    // to ask for Vendor details if they are new.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?role=VENDOR`, // Change to CUSTOMER for customer page
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Vendor Registration</h2>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input name="name" required onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            
            {/* Vendor Specific Fields  */}
            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input name="company_name" required onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">GSTIN</label>
              <input name="gstin" required onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" name="email" required onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input type="password" name="password" required onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {loading ? "Sending OTP..." : "Verify Email & Signup"}
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
            <button onClick={handleVerifyAndSignup} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              {loading ? "Creating Account..." : "Confirm OTP"}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 underline">Wrong Email?</button>
          </div>
        )}
      </div>
    </div>
  );
}