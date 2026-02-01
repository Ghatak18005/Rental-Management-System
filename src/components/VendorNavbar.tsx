'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  UserCircle, 
  Settings, 
  LogOut 
} from 'lucide-react';

export const VendorNavbar = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  // Standardized Skeleton (h-16) to match StaticNavbar
  if (!mounted) {
    return (
      <div className="sticky top-0 z-50 w-full border-b border-border bg-background h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-end gap-3 opacity-50">
           <div className="w-10 h-10 bg-muted rounded-xl" />
           <div className="w-10 h-10 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-end gap-3">
        
        {/* THEME TOGGLE */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Toggle theme"
        >
          <div className="relative w-5 h-5">
            <Sun className={`absolute inset-0 transition-all duration-500 ${isDark ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-10 opacity-0 rotate-90'}`} />
            <Moon className={`absolute inset-0 transition-all duration-500 ${!isDark ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-10 opacity-0 -rotate-90'}`} />
          </div>
        </button>

        {/* PROFILE DROPDOWN WRAPPER */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary transition-all focus:outline-none relative group"
            aria-label="User menu"
            aria-expanded={isProfileOpen}
          >
            <User className="h-5 w-5 text-foreground/70 group-hover:text-primary transition-colors" />
            
            {/* Status Indicator Badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center border-2 border-background">
              <ChevronDown className={`h-2 w-2 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* DROPDOWN MENU */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              
              {/* Header Section */}
              <div className="px-5 py-4 border-b border-border bg-secondary/30">
                <p className="text-sm font-bold text-foreground">Vendor Portal</p>
                <p className="text-xs text-muted-foreground truncate font-medium">vendor@rentflow.com</p>
              </div>
              
              {/* Menu Items */}
              <div className="py-2 flex flex-col">
                <Link 
                  href="/vendor/profile" 
                  className="flex items-center px-5 py-3 text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition-colors" 
                  onClick={() => setIsProfileOpen(false)}
                >
                  <UserCircle className="w-4 h-4 mr-3" /> 
                  <span>My Profile</span>
                </Link>
                
                <Link 
                  href="/vendor/settings" 
                  className="flex items-center px-5 py-3 text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition-colors" 
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" /> 
                  <span>Settings</span>
                </Link>
              </div>

              {/* Divider */}
              <div className="h-px bg-border mx-3"></div>
              
              {/* Footer Section */}
              <div className="p-2">
                <button 
                  className="w-full flex items-center px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left font-medium"
                  onClick={() => console.log('Logout logic here')}
                >
                  <LogOut className="w-4 h-4 mr-3" /> 
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};