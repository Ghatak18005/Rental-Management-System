"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Use your utility
import { useRouter, useSearchParams } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "CUSTOMER";

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
      if (!user) router.push("/login"); // Security check
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // 2. Validate Vendor Requirements
    if (role === "VENDOR" && (!formData.company_name || !formData.gstin)) {
      alert("Vendors must provide Company Name and GSTIN");
      setLoading(false);
      return;
    }

    // 3. Create Profile in 'public.users'
    const { error } = await supabase.from("users").insert([
      {
        id: user.id, // Links to the Google Auth User
        email: user.email,
        name: user.user_metadata.full_name || user.email?.split("@")[0], // Fallback name
        role: role.toUpperCase(),
        company_name: formData.company_name || null,
        gstin: formData.gstin || null,
        mobile: formData.mobile || null,
      },
    ]);

    if (error) {
      alert("Error creating profile: " + error.message);
    } else {
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
                <label className="block text-sm font-medium">Company Name</label>
                <input
                  required
                  className="w-full p-2 border rounded mt-1"
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">GSTIN</label>
                <input
                  required
                  className="w-full p-2 border rounded mt-1"
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Common Field */}
          <div>
            <label className="block text-sm font-medium">Mobile Number (Optional)</label>
            <input
              className="w-full p-2 border rounded mt-1"
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}