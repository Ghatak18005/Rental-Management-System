'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Trash2, Calendar, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  order_id: string;
}

export default function CartPage() {
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);
  
  // Dates for rental
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch cart data
  const fetchCartData = async (currentUserId: string) => {
    try {
      console.log('🔄 FETCHING CART for user:', currentUserId);

      // Get draft order
      const { data: draftOrder, error: orderError } = await supabase
        .from('rental_orders')
        .select('*')
        .eq('customer_id', currentUserId)
        .eq('status', 'draft')
        .maybeSingle();

      if (orderError) {
        console.error('❌ Order error:', orderError);
        throw orderError;
      }

      if (!draftOrder) {
        console.log('📌 No draft order exists');
        setCartItems([]);
        setDraftOrderId(null);
        setStartDate('');
        setEndDate('');
        setLoading(false);
        return;
      }

      console.log('✅ Draft order found:', draftOrder.id);
      setDraftOrderId(draftOrder.id);

      // Get items from this order
      const { data: items, error: itemsError } = await supabase
        .from('rental_order_items')
        .select('*')
        .eq('order_id', draftOrder.id);

      if (itemsError) {
        console.error('❌ Items error:', itemsError);
        throw itemsError;
      }

      console.log(`📦 Found ${items?.length || 0} items:`, items);
      setCartItems(items || []);

      // Set dates
      if (draftOrder.pickup_date) {
        setStartDate(new Date(draftOrder.pickup_date).toISOString().split('T')[0]);
      }
      if (draftOrder.return_date) {
        setEndDate(new Date(draftOrder.return_date).toISOString().split('T')[0]);
      }

    } catch (error: any) {
      console.error('❌ Error fetching cart:', error?.message || error);
      toast.error('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - get user and fetch cart
  useEffect(() => {
    const initCart = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }

        console.log('👤 User authenticated:', user.id);
        setUserId(user.id);
        await fetchCartData(user.id);
      } catch (error) {
        console.error('Init error:', error);
      }
    };

    initCart();
  }, []);

  // Set up real-time subscription to cart items
  useEffect(() => {
    if (!draftOrderId) return;

    console.log('🔗 Setting up real-time subscription for order:', draftOrderId);

    // Subscribe to rental_order_items changes
    const subscription = supabase
      .channel(`order-items-${draftOrderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_order_items',
          filter: `order_id=eq.${draftOrderId}`,
        },
        (payload) => {
          console.log('🔔 Real-time update received:', payload.eventType, payload.new);
          if (userId) {
            fetchCartData(userId);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔗 Unsubscribing from real-time');
      supabase.removeChannel(subscription);
    };
  }, [draftOrderId, userId]);

  // Listen for page visibility to refresh cart when coming back to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId) {
        console.log('👁️ Page became visible - refreshing cart');
        fetchCartData(userId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId]);

  // --- CALCULATIONS ---
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity * days);
    }, 0);
  };

  // --- ACTIONS ---
  const handleRemoveItem = async (id: string) => {
    try {
      const { error } = await supabase.from('rental_order_items').delete().eq('id', id);
      if (error) throw error;
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select rental dates');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);

    try {
      if (!draftOrderId) throw new Error('No draft order found');

      const totalAmount = calculateTotal();
      console.log('💳 Processing checkout - Total:', totalAmount);

      // Update the draft order status and dates
      const { error: updateError } = await supabase
        .from('rental_orders')
        .update({
          total_amount: totalAmount,
          status: 'Quotation',
          pickup_date: new Date(startDate).toISOString(),
          return_date: new Date(endDate).toISOString(),
        })
        .eq('id', draftOrderId);

      if (updateError) throw updateError;

      console.log('✅ Order updated successfully');
      toast.success('Quote Request Created! Proceeding to payment...');

      setTimeout(() => {
        router.push(`/dashboard/checkout?orderId=${draftOrderId}`);
      }, 500);
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Checkout failed: ' + (err?.message || err));
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-purple-600 h-8 w-8" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-purple-600" />
            Your Cart
          </h1>
          <button
            onClick={() => userId && fetchCartData(userId)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            🔄 Refresh
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: CART ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-6 border border-gray-100"
                >
                  <div className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Product</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.product_name}</h3>
                    <p className="text-gray-500 text-sm">Unit Price: ₹{item.price}/day</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-bold">Qty</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-6">
                <h2 className="text-xl font-bold mb-6">Rental Summary</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span>Total Items</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rental Duration</span>
                    <span>{calculateDays()} Days</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                    <span>Estimated Total</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5" /> Request Quote
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}