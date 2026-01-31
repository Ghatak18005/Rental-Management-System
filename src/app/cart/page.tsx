'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Trash2, 
  Heart as HeartOutline,
  ChevronLeft,
  Calendar,
  CreditCard,
  X
} from 'lucide-react';

// --- Mock Cart Data ---
const CART_ITEMS = [
  {
    id: '1',
    name: 'High-Performance Gaming PC',
    price: 150.00,
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=200',
    dateRange: 'Oct 12, 2023 - Oct 14, 2023',
    quantity: 1
  },
  {
    id: '2',
    name: 'Canon EOS R5 Camera Kit',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200',
    dateRange: 'Oct 12, 2023 - Oct 13, 2023',
    quantity: 1
  }
];

export default function CartPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [items, setItems] = useState(CART_ITEMS);

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Add tax/delivery logic here if needed

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">YL</span>
              </div>
              <span className="font-bold text-lg tracking-wide">Your Logo</span>
            </div>
            <nav className="hidden lg:flex space-x-8 text-sm text-gray-300">
              <a href="/products" className="hover:text-white transition-colors">Products</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Condition</a>
              <a href="#" className="hover:text-white transition-colors">About us</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search..." className="bg-[#1E1E1E] border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm w-64 focus:border-purple-500 outline-none" />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center space-x-4">
              <Heart className="h-6 w-6 text-gray-400 cursor-pointer hover:text-white" />
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-white cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-400 mb-8">
          <span className="text-white font-semibold">Add to Cart</span> 
          <span className="mx-2">{'>'}</span> 
          <span>Address</span> 
          <span className="mx-2">{'>'}</span> 
          <span>Payment</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- LEFT COLUMN: Order Summary --- */}
          <div className="flex-[2]">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 p-4 bg-[#1E1E1E] rounded-xl border border-gray-800">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">Rs {item.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {item.dateRange}
                        </p>
                      </div>
                      
                      {/* Quantity Adjuster */}
                      <div className="flex items-center bg-black/40 rounded-lg border border-gray-700 px-2 py-1">
                        <button className="text-gray-400 hover:text-white px-2">-</button>
                        <span className="text-sm font-bold mx-2">{item.quantity}</span>
                        <button className="text-gray-400 hover:text-white px-2">+</button>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs font-medium text-gray-400 mt-4">
                      <button className="hover:text-red-400 flex items-center">
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </button>
                      <button className="hover:text-purple-400 flex items-center">
                        <HeartOutline className="w-3 h-3 mr-1" /> Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 flex items-center text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Continue Shopping
            </button>
          </div>

          {/* --- RIGHT COLUMN: Rental Period & Pricing --- */}
          <div className="flex-1">
            <div className="bg-[#1E1E1E] p-6 rounded-xl border border-gray-800 sticky top-24">
              
              {/* Rental Period Inputs */}
              <h3 className="font-semibold mb-4">Rental Period</h3>
              <div className="space-y-3 mb-8">
                <div className="relative">
                  <input type="datetime-local" className="w-full bg-[#2D2D2D] text-sm px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-purple-500 text-gray-300" />
                </div>
                <div className="relative">
                  <input type="datetime-local" className="w-full bg-[#2D2D2D] text-sm px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-purple-500 text-gray-300" />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 text-sm mb-6 border-b border-gray-700 pb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Charges</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sub Total</span>
                  <span>Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-white pt-2">
                  <span>Total</span>
                  <span>Rs {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors">
                  Apply Coupon
                </button>
                <button className="w-full border border-gray-600 hover:border-gray-400 text-gray-300 py-3 rounded-lg transition-colors flex justify-center items-center">
                  Pay with Save Card
                </button>
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[#2D2D2D] hover:bg-purple-600 hover:text-white border border-gray-600 text-gray-300 font-bold py-3 rounded-lg transition-all"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Express Checkout</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-8 grid grid-cols-2 gap-6">
              
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1 uppercase">Card Details</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase">Name</label>
                <input type="text" className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-purple-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase">Email</label>
                <input type="email" className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-purple-500 outline-none" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1 uppercase">Address</label>
                <input type="text" className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-purple-500 outline-none" />
              </div>

              {/* Smaller Fields Row */}
              <div className="col-span-2 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase">Zip Code</label>
                  <input type="text" className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase">City</label>
                  <input type="text" className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase">Country</label>
                  <input type="text" className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-purple-500 outline-none" />
                </div>
              </div>

            </div>

            {/* Footer / Pay Button */}
            <div className="px-8 pb-8 flex justify-end">
              <button className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors">
                Pay Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}