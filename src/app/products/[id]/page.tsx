'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Calendar, Info, CheckCircle, X, ChevronDown, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

// --- Mock Data ---
const PRODUCT_DETAILS = {
  id: '1',
  name: 'High-Performance Gaming PC',
  basePrice: 150,
  unit: 'Day',
  description: 'Top-tier gaming rig equipped with RTX 4090, 64GB RAM.',
  images: [
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800'
  ],
  attributes: [
    { name: 'RAM', options: ['32GB', '64GB (+ $20)', '128GB (+ $50)'] },
    { name: 'Storage', options: ['1TB SSD', '2TB NVMe (+ $15)'] }
  ],
  variants: [
    { color: '#EF4444', name: 'Red Beast' },
    { color: '#3B82F6', name: 'Ice Blue' },
    { color: '#10B981', name: 'Toxic Green' }
  ]
};

export default function ProductDetailPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // UI State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Selection State
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const currentVariant = PRODUCT_DETAILS.variants[selectedVariantIdx];

  useEffect(() => setMounted(true), []);

  // --- ADD TO CART LOGIC ---
  const handleAddToCart = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select rental dates first");
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to add items");
        router.push('/login');
        return;
      }

      // 1. Check if a DRAFT order (Cart) exists
      let { data: order } = await supabase
        .from('rental_orders')
        .select('id')
        .eq('customer_id', user.id)
        .eq('status', 'draft')
        .single();

      let orderId = order?.id;

      // 2. If no cart exists, create one
      if (!orderId) {
        const { data: newOrder, error: orderError } = await supabase
          .from('rental_orders')
          .insert({
            customer_id: user.id,
            status: 'draft',
            pickup_date: new Date(startDate).toISOString(),
            return_date: new Date(endDate).toISOString(),
            total_amount: 0,
            security_deposit: 0
          })
          .select()
          .single();

        if (orderError) throw orderError;
        orderId = newOrder.id;
      }

      // 3. Add Item to Cart (rental_order_items)
      const { error: itemError } = await supabase
        .from('rental_order_items')
        .insert({
          order_id: orderId,
          product_id: PRODUCT_DETAILS.id,
          product_name: `${PRODUCT_DETAILS.name} (${currentVariant.name})`,
          price: PRODUCT_DETAILS.basePrice,
          image_url: PRODUCT_DETAILS.images[0],
          quantity: 1
        });

      if (itemError) throw itemError;

      toast.success("Added to Cart!"); 
      router.push('/cart');

    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20 transition-colors duration-300">
      
      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left: Images */}
        <div className="flex-1 space-y-4">
          <div className="bg-card rounded-3xl border border-border p-8 h-[500px] flex items-center justify-center relative overflow-hidden shadow-sm group">
            <button 
                onClick={() => router.back()} 
                className="absolute top-4 left-4 p-2 bg-accent/50 rounded-full hover:bg-accent transition-colors z-20"
            >
                <ArrowLeft className="h-5 w-5 opacity-60" />
            </button>
            <img 
                src={PRODUCT_DETAILS.images[activeImage]} 
                className="max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {PRODUCT_DETAILS.images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`w-24 h-24 bg-card rounded-xl border cursor-pointer overflow-hidden flex-shrink-0 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-accent/50 text-foreground/60 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Gaming</span>
                <span className="bg-green-500/10 text-green-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-green-500/20">In Stock</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{PRODUCT_DETAILS.name}</h1>
            <p className="text-foreground/60 mt-4 leading-relaxed max-w-md">{PRODUCT_DETAILS.description}</p>
            
            <div className="mt-6 flex items-baseline gap-2">
               <span className="text-4xl font-black text-primary">₹{PRODUCT_DETAILS.basePrice}</span>
               <span className="text-sm text-foreground/40 font-medium">/ {PRODUCT_DETAILS.unit}</span>
            </div>
          </div>

          {/* Configuration Selection */}
          <div className="space-y-4 pt-4 border-t border-border">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground/70">Selected Configuration</span>
                <button 
                    onClick={() => setIsConfigOpen(true)}
                    className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                >
                    Edit <ChevronDown size={14} />
                </button>
             </div>
             <div className="flex gap-3">
                <div className="bg-accent/30 border border-border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentVariant.color }}></div>
                    {currentVariant.name}
                </div>
                <div className="bg-accent/30 border border-border px-4 py-2 rounded-lg text-sm font-medium text-foreground/70">
                    Standard Spec
                </div>
             </div>
          </div>

          {/* Date Picker */}
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4 shadow-sm">
            <h3 className="font-bold flex items-center text-sm uppercase tracking-wider text-foreground/70">
              <Calendar className="h-4 w-4 mr-2 text-primary" /> Rental Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-foreground/40 mb-1.5 uppercase">Start Date</label>
                <input 
                  type="datetime-local" 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-accent/30 border border-border text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-foreground/40 mb-1.5 uppercase">End Date</label>
                <input 
                  type="datetime-local" 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-accent/30 border border-border text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground" 
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button 
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-50 transition-all text-lg"
            >
              {loading ? <><Loader2 className="animate-spin mr-2"/> Adding...</> : "Add to Cart"}
            </button>
            <button className="px-4 py-4 rounded-xl border border-border hover:bg-accent hover:text-red-500 transition-all text-foreground/50">
                <Star size={24} />
            </button>
          </div>
        </div>
      </main>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-accent/10">
              <h2 className="text-lg font-bold">Configure Product</h2>
              <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="h-5 w-5 opacity-60" /></button>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-xs font-bold text-foreground/40 mb-3 uppercase tracking-wider">Select Color Variant</label>
                <div className="flex gap-4">
                  {PRODUCT_DETAILS.variants.map((v, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`group relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${selectedVariantIdx === idx ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: v.color }}
                    >
                      {selectedVariantIdx === idx && <CheckCircle2 className="text-white drop-shadow-md w-6 h-6" />}
                      <span className="absolute -bottom-6 text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-foreground/40 mb-3 uppercase tracking-wider">Upgrades (Coming Soon)</label>
                 <div className="flex flex-col gap-2 opacity-50">
                    <div className="p-3 border border-border rounded-lg bg-accent/10 text-sm">32GB RAM (Standard)</div>
                    <div className="p-3 border border-border rounded-lg bg-accent/10 text-sm">1TB SSD (Standard)</div>
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end bg-accent/5">
              <button 
                onClick={() => { setIsConfigOpen(false); toast.success("Configuration Saved"); }}
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}