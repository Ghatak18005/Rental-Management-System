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
  {
    id: '1',
    name: 'Modern Grey Sofa',
    category: 'Furniture',
    vendorId: 'v1',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    price: 1200,
    unit: 'Month',
    isStocked: true,
    colors: ['#374151', '#F3F4F6'],
  },
  {
    id: '2',
    name: 'Ergonomic Office Setup',
    category: 'Furniture',
    vendorId: 'v2',
    image: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&q=80&w=800',
    price: 300,
    unit: 'Day',
    isStocked: false,
    colors: ['#000000', '#8B5CF6'],
  },
  {
    id: '3',
    name: 'Mahogany Study Desk',
    category: 'Furniture',
    vendorId: 'v1',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800',
    price: 800,
    unit: 'Month',
    isStocked: true,
    colors: ['#78350F'],
  },
  {
    id: '4',
    name: 'Smart TV 55"',
    category: 'Electronics',
    vendorId: 'v3',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800',
    price: 150,
    unit: 'Day',
    isStocked: true,
    colors: ['#000000'],
  },
  {
    id: '5',
    name: 'Gaming Desktop PC',
    category: 'Electronics',
    vendorId: 'v3',
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800',
    price: 500,
    unit: 'Day',
    isStocked: true,
    colors: ['#000000', '#EF4444'],
  },
  {
    id: '6',
    name: 'Laptop Workstation',
    category: 'Electronics',
    vendorId: 'v2',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800',
    price: 200,
    unit: 'Day',
    isStocked: true,
    colors: ['#9CA3AF'],
  },
  {
    id: '7',
    name: 'PlayStation 5 Console',
    category: 'Gaming',
    vendorId: 'v3',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
    price: 50,
    unit: 'Hour',
    isStocked: true,
    colors: ['#FFFFFF'],
  },
  {
    id: '8',
    name: 'Bedroom Set King',
    category: 'Furniture',
    vendorId: 'v1',
    image: 'https://images.unsplash.com/photo-1505693416388-b0346ef414b9?auto=format&fit=crop&q=80&w=800',
    price: 2500,
    unit: 'Month',
    isStocked: true,
    colors: ['#E5E7EB'],
  },
];

export default function CustomerDashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(5000);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Logo & Nav Links */}
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">YL</span>
              </div>
              <span className="font-bold text-lg tracking-wide">Your Logo</span>
            </div>
            
            <nav className="hidden lg:flex space-x-8 text-sm text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Products</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Condition</a>
              <a href="#" className="hover:text-white transition-colors">About us</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </nav>
          </div>

          {/* Search, User Badge & Actions */}
          <div className="flex items-center space-x-6">
            
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-[#1E1E1E] border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-purple-500 w-64 transition-all"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* User Badge */}
            <div className="hidden md:flex items-center bg-[#2D2B3B] rounded-full px-4 py-1.5 border border-purple-900/50">
              <span className="text-purple-400 font-bold text-sm">Fearless Fish</span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-5">
              <button className="text-gray-400 hover:text-white">
                <Heart className="h-6 w-6" />
              </button>
              
              <button className="text-gray-400 hover:text-white relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  2
                </span>
              </button>

              {/* PROFILE DROPDOWN - EXACTLY MATCHING WIREFRAME */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:ring-2 hover:ring-purple-500 transition-all focus:outline-none"
                >
                  <User className="h-5 w-5 text-gray-300" />
                  {/* Small arrow indicator */}
                  <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-sm w-3 h-3 flex items-center justify-center">
                    <ChevronDown className="h-2 w-2" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-[#1E1E1E] border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    
                    {/* Item 1: My account / My Profile */}
                    <a href="#" className="flex items-center px-6 py-4 text-sm text-gray-200 hover:bg-gray-800 transition-colors">
                      <UserCircle className="w-4 h-4 mr-3 text-gray-400" />
                      My account/ My Profile
                    </a>
                    
                    {/* Divider */}
                    <div className="h-px bg-gray-700 mx-4"></div>

                    {/* Item 2: My Orders */}
                    <a href="#" className="flex items-center px-6 py-4 text-sm text-gray-200 hover:bg-gray-800 transition-colors">
                      <Package className="w-4 h-4 mr-3 text-gray-400" />
                      My Orders
                    </a>

                    {/* Divider */}
                    <div className="h-px bg-gray-700 mx-4"></div>

                    {/* Item 3: Settings */}
                    <a href="#" className="flex items-center px-6 py-4 text-sm text-gray-200 hover:bg-gray-800 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </a>

                    {/* Divider */}
                    <div className="h-px bg-gray-700 mx-4"></div>

                    {/* Item 4: Logout */}
                    <a href="#" className="flex items-center px-6 py-4 text-sm text-gray-200 hover:bg-gray-800 hover:text-red-400 transition-colors">
                      <LogOut className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-400" />
                      Logout
                    </a>
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
          
          {/* Brand/Category Filter */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Category</h3>
              <span className="bg-gray-700 w-5 h-0.5"></span>
            </div>
            <div className="space-y-3">
              {['Furniture', 'Electronics', 'Gaming', 'Cameras'].map((brand) => (
                <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="w-5 h-5 border-2 border-gray-600 rounded flex items-center justify-center group-hover:border-purple-500">
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Color</h3>
              <span className="bg-gray-700 w-5 h-0.5"></span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {['#0D9488', '#7C3AED', '#EA580C', '#D97706', '#EF4444', '#3B82F6', '#10B981', '#6B7280'].map((color, idx) => (
                <div 
                  key={idx} 
                  className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 ring-offset-2 ring-offset-[#1E1E1E] ring-white transition-all"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Duration</h3>
              <span className="bg-gray-700 w-5 h-0.5"></span>
            </div>
            <div className="relative mb-4">
               <button className="w-full bg-[#2D2D2D] text-left px-4 py-2 rounded-lg text-sm flex justify-between items-center">
                 All Duration <ChevronDown className="h-4 w-4" />
               </button>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="hover:text-purple-400 cursor-pointer">1 Month</p>
              <p className="hover:text-purple-400 cursor-pointer">6 Month</p>
              <p className="hover:text-purple-400 cursor-pointer">1 Year</p>
              <p className="hover:text-purple-400 cursor-pointer">2 Years</p>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Price Range</h3>
              <span className="bg-gray-700 w-5 h-0.5"></span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between mt-4 text-xs font-mono text-gray-400">
              <span>$0</span>
              <span>${priceRange}</span>
            </div>
          </div>
        </aside>

        {/* --- PRODUCT GRID --- */}
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-[#1E1E1E] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10"
              >
                <div className="h-48 overflow-hidden relative p-4 bg-[#252525]">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={`w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 ${!product.isStocked ? 'opacity-40 grayscale' : ''}`}
                  />
                  
                  {!product.isStocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="border border-white/30 bg-black/50 backdrop-blur-sm px-4 py-1 rounded-full text-xs uppercase tracking-widest font-bold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 text-center">
                  <h3 className="font-medium text-gray-200 mb-4 line-clamp-1">{product.name}</h3>
                  <div className="inline-block bg-black/40 rounded-lg px-4 py-2 border border-gray-700">
                    <span className="text-sm font-bold text-white">Rs {product.price}</span>
                    <span className="text-xs text-gray-400 ml-1">/ per {product.unit}</span>
                  </div>
                </div>

                {product.isStocked && (
                  <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#2D2D2D]/95 backdrop-blur-md flex justify-center">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-6 rounded-full shadow-lg transition-colors">
                      ADD TO QUOTE
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center items-center space-x-4">
            <button className="p-2 rounded-full border border-gray-700 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex space-x-2">
              <button className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shadow-lg shadow-purple-900/50">1</button>
              <button className="w-10 h-10 rounded-full border border-gray-700 hover:border-purple-500 hover:text-purple-400 font-medium flex items-center justify-center transition-all">2</button>
              <div className="w-10 h-10 flex items-center justify-center text-gray-500">...</div>
            </div>
            <button className="p-2 rounded-full border border-gray-700 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}