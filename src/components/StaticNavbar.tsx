'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, RefreshCcw, Menu, X } from 'lucide-react';

export const StaticNavbar = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fixes hydration and ensures the theme matches the system/stored preference immediately
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same height to prevent layout shift (CLS)
    return <div className="h-20 w-full bg-background border-b border-border" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="group flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
              <RefreshCcw className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground">RentFlow</span>
              <span className="text-[10px] text-muted-foreground block -mt-1 tracking-widest uppercase font-black">ERP</span>
            </div>
          </Link>

          {/* Center Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {['Browse', 'Vendors', 'About'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Smooth Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="relative p-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors overflow-hidden group"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 transition-all duration-500 ${isDark ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-10 opacity-0 rotate-90'}`} />
                <Moon className={`absolute inset-0 transition-all duration-500 ${!isDark ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-10 opacity-0 -rotate-90'}`} />
              </div>
            </button>

            <div className="hidden sm:flex items-center gap-3 ml-2">
              <Link href="/login" className="text-sm font-semibold px-5 py-2.5 hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                href="/signup/customer"
                className="bg-primary text-primary-foreground text-sm font-bold px-6 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-95"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-accent rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4 p-8 pt-24">
            <Link href="/products" className="text-2xl font-bold border-b border-border pb-4">Browse</Link>
            <Link href="/login" className="text-2xl font-bold border-b border-border pb-4">Login</Link>
            <Link href="/signup/customer" className="mt-4 bg-primary text-primary-foreground text-center py-4 rounded-2xl font-bold text-lg">
              Sign Up Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
};