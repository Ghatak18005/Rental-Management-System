'use client';

import React, { useState } from 'react';
import { ShoppingCart, Star, Calendar, Info, CheckCircle, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // Import Supabase
import toast from 'react-hot-toast';

// ... (Keep your existing PRODUCT_DETAILS constant and imports) ...
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
  
  // State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Configuration State
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({
    'RAM': PRODUCT_DETAILS.attributes[0].options[0],
    'Storage': PRODUCT_DETAILS.attributes[1].options[0]
  });
  
  // Rental Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const currentVariant = PRODUCT_DETAILS.variants[selectedVariantIdx];

  // --- ADD TO CART (DB) LOGIC ---
  const handleAddToCart = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select rental dates");
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

      // 1. Check if a DRAFT order exists
      let { data: order } = await supabase
        .from('rental_orders')
        .select('id')
        .eq('customer_id', user.id)
        .eq('status', 'draft')
        .single();

      let orderId = order?.id;

      // 2. If no draft, create one
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

      // 3. Add Item to 'rental_order_items'
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

      toast.success("Added to Quote!");
      router.push('/cart');

    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4 flex justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
           <span className="font-bold text-lg">RentFlow</span>
        </div>
        <div className="flex items-center space-x-4">
           <ShoppingCart className="h-6 w-6 text-white cursor-pointer" onClick={() => router.push('/cart')} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Images Section (Same as before) */}
        <div className="flex-1 space-y-4">
           {/* ... Image gallery code ... */}
           <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-8 h-[500px] flex items-center justify-center relative overflow-hidden">
            <img src={PRODUCT_DETAILS.images[activeImage]} className="max-h-full object-contain" />
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{PRODUCT_DETAILS.name}</h1>
            <div className="mt-4 text-3xl font-bold">
               Rs {PRODUCT_DETAILS.basePrice} <span className="text-sm text-gray-400 font-normal">/ {PRODUCT_DETAILS.unit}</span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="bg-[#1E1E1E] p-6 rounded-xl border border-gray-700 space-y-4">
            <h3 className="font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" /> Rental Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">START DATE</label>
                <input 
                  type="datetime-local" 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#2D2D2D] text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-600" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">END DATE</label>
                <input 
                  type="datetime-local" 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#2D2D2D] text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-600" 
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add to Quote"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}