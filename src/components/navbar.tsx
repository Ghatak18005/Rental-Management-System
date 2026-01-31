"use client";

import * as React from "react";
import { Moon, Sun, ShoppingBag, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">RentFlow</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="#" className="hover:text-primary transition-colors font-medium">Browse</Link>
              <Link href="#" className="hover:text-primary transition-colors font-medium">Vendors</Link>
              <Link href="#" className="hover:text-primary transition-colors font-medium">How it Works</Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-sm font-medium hover:text-primary">
              Login
            </button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Get Started
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-accent transition-colors relative"
              aria-label="Toggle Theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}