'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingCart, User, ChevronDown, LogOut, Settings, 
  Package, Heart, Loader2, Calendar, X, Info, UserCircle, Filter, 
  CheckCircle2, AlertCircle, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from "next-themes";

// --- Types based on your DB Schema ---
interface ProductTemplate {
  id: string;
  name: string;
  description: string | null;
  cost_price: number | null; 
  quantity_on_hand: number | null;
  sku: string | null;
  is_rentable: boolean;
  category_id: string | null;
  colors?: string[]; 
  duration_options?: string[];
}

// Mock Categories & Colors for the Filter UI
const CATEGORIES = ["Furniture", "Electronics", "Gaming", "Cameras"];
const COLORS = ["#000000", "#FFFFFF", "#374151", "#EF4444", "#EA580C", "#3B82F6"];
const DURATIONS = ["1 Month", "6 Months", "1 Year"];

export default function CustomerDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<ProductTemplate[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(5000);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  // User Interaction State
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState(0); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Quick Rent Modal State
  const [selectedProduct, setSelectedProduct] = useState<ProductTemplate | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    setMounted(true);
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch Products
      const { data: productsData } = await supabase
        .from('product_templates')
        .select('*')
        .eq('is_published', true);

      if (productsData) setProducts(productsData);

      // Fetch Cart Count
      await fetchCartCount(user.id);

      setLoading(false);
    };
    initData();
  }, [router, supabase]);

  // --- 2. HELPER FUNCTIONS ---
  const fetchCartCount = async (userId: string) => {
    const { data: order } = await supabase
      .from('rental_orders')
      .select('id')
      .eq('customer_id', userId)
      .eq('status', 'draft')
      .maybeSingle();

    if (order) {
      const { count } = await supabase
        .from('rental_order_items')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order.id);
      setCartCount(count || 0);
    } else {
      setCartCount(0);
    }
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent opening modal
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      toast.success("Removed from Wishlist");
    } else {
      newWishlist.add(productId);
      toast.success("Added to Wishlist");
    }
    setWishlist(newWishlist);
  };

  // --- 3. HANDLE ADD TO CART ---
  const handleQuickAddToCart = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select rental dates");
      return;
    }
    if (!selectedProduct) return;

    setAddingToCart(true);

    try {
      console.log('🛒 Adding to cart - User:', user.id);
      console.log('🛒 Product:', selectedProduct.id, selectedProduct.name);
      console.log('🛒 Dates:', startDate, 'to', endDate);

      // Check for existing draft order
      let { data: order, error: orderSelectError } = await supabase
        .from('rental_orders')
        .select('id')
        .eq('customer_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();

      console.log('🛒 Existing order check:', order);

      let orderId = order?.id;

      if (!orderId) {
        console.log('🛒 Creating new draft order...');
        const { data: newOrder, error: orderError } = await supabase
          .from('rental_orders')
          .insert({
            customer_id: user.id,
            status: 'draft',
            pickup_date: new Date(startDate).toISOString(),
            return_date: new Date(endDate).toISOString(),
          })
          .select()
          .single();

        if (orderError) {
          console.error('🛒 Order creation error:', orderError);
          throw orderError;
        }
        orderId = newOrder.id;
        console.log('✅ Created new order:', orderId);
      }

      console.log('🛒 Adding item to order:', orderId);
      const { error: itemError } = await supabase
        .from('rental_order_items')
        .insert({
          order_id: orderId,
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          price: selectedProduct.cost_price || 0,
          quantity: 1
        });

      if (itemError) {
        console.error('🛒 Item insertion error:', itemError);
        throw itemError;
      }

      console.log('✅ Item added successfully');
      toast.success("Added to Cart!");
      await fetchCartCount(user.id);
      setSelectedProduct(null); 

    } catch (error: any) {
      console.error('❌ Add to cart error:', error?.message || error);
      toast.error("Failed to add to cart: " + (error?.message || error));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = (product.cost_price || 0) <= priceRange;
      const matchesCategory = selectedCategory 
        ? product.name.toLowerCase().includes(selectedCategory.toLowerCase()) 
        : true;
      const matchesColor = selectedColor ? true : true; 
      const matchesDuration = selectedDuration ? true : true;

      return matchesSearch && matchesPrice && matchesCategory && matchesColor && matchesDuration;
  });

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary transition-colors duration-300">
      
      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* ================= CUSTOM DASHBOARD NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Left: Logo & Nav */}
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => router.push('/dashboard')}>
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <span className="text-primary-foreground font-bold text-xs">RF</span>
              </div>
              <span className="font-bold text-lg tracking-tight">RentFlow</span>
            </div>
            
            <nav className="hidden lg:flex space-x-6 text-sm font-medium text-foreground/60">
              <a href="#" className="hover:text-primary transition-colors">Products</a>
              <a href="#" className="hover:text-primary transition-colors">Orders</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-accent/50 border border-border rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 text-foreground transition-all placeholder:opacity-50"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-foreground/40" />
            </div>

            {/* Icons Group */}
            <div className="flex items-center space-x-4">
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 text-foreground/60 hover:text-primary hover:bg-accent rounded-full transition-all"
                title="Toggle Theme"
              >
                {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <Heart className="h-6 w-6 text-foreground/60 cursor-pointer hover:text-primary transition-colors hidden sm:block" />
              
              <button onClick={() => router.push('/dashboard/cart')} className="text-foreground/60 hover:text-primary relative transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full animate-in zoom-in shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                  className="w-10 h-10 bg-accent rounded-full flex items-center justify-center border border-border hover:border-primary transition-all overflow-hidden"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-foreground/50" />
                  )}
                </button>
                
                {isProfileOpen && (
                  
                  <div className="absolute right-0 mt-4 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-6 py-4 border-b border-border bg-accent/30">
                      <p className="text-sm font-bold text-foreground">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-foreground/50 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <a href="/profile" className="flex items-center px-4 py-2.5 text-sm text-foreground/70 hover:bg-accent rounded-lg transition-colors">
                        <UserCircle className="w-4 h-4 mr-3"/> Profile
                      </a>
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4 mr-3"/> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1600px] mx-auto flex pt-8 px-6 pb-12 gap-8">
        
        {/* ================= LEFT SIDEBAR FILTERS ================= */}
        <aside className="w-64 flex-shrink-0 hidden lg:block space-y-8 sticky top-28 h-fit overflow-y-auto pb-10 scrollbar-hide">
           
           {/* Brand / Category Filter */}
           <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">Category</h3>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="text-xs text-primary hover:underline">Clear</button>
              )}
            </div>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat} 
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`cursor-pointer text-sm flex items-center px-3 py-2 rounded-lg transition-all font-medium ${selectedCategory === cat ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:text-foreground hover:bg-accent'}`}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">Color</h3>
              {selectedColor && (
                <button onClick={() => setSelectedColor(null)} className="text-xs text-primary hover:underline">Clear</button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map((color) => (
                <div 
                  key={color} 
                  onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                  className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-all border-2 shadow-sm ${selectedColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">Max Price</h3>
               {priceRange < 5000 && <button onClick={() => setPriceRange(5000)} className="text-xs text-primary hover:underline">Reset</button>}
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-4 text-xs font-mono font-bold opacity-60">
              <span>₹0</span>
              <span>₹{priceRange}</span>
            </div>
          </div>

          {/* Global Clear */}
          {(selectedCategory || selectedColor || selectedDuration || priceRange < 5000) && (
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setSelectedColor(null);
                setSelectedDuration(null);
                setPriceRange(5000);
              }}
              className="w-full py-3 border border-dashed border-border rounded-xl text-foreground/50 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
            >
              <X size={14} /> Reset Filters
            </button>
          )}
        </aside>

        {/* ================= PRODUCT GRID ================= */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Available Equipment</h1>
              <p className="text-foreground/50 mt-1 font-medium">Found {filteredProducts.length} items matching your criteria</p>
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 bg-card rounded-3xl border border-border text-foreground/40 shadow-sm">
               <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-4">
                 <Filter className="h-8 w-8 opacity-50"/>
               </div>
               <h3 className="text-xl font-bold text-foreground">No products found</h3>
               <p className="text-sm mt-2 max-w-xs text-center">Try adjusting your filters.</p>
               <button 
                 onClick={() => {setSelectedCategory(null); setSelectedColor(null); setSelectedDuration(null); setPriceRange(5000); setSearchQuery('')}}
                 className="mt-6 text-primary hover:underline font-bold text-sm"
               >
                 Clear all filters
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
                  
                  {/* --- WISHLIST BUTTON --- */}
                  <button 
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-4 right-4 z-10 p-2.5 bg-background/50 backdrop-blur-md rounded-full text-foreground hover:bg-red-50 hover:text-red-500 transition-colors border border-transparent hover:border-red-200"
                  >
                    <Heart className={`h-4 w-4 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-foreground/70'}`} />
                  </button>

                  {/* Image Placeholder */}
                  <div className="h-64 overflow-hidden relative p-8 bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <img 
                      src={`https://source.unsplash.com/random/400x400/?technology&sig=${product.id}`} 
                      alt={product.name} 
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                    {!product.is_rentable && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-destructive/10 text-destructive text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-destructive/20 flex items-center gap-2">
                          <AlertCircle size={12} /> Not Rentable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg truncate flex-1 mr-2">{product.name}</h3>
                    </div>
                    <p className="text-xs text-foreground/50 mb-6 h-8 line-clamp-2 leading-relaxed">
                      {product.description || 'Professional grade equipment available for rent.'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div>
                        <span className="text-[10px] font-bold text-foreground/40 block uppercase tracking-wider">Daily Rate</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-primary">₹{product.cost_price || 0}</span>
                          <span className="text-xs text-foreground/40 font-medium">/ day</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedProduct(product)} 
                        disabled={!product.is_rentable}
                        className="bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ================= QUICK RENT MODAL ================= */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-accent/10">
              <div>
                <h2 className="text-lg font-bold">Quick Rent</h2>
                <p className="text-xs text-foreground/50">Configure dates for <span className="text-primary font-bold">{selectedProduct.name}</span></p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-accent rounded-full transition-colors">
                <X className="h-5 w-5 opacity-60" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start p-4 bg-primary/5 border border-primary/10 rounded-xl text-sm text-foreground/70">
                <Info className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                <p className="leading-snug">Selecting dates will temporarily block this item in your cart for 15 minutes.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/40 mb-1.5 uppercase tracking-wider">Pick-up Date</label>
                  <input 
                    type="datetime-local" 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-accent/30 border border-border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/40 mb-1.5 uppercase tracking-wider">Return Date</label>
                  <input 
                    type="datetime-local" 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-accent/30 border border-border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-accent/5">
              <button onClick={() => setSelectedProduct(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-accent transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleQuickAddToCart}
                disabled={addingToCart}
                className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center"
              >
                {addingToCart ? <><Loader2 className="animate-spin h-4 w-4 mr-2"/> Processing...</> : <><CheckCircle2 className="w-4 h-4 mr-2"/> Confirm Booking</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}