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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Complete Your Profile</h2>
        <p className="text-center text-gray-600 mb-6">
          You are signing up as a <span className="font-bold text-blue-600">{role}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor Specific Fields */}
          {role === "VENDOR" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    required
                    value={formData.company_name}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    required
                    value={formData.gstin}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="GSTIN Number"
                  />
                </div>
              </div>
            </>
          )}

          {/* Common Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.mobile}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Mobile Number"
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