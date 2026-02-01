"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Building2, FileText, Phone, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { User } from "@supabase/supabase-js";

// 1. Define the User Role type
type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

// 2. Define the Form State interface
interface OnboardingFormData {
  company_name: string;
  gstin: string;
  mobile: string;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Normalize role and validate
  const roleParam = searchParams.get("role")?.toUpperCase() || "CUSTOMER";
  const role = roleParam as UserRole;

  const validRoles: UserRole[] = ['CUSTOMER', 'VENDOR', 'ADMIN'];
  const isValidRole = validRoles.includes(role);

  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // 3. Use the Supabase User type instead of any
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<OnboardingFormData>({
    company_name: "",
    gstin: "",
    mobile: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    };
    getUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (!isValidRole) {
      toast.error("Invalid role specified");
      return;
    }

    setLoading(true);

    if (role === "VENDOR" && (!formData.company_name || !formData.gstin)) {
      toast.error("Vendors must provide Company Name and GSTIN");
      setLoading(false);
      return;
    }

    // 4. Insert typed data into 'public.users'
    const { error } = await supabase.from("users").insert([
      {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: role,
        company_name: role === "VENDOR" ? formData.company_name : null,
        gstin: role === "VENDOR" ? formData.gstin : null,
        mobile: formData.mobile || null,
      },
    ]);

    if (error) {
      toast.error("Error creating profile: " + error.message);
    } else {
      toast.success("Profile created successfully! Redirecting...");

      const routes: Record<UserRole, string> = {
        VENDOR: "/vendor/dashboard",
        ADMIN: "/admin/dashboard",
        CUSTOMER: "/dashboard"
      };

      router.push(routes[role]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-xl p-8 transition-colors duration-300">

        <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Complete Your Profile</h2>
        <p className="text-center text-foreground/60 mb-6">
          You are signing up as a <span className="font-bold text-primary">{role}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {role === "VENDOR" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                  <input
                    required
                    value={formData.company_name}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
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
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="GSTIN Number"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Mobile Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
              <input
                type="tel"
                value={formData.mobile}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Mobile Number"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
            ) : (
              <><CheckCircle2 className="h-5 w-5" /> Complete Setup</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <OnboardingContent />
    </Suspense>
  );
}