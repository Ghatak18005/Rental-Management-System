'use client';

import React, { useState } from 'react';
import { 
  Search, Heart, ShoppingCart, User, Trash2, Heart as HeartOutline,
  ChevronLeft, Calendar, CreditCard, X, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, total, clearCart } = useCart(); // Real Data from Context
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Totals Calculation
  const subtotal = total;
  const deliveryCharges = 0;
  const finalTotal = subtotal + deliveryCharges;

  // Payment Handler
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Payment Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsCheckoutOpen(false);
    clearCart();
    toast.success("Payment Successful! Order Confirmed.");
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* ================= HEADER (Matches Dashboard) ================= */}
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
              <a href="/dashboard" className="hover:text-white transition-colors">Products</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Condition</a>
              <a href="#" className="hover:text-white transition-colors">About us</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search..." className="bg-[#1E1E1E] border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm w-64 focus:border-purple-500 outline-none text-white" />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-5">
              <Heart className="h-6 w-6 text-gray-400 cursor-pointer hover:text-white" />
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-white cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              </div>
              <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:ring-2 hover:ring-purple-500 transition-all focus:outline-none">
                <User className="h-5 w-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-400 mb-8 flex items-center">
          <span className="text-white font-semibold underline decoration-purple-500 underline-offset-4">Add to Cart</span> 
          <span className="mx-3 text-gray-600">{'>'}</span> 
          <span>Address</span> 
          <span className="mx-3 text-gray-600">{'>'}</span> 
          <span>Payment</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* --- LEFT COLUMN: Order Summary --- */}
          <div className="flex-[2]">
            <h2 className="text-xl font-bold mb-8 flex items-center">
              Order Summary
              <span className="ml-auto text-sm font-normal text-gray-400">Rs {subtotal.toFixed(2)}</span>
            </h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-[#1E1E1E] rounded-xl border border-gray-800 text-gray-500">
                Your cart is empty. <br/>
                <button onClick={() => router.push('/dashboard')} className="text-purple-400 hover:underline mt-2">Browse Products</button>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-6 pb-8 border-b border-gray-800 last:border-0">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-[#1E1E1E] rounded-xl overflow-hidden flex-shrink-0 border border-gray-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-200">{item.name}</h3>
                          <p className="text-sm font-mono text-gray-400 mt-1">Rs {item.price.toFixed(2)}</p>
                          
                          {/* Config Details */}
                          <div className="flex flex-wrap gap-2 mt-2">
                             <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-400 border border-gray-700">
                               {item.configuration.color}
                             </span>
                             {Object.entries(item.configuration.variants).map(([k, v]) => (
                               <span key={k} className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-400 border border-gray-700">
                                 {v}
                               </span>
                             ))}
                          </div>

                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Calendar className="w-3 h-3 mr-2" />
                            {new Date(item.rentalPeriod.start).toLocaleDateString()} - {new Date(item.rentalPeriod.end).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Quantity Adjuster */}
                        <div className="flex items-center bg-[#1E1E1E] rounded-lg border border-gray-700 px-3 py-1.5">
                          <button className="text-gray-400 hover:text-white px-2 font-bold text-lg">-</button>
                          <span className="text-sm font-bold mx-3 min-w-[12px] text-center">{item.quantity}</span>
                          <button className="text-gray-400 hover:text-white px-2 font-bold text-lg">+</button>
                        </div>
                      </div>

                      <div className="flex gap-6 text-xs font-medium text-gray-500 mt-4">
                        <button onClick={() => removeFromCart(item.id)} className="hover:text-red-400 flex items-center transition-colors">
                          <Trash2 className="w-3 h-3 mr-1.5" /> Remove
                        </button>
                        <button className="hover:text-purple-400 flex items-center transition-colors">
                          <HeartOutline className="w-3 h-3 mr-1.5" /> Save for Later
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-12 w-full py-4 border border-gray-700 rounded-xl text-gray-300 hover:border-gray-500 hover:text-white hover:bg-[#1E1E1E] transition-all flex items-center justify-center font-medium"
            >
              Continue Shopping <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
            </button>
          </div>

          {/* --- RIGHT COLUMN: Rental Period & Pricing --- */}
          <div className="flex-1">
            <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-gray-800 sticky top-28 shadow-xl">
              
              {/* Rental Period Inputs (Global Override) */}
              <h3 className="font-semibold mb-6 text-gray-200">Rental Period</h3>
              <div className="space-y-4 mb-10">
                <div className="relative group">
                  <input type="datetime-local" className="w-full bg-[#121212] text-sm px-4 py-3.5 rounded-lg border border-gray-700 outline-none focus:border-purple-500 text-gray-300 transition-colors" />
                  <Calendar className="absolute right-4 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-purple-500 pointer-events-none" />
                </div>
                <div className="relative group">
                  <input type="datetime-local" className="w-full bg-[#121212] text-sm px-4 py-3.5 rounded-lg border border-gray-700 outline-none focus:border-purple-500 text-gray-300 transition-colors" />
                  <Calendar className="absolute right-4 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-purple-500 pointer-events-none" />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-4 text-sm mb-8 border-b border-gray-700 pb-8">
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Charges</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sub Total</span>
                  <span>Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-white pt-2">
                  <span>Total</span>
                  <span>Rs {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Specific Green Button from Wireframe */}
                <button className="w-full bg-[#064e18] hover:bg-[#086320] text-white font-bold py-3.5 rounded-lg transition-colors border border-green-800 shadow-lg shadow-green-900/20">
                  Apply Coupon
                </button>
                
                <button className="w-full border border-gray-600 hover:border-gray-400 text-gray-300 py-3.5 rounded-lg transition-colors flex justify-center items-center bg-transparent">
                  Pay with Save Card
                </button>
                
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={cart.length === 0}
                  className="w-full bg-[#121212] hover:bg-black border border-gray-600 text-white font-bold py-3.5 rounded-lg transition-all hover:border-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ================= EXPRESS CHECKOUT MODAL ================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] w-full max-w-3xl rounded-xl border border-gray-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center bg-[#1E1E1E]">
              <h2 className="text-xl font-bold text-white">Express Checkout</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handlePayment} className="p-10">
              <div className="mb-8">
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Card Details</label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="XXXX XXXX XXXX XXXX" 
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg py-3.5 pl-12 pr-4 text-white focus:border-purple-500 outline-none font-mono tracking-widest transition-all" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Name</label>
                  <input type="text" className="w-full bg-[#121212] border border-gray-700 rounded-lg py-3.5 px-4 text-white focus:border-purple-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Email</label>
                  <input type="email" className="w-full bg-[#121212] border border-gray-700 rounded-lg py-3.5 px-4 text-white focus:border-purple-500 outline-none transition-all" required />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Address</label>
                <input type="text" className="w-full bg-[#121212] border border-gray-700 rounded-lg py-3.5 px-4 text-white focus:border-purple-500 outline-none transition-all" required />
              </div>

              {/* Smaller Fields Row */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Zip Code</label>
                  <input type="text" className="w-full bg-[#121212] border border-gray-700 rounded-lg py-3.5 px-4 text-white focus:border-purple-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">City</label>
                  <input type="text" className="w-full bg-[#121212] border border-gray-700 rounded-lg py-3.5 px-4 text-white focus:border-purple-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Country</label>
                  <input type="text" className="w-full bg-[#121212] border border-gray-700 rounded-lg py-3.5 px-4 text-white focus:border-purple-500 outline-none transition-all" required />
                </div>
              </div>

              {/* Footer / Pay Button */}
              <div className="flex justify-end pt-4 border-t border-gray-800">
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold py-3.5 px-10 rounded-lg shadow-lg shadow-blue-900/30 transition-all transform hover:scale-[1.02] flex items-center"
                >
                  {isProcessing ? (
                    <> <Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing... </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}