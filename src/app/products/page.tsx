'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Settings,
  Package,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';

// --- Types based on Business Logic ---
interface Product {
  id: string;
  name: string;
  category: string;
  vendorId: string;
  image: string;
  price: number;
  unit: 'Hour' | 'Day' | 'Month';
  isStocked: boolean;
  colors: string[];
}

// --- Mock Data ---
const PRODUCTS: Product[] = [
  { id: '1', name: 'Modern Grey Sofa', category: 'Furniture', vendorId: 'v1', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', price: 1200, unit: 'Month', isStocked: true, colors: ['#374151', '#F3F4F6'] },
  { id: '2', name: 'Ergonomic Office Setup', category: 'Furniture', vendorId: 'v2', image: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&q=80&w=800', price: 300, unit: 'Day', isStocked: false, colors: ['#000000', '#8B5CF6'] },
  { id: '3', name: 'Mahogany Study Desk', category: 'Furniture', vendorId: 'v1', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800', price: 800, unit: 'Month', isStocked: true, colors: ['#78350F'] },
  { id: '4', name: 'Smart TV 55"', category: 'Electronics', vendorId: 'v3', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800', price: 150, unit: 'Day', isStocked: true, colors: ['#000000'] },
  { id: '5', name: 'Gaming Desktop PC', category: 'Electronics', vendorId: 'v3', image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800', price: 500, unit: 'Day', isStocked: true, colors: ['#000000', '#EF4444'] },
  { id: '6', name: 'Laptop Workstation', category: 'Electronics', vendorId: 'v2', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800', price: 200, unit: 'Day', isStocked: true, colors: ['#9CA3AF'] },
  { id: '7', name: 'PlayStation 5 Console', category: 'Gaming', vendorId: 'v3', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800', price: 50, unit: 'Hour', isStocked: true, colors: ['#FFFFFF'] },
  { id: '8', name: 'Bedroom Set King', category: 'Furniture', vendorId: 'v1', image: 'https://images.unsplash.com/photo-1505693416388-b0346ef414b9?auto=format&fit=crop&q=80&w=800', price: 2500, unit: 'Month', isStocked: true, colors: ['#E5E7EB'] },
];

export default function CustomerDashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(5000);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-300">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Logo & Nav Links */}
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">YL</span>
              </div>
              <span className="font-bold text-lg tracking-wide text-foreground">Your Logo</span>
            </div>
            
            <nav className="hidden lg:flex space-x-8 text-sm text-foreground/60">
              <Link href="#" className="hover:text-primary transition-colors">Products</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms & Condition</Link>
              <Link href="#" className="hover:text-primary transition-colors">About us</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
            </nav>
          </div>

          {/* Search, User Badge & Actions */}
          <div className="flex items-center space-x-6">
            
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-secondary/50 border border-border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-foreground/40" />
            </div>

            {/* User Badge */}
            <div className="hidden md:flex items-center bg-primary/10 rounded-full px-4 py-1.5 border border-primary/20">
              <span className="text-primary font-bold text-sm">Fearless Fish</span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-5">
              <button className="text-foreground/60 hover:text-primary transition-colors">
                <Heart className="h-6 w-6" />
              </button>
              
              <button className="text-foreground/60 hover:text-primary relative transition-colors">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  2
                </span>
              </button>

              {/* PROFILE DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary transition-all focus:outline-none relative"
                >
                  <User className="h-5 w-5 text-foreground/70" />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-sm w-3 h-3 flex items-center justify-center">
                    <ChevronDown className="h-2 w-2" />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <Link href="#" className="flex items-center px-6 py-4 text-sm text-foreground/80 hover:bg-secondary transition-colors">
                      <UserCircle className="w-4 h-4 mr-3 text-primary" /> My Profile
                    </Link>
                    <div className="h-px bg-border mx-4"></div>
                    <Link href="#" className="flex items-center px-6 py-4 text-sm text-foreground/80 hover:bg-secondary transition-colors">
                      <Package className="w-4 h-4 mr-3 text-primary" /> My Orders
                    </Link>
                    <div className="h-px bg-border mx-4"></div>
                    <Link href="#" className="flex items-center px-6 py-4 text-sm text-foreground/80 hover:bg-secondary transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-primary" /> Settings
                    </Link>
                    <div className="h-px bg-border mx-4"></div>
                    <button className="w-full flex items-center px-6 py-4 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="max-w-[1600px] mx-auto flex pt-8 px-6 pb-12 gap-8">
        
        {/* --- SIDEBAR FILTERS --- */}
        <aside className="w-64 flex-shrink-0 hidden lg:block space-y-8">
          
          {/* Category Filter */}
          <div className="bg-card p-5 rounded-xl border border-border transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Category</h3>
              <span className="bg-primary/30 w-5 h-0.5"></span>
            </div>
            <div className="space-y-3">
              {['Furniture', 'Electronics', 'Gaming', 'Cameras'].map((brand) => (
                <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="w-5 h-5 border-2 border-border rounded flex items-center justify-center group-hover:border-primary transition-colors">
                    <div className="w-2.5 h-2.5 bg-primary rounded-sm scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                  <span className="text-foreground/60 group-hover:text-foreground transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-card p-5 rounded-xl border border-border transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Price Range</h3>
              <span className="bg-primary/30 w-5 h-0.5"></span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-4 text-xs font-mono text-foreground/40 font-bold">
              <span>$0</span>
              <span className="text-primary">${priceRange}</span>
            </div>
          </div>
        </aside>

        {/* --- PRODUCT GRID --- */}
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="h-48 overflow-hidden relative p-4 bg-muted/30">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={`w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 ${!product.isStocked ? 'opacity-40 grayscale' : ''}`}
                  />
                  
                  {!product.isStocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-background/80 backdrop-blur-md border border-border px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-foreground/60">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 text-center">
                  <h3 className="font-medium text-foreground mb-4 line-clamp-1">{product.name}</h3>
                  <div className="inline-block bg-secondary/50 rounded-lg px-4 py-2 border border-border">
                    <span className="text-sm font-bold text-foreground">Rs {product.price}</span>
                    <span className="text-xs text-foreground/40 ml-1">/ {product.unit}</span>
                  </div>
                </div>

                {product.isStocked && (
                  <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-background/90 backdrop-blur-md border-t border-border flex justify-center">
                    <button className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold py-2 px-6 rounded-full shadow-lg transition-all">
                      ADD TO QUOTE
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center items-center space-x-4">
            <button className="p-2 rounded-full border border-border hover:bg-primary hover:text-primary-foreground transition-all">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex space-x-2">
              <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/20">1</button>
              <button className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary font-medium flex items-center justify-center transition-all">2</button>
              <div className="w-10 h-10 flex items-center justify-center text-foreground/30">...</div>
            </div>
            <button className="p-2 rounded-full border border-border hover:bg-primary hover:text-primary-foreground transition-all">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}