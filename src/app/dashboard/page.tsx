'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingCart, User, ChevronDown, LogOut, Settings, 
  Package, Heart, Loader2, Calendar, X, Info, UserCircle, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  // Mocking these for UI filters since they aren't in DB yet
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
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<ProductTemplate[]>([]);
  
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
      let { data: order } = await supabase
        .from('rental_orders')
        .select('id')
        .eq('customer_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();

      let orderId = order?.id;

      if (!orderId) {
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

        if (orderError) throw orderError;
        orderId = newOrder.id;
      }

      const { error: itemError } = await supabase
        .from('rental_order_items')
        .insert({
          order_id: orderId,
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          price: selectedProduct.cost_price || 0,
          quantity: 1
        });

      if (itemError) throw itemError;

      toast.success("Added to Cart!");
      await fetchCartCount(user.id);
      setSelectedProduct(null); 

    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add to cart");
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
     // 1. Search
     const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
     
     // 2. Price
     const matchesPrice = (product.cost_price || 0) <= priceRange;
     
     // 3. Category (Mock logic: Checking if name contains category keyword for now as DB category_id is uuid)
     // In real app: join category table or check category_id
     const matchesCategory = selectedCategory 
       ? product.name.toLowerCase().includes(selectedCategory.toLowerCase()) // Simple keyword match for demo
       : true;

     // 4. Color & Duration (Mock logic for UI demo since columns missing in DB)
     // These will pass true for now to show functionality
     const matchesColor = selectedColor ? true : true; 
     const matchesDuration = selectedDuration ? true : true;

     return matchesSearch && matchesPrice && matchesCategory && matchesColor && matchesDuration;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">YL</span>
              </div>
              <span className="font-bold text-lg tracking-wide">RentFlow</span>
            </div>
            <nav className="hidden lg:flex space-x-8 text-sm text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Products</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1E1E1E] border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-purple-500 w-64 text-white"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-5">
              <Heart className="h-6 w-6 text-gray-400 cursor-pointer hover:text-white" />
              
              <button onClick={() => router.push('/dashboard/cart')} className="text-gray-400 hover:text-white relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:ring-2 hover:ring-purple-500 transition-all overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-gray-300" />
                  )}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-[#1E1E1E] border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700">
                      <p className="text-sm text-white font-bold">{user.user_metadata?.full_name || 'User'}</p>
                    </div>
                    <a href="/profile" className="flex items-center px-6 py-3 text-sm text-gray-200 hover:bg-gray-800"><UserCircle className="w-4 h-4 mr-3"/> Profile</a>
                    <button onClick={handleLogout} className="w-full flex items-center px-6 py-3 text-sm text-red-400 hover:bg-gray-800"><LogOut className="w-4 h-4 mr-3"/> Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto flex pt-8 px-6 pb-12 gap-8">
        
        {/* ================= LEFT SIDEBAR FILTERS ================= */}
        <aside className="w-64 flex-shrink-0 hidden lg:block space-y-8 sticky top-28 h-fit overflow-y-auto pb-10">
           
           {/* Brand / Category Filter */}
           <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Category</h3>
              {selectedCategory ? (
                <button onClick={() => setSelectedCategory(null)} className="text-xs text-purple-400 hover:text-purple-300">Clear</button>
              ) : <span className="bg-gray-700 w-5 h-0.5"></span>}
            </div>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat} 
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`cursor-pointer text-sm flex items-center p-2 rounded-lg transition-all ${selectedCategory === cat ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Color</h3>
              {selectedColor ? (
                <button onClick={() => setSelectedColor(null)} className="text-xs text-purple-400 hover:text-purple-300">Clear</button>
              ) : <span className="bg-gray-700 w-5 h-0.5"></span>}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map((color) => (
                <div 
                  key={color} 
                  onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                  className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-all border-2 ${selectedColor === color ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Duration</h3>
              {selectedDuration ? (
                <button onClick={() => setSelectedDuration(null)} className="text-xs text-purple-400 hover:text-purple-300">Clear</button>
              ) : <span className="bg-gray-700 w-5 h-0.5"></span>}
            </div>
            <div className="space-y-2">
              {DURATIONS.map((dur) => (
                <div 
                  key={dur} 
                  onClick={() => setSelectedDuration(selectedDuration === dur ? null : dur)}
                  className={`cursor-pointer text-sm p-2 rounded-lg transition-all ${selectedDuration === dur ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  {dur}
                </div>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="bg-[#1E1E1E] p-5 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-semibold text-lg">Price Range</h3>
               {priceRange < 5000 && <button onClick={() => setPriceRange(5000)} className="text-xs text-purple-400 hover:text-purple-300">Reset</button>}
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between mt-4 text-xs font-mono text-gray-400">
              <span>$0</span>
              <span>${priceRange}</span>
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
              className="w-full py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm"
            >
              Reset All Filters
            </button>
          )}
        </aside>

        {/* ================= PRODUCT GRID ================= */}
        <main className="flex-1">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold">Available Equipment</h1>
              <p className="text-sm text-gray-400 mt-1">Showing {filteredProducts.length} results</p>
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 bg-[#1E1E1E] rounded-xl border border-gray-800 text-gray-400">
               <Filter className="h-16 w-16 mb-4 opacity-20"/>
               <h3 className="text-xl font-bold">No products found</h3>
               <p className="text-sm mt-2 text-gray-500">Try adjusting your filters to see more results.</p>
               <button 
                 onClick={() => {setSelectedCategory(null); setSelectedColor(null); setSelectedDuration(null); setPriceRange(5000); setSearchQuery('')}}
                 className="mt-6 text-purple-400 hover:underline"
               >
                 Clear all filters
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative bg-[#1E1E1E] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all hover:shadow-2xl">
                  
                  {/* --- WISHLIST BUTTON (Added) --- */}
                  <button 
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-purple-600 transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${wishlist.has(product.id) ? 'fill-white text-white' : 'text-gray-300'}`} />
                  </button>

                  {/* Image Placeholder */}
                  <div className="h-56 overflow-hidden relative p-6 bg-[#252525] flex items-center justify-center group-hover:bg-[#2a2a2a] transition-colors">
                    <img 
                      src={`https://source.unsplash.com/random/400x400/?technology&sig=${product.id}`} 
                      alt={product.name} 
                      className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                    {!product.is_rentable && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-red-400">Not Rentable</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-100 truncate text-lg flex-1 mr-2">{product.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 h-8 line-clamp-2">{product.description || 'Professional grade equipment available for rent.'}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-xs text-gray-400 block uppercase">Price</span>
                        <span className="text-lg font-bold text-purple-400">Rs {product.cost_price || 0}</span>
                        <span className="text-[10px] text-gray-500 ml-1">/ day</span>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedProduct(product)} 
                        disabled={!product.is_rentable}
                        className="bg-white text-black hover:bg-purple-500 hover:text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Rent {selectedProduct.name}</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-sm text-purple-200">
                <Info className="h-4 w-4 mr-2" />
                Select dates to check availability.
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Start Date</label>
                  <input 
                    type="datetime-local" 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg py-2 px-4 text-white text-sm focus:border-purple-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">End Date</label>
                  <input 
                    type="datetime-local" 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg py-2 px-4 text-white text-sm focus:border-purple-500 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-[#1a1a1a] rounded-b-2xl">
              <button onClick={() => setSelectedProduct(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800">
                Cancel
              </button>
              <button 
                onClick={handleQuickAddToCart}
                disabled={addingToCart}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {addingToCart ? <span className="flex items-center"><Loader2 className="animate-spin h-4 w-4 mr-2"/> Adding...</span> : 'Confirm & Add'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}