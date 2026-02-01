"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import toast from "react-hot-toast";

const navigation = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/vendor/inventory", icon: Package },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
  { name: "Invoicing", href: "/vendor/invoicing", icon: FileText },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userProfile?.role !== "VENDOR") {
          toast.error("Access denied. Vendor access required.");
          router.push("/dashboard");
          return;
        }

        setProfile(userProfile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <div className="min-h-screen bg-background">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Link href="/" className="group flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
            <RefreshCcw className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground">RentFlow</span>
            <span className="text-[10px] text-muted-foreground block -mt-1 tracking-widest uppercase font-black">ERP</span>
          </div>
        </Link>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-foreground hover:text-primary"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {profile?.full_name || "Vendor"}
                  </p>
                  <p className="text-xs text-foreground/60 truncate">
                    {profile?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-4 py-4 border-t border-border">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar for mobile menu toggle */}
          <header className="sticky top-0 z-30 bg-card/50 backdrop-blur-sm border-b border-border lg:hidden">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-foreground hover:text-primary"
              >
                <Menu className="h-6 w-6" />
              </button>
              <span className="text-sm font-semibold text-foreground/70">
                {profile?.full_name}
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

