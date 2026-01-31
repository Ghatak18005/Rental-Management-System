'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  RefreshCcw,
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  User,
  ChevronDown,
  Home,
  Settings,
  Search,
  Heart,
  UserCircle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  full_name?: string;
  user_metadata?: {
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export const DynamicNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(0);
  const supabase = createClient();

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          setAuthUser(authUser);
          const { data: userProfile } = await supabase
            .from('users')
            .select('id, email, role, full_name, user_metadata')
            .eq('id', authUser.id)
            .single();

          if (userProfile) {
            setUser(userProfile as UserProfile);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      { name: 'Home', href: '/', icon: Home },
    ];

    if (!user) {
      return [
        ...commonItems,
      ];
    }

    if (user.role === 'VENDOR') {
      return [
        ...commonItems,
        { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
        { name: 'Inventory', href: '/vendor/inventory', icon: Package },
        { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
        { name: 'Invoicing', href: '/vendor/invoicing', icon: FileText },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        ...commonItems,
        { name: 'Admin', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: User },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    }

    // CUSTOMER role
    return [
      ...commonItems,
      { name: 'Browse', href: '/products', icon: ShoppingCart },
      { name: 'Cart', href: '/cart', icon: ShoppingCart },
      { name: 'Profile', href: '/profile', icon: User },
    ];
  };

  const navItems = getNavItems();
  const isActive = (href: string) => pathname === href;

  if (!mounted) {
    return null;
  }

  // For vendor dashboard pages, use vendor navbar
  if (user?.role === 'VENDOR' && pathname.startsWith('/vendor')) {
    return (
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-end">

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>

            {/* USER PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:ring-2 hover:ring-purple-500 transition-all focus:outline-none"
              >
                <User className="h-5 w-5 text-gray-300" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-[#1E1E1E] border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-700">
                    <p className="text-sm text-white font-bold">
                      {user?.full_name || "Vendor"}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>

                  <a
                    href="#"
                    className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    Settings
                  </a>

                  <div className="h-px bg-gray-700 mx-4 my-1"></div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-6 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // For customer dashboard pages, use the enhanced design
  if (user?.role === 'CUSTOMER' && pathname.startsWith('/dashboard')) {
    return (
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Logo & Links */}
          <div className="flex items-center space-x-12">
            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/dashboard")}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">YL</span>
              </div>
              <span className="font-bold text-lg tracking-wide">RentFlow</span>
            </div>
            <nav className="hidden lg:flex space-x-8 text-sm text-gray-300">
              <a href="#" className="text-white font-medium hover:text-purple-400 transition-colors">Products</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Condition</a>
              <a href="#" className="hover:text-white transition-colors">About us</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </nav>
          </div>

          {/* Search & Profile */}
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1E1E1E] border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-purple-500 w-64 transition-all"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Gamified Name Badge */}
            <div className="hidden md:flex items-center bg-[#2D2B3B] rounded-full px-4 py-1.5 border border-purple-900/50">
              <span className="text-purple-400 font-bold text-sm">
                {user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.full_name || "User"}
              </span>
            </div>

            <div className="flex items-center space-x-5">
              <Heart className="h-6 w-6 text-gray-400 cursor-pointer hover:text-white transition-colors" />

              <button
                onClick={() => router.push("/dashboard/cart")}
                className="text-gray-400 hover:text-white relative transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              </button>

              {/* USER PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:ring-2 hover:ring-purple-500 transition-all focus:outline-none overflow-hidden"
                >
                  <User className="h-5 w-5 text-gray-300" />
                  
                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-sm w-3 h-3 flex items-center justify-center">
                    <ChevronDown className="h-2 w-2" />
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-[#1E1E1E] border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-700">
                      <p className="text-sm text-white font-bold">
                        {user?.user_metadata?.full_name || user?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>

                    <a
                      href="/profile"
                      className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <UserCircle className="w-4 h-4 mr-3 text-gray-400" />
                      My account/ My Profile
                    </a>

                    <a 
                      href="#" 
                      className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-3 text-gray-400" />
                      My Orders
                    </a>

                    <a 
                      href="#" 
                      className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </a>

                    <div className="h-px bg-gray-700 mx-4 my-1"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-6 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // For non-customer pages or landing page, use the original design
  return (
    <>
      <nav className="relative z-50 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <RefreshCcw className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">RentFlow</span>
              <span className="text-[10px] opacity-60 block -mt-1 tracking-widest uppercase font-bold">ERP</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium">
              {user?.role === 'VENDOR' && (
                <>
                  <Link href="/vendor/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-primary hover:bg-accent">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/vendor/inventory" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-primary hover:bg-accent">
                    <Package className="w-4 h-4" />
                    Inventory
                  </Link>
                  <Link href="/vendor/orders" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-primary hover:bg-accent">
                    <ShoppingCart className="w-4 h-4" />
                    Orders
                  </Link>
                  <Link href="/vendor/invoicing" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-primary hover:bg-accent">
                    <FileText className="w-4 h-4" />
                    Invoicing
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-accent text-accent-foreground border border-border hover:bg-accent/80 transition-all hidden sm:flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth Section */}
            {!loading && user ? (
              // Authenticated User
              <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{user.full_name || user.email.split('@')[0]}</span>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-border">
                        <p className="text-xs opacity-60 uppercase tracking-wide font-bold">Role</p>
                        <p className="text-sm font-semibold text-primary">{user.role}</p>
                      </div>
                      
                      {user.role === 'CUSTOMER' && (
                        <Link
                          href="/profile"
                          className="block px-4 py-3 hover:bg-accent transition-colors text-sm border-b border-border"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          View Profile
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-accent transition-colors text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Unauthenticated User
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup/customer"
                  className="bg-primary text-primary-foreground text-sm font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden pt-24 px-6">
          <div className="flex flex-col gap-4 pb-6">
            <div className="border-t border-border my-4 pt-4">
              {!loading && user ? (
                <>
                  <div className="mb-4">
                    <p className="text-xs opacity-60 uppercase tracking-wide font-bold mb-2">Role</p>
                    <p className="text-sm font-semibold text-primary">{user.role}</p>
                  </div>
                  {user.role === 'CUSTOMER' && (
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-all mb-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-base font-medium">View Profile</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-all text-red-500 hover:text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-base font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-3 rounded-lg border border-border hover:bg-accent transition-all font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup/customer"
                    className="block w-full text-center px-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Theme Toggle */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => {
                  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-all"
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span className="text-base font-medium">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span className="text-base font-medium">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </>
  );
};
