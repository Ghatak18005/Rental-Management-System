"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  UserCircle,
  Loader2,
  Filter,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";

// --- Types ---
interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  unit: "Hour" | "Day" | "Month";
  colors: string[];
  isStocked: boolean;
}

// --- Mock Data ---
const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Modern Grey Sofa",
    category: "Furniture",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
    price: 1200,
    unit: "Month",
    colors: ["#374151", "#F3F4F6"], // Grey, White
    isStocked: true,
  },
  {
    id: "2",
    name: "Ergonomic Office Setup",
    category: "Furniture",
    image:
      "https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&q=80&w=800",
    price: 300,
    unit: "Day",
    colors: ["#000000"],
    isStocked: false,
  },
  {
    id: "3",
    name: "Gaming Desktop PC",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800",
    price: 500,
    unit: "Day",
    colors: ["#EF4444", "#000000"], // Red, Black
    isStocked: true,
  },
  {
    id: "4",
    name: "PlayStation 5 Console",
    category: "Gaming",
    image:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800",
    price: 50,
    unit: "Hour",
    colors: ["#FFFFFF"],
    isStocked: true,
  },
  {
    id: "5",
    name: "DSLR Camera Kit",
    category: "Cameras",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    price: 150,
    unit: "Day",
    colors: ["#000000"],
    isStocked: true,
  },
  {
    id: "6",
    name: "Orange Armchair",
    category: "Furniture",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
    price: 800,
    unit: "Month",
    colors: ["#EA580C"], // Orange
    isStocked: true,
  },
];

// --- Color Palette for Filter ---
const FILTER_COLORS = [
  "#000000",
  "#FFFFFF",
  "#374151",
  "#EF4444",
  "#EA580C",
  "#3B82F6",
];

export default function CustomerDashboard() {
  const supabase = createClient();
  const router = useRouter();

  // Auth State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(2000); // Default max price
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // --- 1. Protect Route & Fetch User ---
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  // --- 2. Filter Logic ---
  const filteredProducts = PRODUCTS.filter((product) => {
    // Search Filter
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // Price Filter
    const matchesPrice = product.price <= priceRange;
    // Category Filter
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    // Color Filter (Checks if product has the selected color)
    const matchesColor = selectedColor
      ? product.colors.includes(selectedColor)
      : true;

    return matchesSearch && matchesPrice && matchesCategory && matchesColor;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo & Links */}
          <div className="flex items-center space-x-12">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">YL</span>
              </div>
              <span className="font-bold text-lg tracking-wide">RentFlow</span>
            </div>
            <nav className="hidden lg:flex space-x-8 text-sm text-gray-300">
              <a href="#" className="text-white font-medium">
                Products
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms & Condition
              </a>
              <a href="#" className="hover:text-white transition-colors">
                About us
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </nav>
          </div>

          {/* Search & Profile */}
          <div className="flex items-center space-x-6">
            {/* SEARCH BAR (Functional) */}
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
                {user?.user_metadata?.display_name || "Fearless Fish"}
              </span>
            </div>

            <div className="flex items-center space-x-5">
              <Heart className="h-6 w-6 text-gray-400 cursor-pointer hover:text-white" />

              <button className="text-gray-400 hover:text-white relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  0
                </span>
              </button>

              {/* USER PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:ring-2 hover:ring-purple-500 transition-all focus:outline-none"
                >
                  <User className="h-5 w-5 text-gray-300" />
                  <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-sm w-3 h-3 flex items-center justify-center">
                    <ChevronDown className="h-2 w-2" />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-[#1E1E1E] border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-700">
                      <p className="text-sm text-white font-bold">
                        {user?.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>

                    <a
                      href="/profile"
                      className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                    >
                      <UserCircle className="w-4 h-4 mr-3 text-gray-400" />
                      My account/ My Profile
                    </a>

                    <a
                      href="#"
                      className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                    >
                      <Package className="w-4 h-4 mr-3 text-gray-400" />
                      My Orders
                    </a>

                    <a
                      href="#"
                      className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </a>

                    <div className="h-px bg-gray-700 mx-4 my-1"></div>

                    <button
                      onClick={handleLogout}
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

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-[1600px] mx-auto flex pt-8 px-6 pb-12 gap-8">
        {/* --- SIDEBAR FILTERS --- */}
        <aside className="w-64 flex-shrink-0 hidden lg:block space-y-8">
          {/* Brand / Category Filter */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Brand</h3>
              <span className="bg-gray-700 w-5 h-0.5"></span>
            </div>
            <div className="space-y-3">
              {["Furniture", "Electronics", "Gaming", "Cameras"].map((cat) => (
                <label
                  key={cat}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <div
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat ? null : cat)
                    }
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${selectedCategory === cat ? "bg-purple-600 border-purple-600" : "border-gray-600 group-hover:border-purple-500"}`}
                  >
                    {selectedCategory === cat && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span
                    className={`text-gray-400 group-hover:text-white transition-colors ${selectedCategory === cat ? "text-white font-bold" : ""}`}
                  >
                    {cat}
                  </span>
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
              {FILTER_COLORS.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    setSelectedColor(selectedColor === color ? null : color)
                  }
                  className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-all border-2 ${selectedColor === color ? "border-purple-500 ring-2 ring-purple-500/30" : "border-transparent"}`}
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
              <button className="w-full bg-[#2D2D2D] text-left px-4 py-2 rounded-lg text-sm flex justify-between items-center border border-gray-700">
                All Duration <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="hover:text-purple-400 cursor-pointer">1 Month</p>
              <p className="hover:text-purple-400 cursor-pointer">6 Month</p>
              <p className="hover:text-purple-400 cursor-pointer">1 Year</p>
              <p className="hover:text-purple-400 cursor-pointer">2 Years</p>
              <p className="hover:text-purple-400 cursor-pointer">3 Years</p>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <h3 className="font-semibold text-lg mb-6">Price Range</h3>
            <input
              type="range"
              min="0"
              max="3000"
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
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
            </h1>
            <span className="text-gray-400 text-sm">
              {filteredProducts.length} items found
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-[#1E1E1E] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10"
                >
                  <div className="h-48 overflow-hidden relative p-4 bg-[#252525]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 ${!product.isStocked ? "opacity-40 grayscale" : ""}`}
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
                    <h3 className="font-medium text-gray-200 mb-4 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="inline-block bg-black/40 rounded-lg px-4 py-2 border border-gray-700">
                      <span className="text-sm font-bold text-white">
                        Rs {product.price}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        / per {product.unit}
                      </span>
                    </div>
                  </div>

                  {product.isStocked && (
                    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#2D2D2D]/95 backdrop-blur-md flex justify-center">
                      <button
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-6 rounded-full shadow-lg transition-colors"
                      >
                        ADD TO QUOTE
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1E1E1E] rounded-xl border border-gray-800">
              <Search className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">
                No products found
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your filters or search query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange(3000);
                  setSelectedCategory(null);
                  setSelectedColor(null);
                }}
                className="mt-6 text-purple-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
