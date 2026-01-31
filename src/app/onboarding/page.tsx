"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Building2, FileText, Phone, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "CUSTOMER";
  const role = roleParam.toUpperCase();
  
  // Validate role
  const validRoles = ['CUSTOMER', 'VENDOR', 'ADMIN'];
  const isValidRole = validRoles.includes(role);

  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    company_name: "",
    gstin: "",
    mobile: "",
  });

  // 1. Load User on Mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Security check
        return;
      }
      setUser(user);
    };
    getUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!isValidRole) {
      alert("Invalid role specified");
      return;
    }
    
    setLoading(true);

    // 2. Validate Vendor Requirements
    if (role === "VENDOR" && (!formData.company_name || !formData.gstin)) {
      toast.error("Vendors must provide Company Name and GSTIN");
      setLoading(false);
      return;
    }

    // 3. Create Profile in 'public.users'
    const { error } = await supabase.from("users").insert([
      {
        id: user.id, // Links to the Google Auth User
        email: user.email,
        name: user.user_metadata.full_name || user.email?.split("@")[0], // Fallback name
        role: role,
        company_name: formData.company_name || null,
        gstin: formData.gstin || null,
        mobile: formData.mobile || null,
      },
    ]);

    if (error) {
      toast.error("Error creating profile: " + error.message);
    } else {
      toast.success("Profile created successfully! Redirecting...");
      // Dynamic Redirect based on Role
      if (role === "VENDOR") {
        router.push("/vendor/dashboard");
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    // Page Container
    <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
      
      {/* Card Container */}
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-xl p-8 transition-colors duration-300">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Complete Your Profile</h2>
        <p className="text-center text-foreground/60 mb-6">
          You are signing up as a <span className="font-bold text-primary">{role}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vendor Specific Fields */}
          {role === "VENDOR" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                  <input
                    required
                    value={formData.company_name}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">GSTIN</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                  <input
                    required
                    value={formData.gstin}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="GSTIN Number"
                  />
                </div>
              </div>
            </>
          )}

          {/* Common Field */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Mobile Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
              <input
                type="tel"
                value={formData.mobile}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Mobile Number"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Complete Setup
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}