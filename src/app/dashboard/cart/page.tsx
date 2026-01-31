'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Trash2, Calendar, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  product_id: string;
  product: {
    name: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
  rental_days: number;
}

export default function CartPage() {
  const router = useRouter();
  const supabase = createClient();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Dates for rental
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- FETCH CART ---
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch cart items joined with product details
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            id, quantity, rental_days, product_id,
            product:products(name, price, image_url)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setCartItems(data || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [supabase, router]); // <--- Fixed: Only one closing here

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
      return total + (item.product.price * item.quantity * days);
    }, 0);
  };

  // --- ACTIONS ---
  const handleRemoveItem = async (id: string) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', id);
      if (error) throw error;
      setCartItems(prev => prev.filter(item => item.id !== id));
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
    setCheckoutLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Create Rental Order
      const { data: order, error: orderError } = await supabase
        .from('rental_orders')
        .insert({
          customer_id: user.id,
          total_amount: calculateTotal(),
          status: 'Quotation', // Starts as a quote request
          rental_start: startDate,
          rental_end: endDate
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('rental_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear Cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      toast.success('Quote Request Sent!');
      router.push('/dashboard/orders');

    } catch (err: any) {
      console.error(err);
      toast.error('Checkout failed: ' + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-purple-600"/> 
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
            <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: CART ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-6 border border-gray-100">
                  <div className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                     {/* Placeholder image if none exists */}
                     {item.product.image_url ? (
                       <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover"/>
                     ) : (
                       <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                     )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.product.name}</h3>
                    <p className="text-gray-500 text-sm">Unit Price: ₹{item.product.price}/day</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
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
                      <Loader2 className="h-5 w-5 animate-spin"/> Processing...
                    </>
                  ) : (
                    <>
                      Request Quote <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  This sends a request to the admin for approval.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}