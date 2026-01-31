'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  User, 
  Star, 
  Clock, 
  Calendar, 
  CheckCircle, 
  X,
  ChevronDown,
  Info
} from 'lucide-react';

// --- Mock Data for a Single Product ---
const PRODUCT_DETAILS = {
  id: '1',
  name: 'High-Performance Gaming PC',
  price: 150, // Base price
  unit: 'Day', // [cite: 130-132] Pricing per Hour/Day/Week
  description: 'Top-tier gaming rig equipped with RTX 4090, 64GB RAM, and liquid cooling. Perfect for esports tournaments or high-end rendering tasks.',
  images: [
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800'
  ],
  attributes: [
    { name: 'RAM', options: ['32GB', '64GB (+ $20)', '128GB (+ $50)'] }, // [cite: 138-140] Attributes
    { name: 'Storage', options: ['1TB SSD', '2TB NVMe (+ $15)'] },
    { name: 'Peripherals', options: ['None', 'Mouse & Keyboard', 'Full Stream Setup'] }
  ],
  variants: [
    { color: '#EF4444', name: 'Red Beast' }, // [cite: 139] Color Attribute
    { color: '#3B82F6', name: 'Ice Blue' },
    { color: '#10B981', name: 'Toxic Green' }
  ]
};

export default function ProductDetailPage() {
  const [isConfigOpen, setIsConfigOpen] = useState(false); // Controls the "Configure" Modal
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [rentalPeriod, setRentalPeriod] = useState({ start: '', end: '' });

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      
      {/* ================= HEADER (Simplified for context) ================= */}
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-xs">YL</span>
          </div>
          <span className="font-bold text-lg">Your Logo</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <input type="text" placeholder="Search..." className="bg-[#1E1E1E] border border-gray-700 rounded-full py-2 px-4 text-sm w-64" />
          </div>
          <button className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
            <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">1</span>
          </button>
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        </div>
      </header>

      {/* ================= PRODUCT PAGE CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* --- LEFT: Image Gallery --- */}
        <div className="flex-1 space-y-4">
          <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-8 h-[500px] flex items-center justify-center relative overflow-hidden group">
            <img 
              src={PRODUCT_DETAILS.images[0]} 
              alt="Product Main" 
              className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500" 
            />
            <button className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-purple-600 transition-colors">
              <Heart className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {PRODUCT_DETAILS.images.map((img, idx) => (
              <div key={idx} className="w-24 h-24 bg-[#1E1E1E] rounded-xl border border-gray-700 cursor-pointer hover:border-purple-500 overflow-hidden">
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: Product Details & Configuration --- */}
        <div className="flex-1 space-y-8">
          
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-100 mb-2">{PRODUCT_DETAILS.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Rentable</span> {/* [cite: 129] */}
                  <span>•</span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-white">4.8</span>
                  </div>
                  <span>(120 Reviews)</span>
                </div>
              </div>
              
              {/* Price Block */}
              <div className="text-right">
                <p className="text-3xl font-bold text-white">Rs {PRODUCT_DETAILS.price}</p>
                <p className="text-sm text-gray-400">/ per {PRODUCT_DETAILS.unit}</p> {/* [cite: 130-132] */}
              </div>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed text-lg">
            {PRODUCT_DETAILS.description}
          </p>

          <hr className="border-gray-800" />

          {/* --- RENTAL PERIOD SELECTOR (Matches Wireframe Date Picker) --- */}
          <div className="bg-[#1E1E1E] p-6 rounded-xl border border-gray-700 space-y-4">
            <h3 className="font-semibold text-gray-200 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" /> 
              Rental Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase">Start Date</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-[#2D2D2D] text-white text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase">End Date</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-[#2D2D2D] text-white text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none" 
                />
              </div>
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl border border-gray-600 flex items-center justify-center transition-all"
            >
              <Info className="h-5 w-5 mr-2" />
              Configure Attributes
            </button>

            <button className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/50 flex items-center justify-center transition-all transform hover:-translate-y-1">
              Add to Quote
            </button>
          </div>

        </div>
      </main>

      {/* ================= CONFIGURE MODAL (Matches Wireframe Bottom Right) ================= */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Configure Product</h2>
              <button onClick={() => setIsConfigOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8">
              
              {/* Section 1: Visual Variants (Colors) */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Select Variant</label>
                <div className="flex space-x-4">
                  {PRODUCT_DETAILS.variants.map((variant, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedVariant(idx)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedVariant === idx ? 'border-white ring-2 ring-purple-500' : 'border-transparent'}`}
                      style={{ backgroundColor: variant.color }}
                    >
                      {selectedVariant === idx && <CheckCircle className="text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-300">{PRODUCT_DETAILS.variants[selectedVariant].name}</p>
              </div>

              {/* Section 2: Attributes (Checkboxes/Selects) */}
              <div className="space-y-4">
                 {PRODUCT_DETAILS.attributes.map((attr, idx) => (
                   <div key={idx} className="bg-[#252525] p-4 rounded-lg border border-gray-800">
                     <div className="flex justify-between items-center mb-2">
                       <span className="font-semibold text-gray-200">{attr.name}</span>
                       <ChevronDown className="h-4 w-4 text-gray-500" />
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {attr.options.map((opt, optIdx) => (
                         <span key={optIdx} className="text-xs bg-black/40 text-gray-400 px-3 py-1 rounded-full border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
                           {opt}
                         </span>
                       ))}
                     </div>
                   </div>
                 ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800 flex gap-4 bg-[#1a1a1a]">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="flex-1 px-6 py-3 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Confirm Configuration
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}