'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, Heart, ShoppingCart, User, Trash2, Heart as HeartOutline,
  ChevronLeft, Calendar, CreditCard, X, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH CART FROM DB ---
  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orderData } = await supabase
        .from('rental_orders')
        .select('*')
        .eq('customer_id', user.id)
        .eq('status', 'draft')
        .single();

      if (orderData) {
        setOrder(orderData);
        const { data: items } = await supabase
          .from('rental_order_items')
          .select('*')
          .eq('order_id', orderData.id);
        setCartItems(items || []);
      }
      setLoading(false);
    };

    fetchCart();
  }, [supabase]);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalTotal = subtotal;

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase.from('rental_order_items').delete().eq('id', itemId);
    if (!error) {
      setCartItems(prev => prev.filter(i => i.id !== itemId));
      toast.success("Item removed");
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (order) {
       await supabase.from('rental_orders')
        .update({ status: 'confirmed', total_amount: finalTotal })
        .eq('id', order.id);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setCartItems([]);
    toast.success("Payment Successful! Order Confirmed.");
    router.push('/dashboard');
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
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="font-bold text-lg tracking-wide cursor-pointer" onClick={() => router.push('/dashboard')}>RentFlow</div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-white" />
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="text-sm text-gray-400 mb-8 flex items-center">
          <span className="text-white font-semibold underline decoration-purple-500 underline-offset-4">Add to Cart</span> 
          <span className="mx-3 text-gray-600">{'>'}</span> 
          <span>Address</span> 
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-[2]">
            <h2 className="text-xl font-bold mb-8 flex items-center">
              Order Summary
              <span className="ml-auto text-sm font-normal text-gray-400">Rs {subtotal.toFixed(2)}</span>
            </h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-20 bg-[#1E1E1E] rounded-xl border border-gray-800 text-gray-500">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 pb-8 border-b border-gray-800">
                    <div className="w-24 h-24 bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-800">
                      <img src={item.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-200">{item.product_name}</h3>
                        <p className="text-sm font-mono text-gray-400 mt-1">Rs {item.price}</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <Calendar className="w-3 h-3 mr-2" />
                          {order ? `${new Date(order.pickup_date).toLocaleDateString()} - ${new Date(order.return_date).toLocaleDateString()}` : 'Dates not set'}
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="hover:text-red-400 flex items-center transition-colors text-xs text-gray-500 mt-2">
                        <Trash2 className="w-3 h-3 mr-1.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-gray-800 sticky top-28 shadow-xl">
              <h3 className="font-semibold mb-6 text-gray-200">Rental Period</h3>
              <div className="space-y-4 mb-10">
                 <div className="bg-[#121212] px-4 py-3 rounded-lg border border-gray-700 text-sm text-gray-300">
                    <span className="text-xs text-gray-500 block uppercase mb-1">Pickup</span>
                    {order ? new Date(order.pickup_date).toLocaleString() : '-'}
                 </div>
                 <div className="bg-[#121212] px-4 py-3 rounded-lg border border-gray-700 text-sm text-gray-300">
                    <span className="text-xs text-gray-500 block uppercase mb-1">Return</span>
                    {order ? new Date(order.return_date).toLocaleString() : '-'}
                 </div>
              </div>

              <div className="space-y-4 text-sm mb-8 border-b border-gray-700 pb-8">
                <div className="flex justify-between font-bold text-xl text-white pt-2">
                  <span>Total</span>
                  <span>Rs {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-[#064e18] hover:bg-[#086320] text-white font-bold py-3.5 rounded-lg border border-green-800">
                  Apply Coupon
                </button>
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={cartItems.length === 0}
                  className="w-full bg-[#121212] hover:bg-black border border-gray-600 text-white font-bold py-3.5 rounded-lg disabled:opacity-50"
                >
                  Checkout
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <form onSubmit={handlePayment} className="bg-[#1E1E1E] w-full max-w-3xl rounded-xl border border-gray-800 p-8 relative">
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>
              <h2 className="text-xl font-bold mb-6">Express Checkout</h2>
              <div className="space-y-4">
                 <input required type="text" placeholder="Card Number" className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white" />
                 <div className="flex justify-end">
                    <button type="submit" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800">
                       {isProcessing ? 'Processing...' : 'Pay Now'}
                    </button>
                 </div>
              </div>
           </form>
        </div>
      )}

    </div>
  );
}