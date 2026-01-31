'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Check, X, Loader2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderForm() {
  const router = useRouter();
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Function to simulate creating an invoice
  const handleCreateInvoice = async () => {
    setIsCreatingInvoice(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    toast.success("Invoice Created Successfully!");
    router.push('/admin/invoices/INV-2026-0001'); // Redirect to Invoice View
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-8">
      
      {/* --- HEADER: Title & Status Icons --- */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#D946EF] text-black px-3 py-1 rounded font-bold text-sm">New</div>
        <h1 className="text-2xl font-normal text-gray-200">Rental order</h1>
        <div className="flex gap-2 ml-2">
           <button className="bg-green-900/30 border border-green-600/50 p-1 rounded text-green-500 hover:bg-green-900/50"><Check size={16}/></button>
           <button className="bg-red-900/30 border border-red-600/50 p-1 rounded text-red-500 hover:bg-red-900/50"><X size={16}/></button>
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-gray-800 rounded-lg p-6 shadow-xl">
        
        {/* --- ACTION BAR --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <button className="px-6 py-1.5 bg-[#D946EF] hover:bg-[#c026d3] text-black rounded font-bold text-sm transition-colors">Send</button>
            <button className="px-6 py-1.5 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 rounded text-sm transition-colors">Confirm</button>
            <button className="px-6 py-1.5 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 rounded text-sm transition-colors">Print</button>
            
            {/* CREATE INVOICE BUTTON (Pink as per wireframe) */}
            <button 
              onClick={handleCreateInvoice}
              disabled={isCreatingInvoice}
              className="ml-4 px-4 py-1.5 bg-[#D946EF]/20 border border-[#D946EF] text-[#D946EF] hover:bg-[#D946EF] hover:text-black rounded text-sm font-bold transition-all flex items-center gap-2"
            >
              {isCreatingInvoice && <Loader2 className="animate-spin h-3 w-3"/>}
              Create Invoice
            </button>
          </div>

          {/* STATUS PILLS (Right Side) */}
          <div className="flex bg-[#121212] rounded p-1 border border-gray-800">
            <button className="px-4 py-1 bg-[#252525] text-gray-200 rounded-sm text-xs font-medium border-r border-gray-700">Quotation</button>
            <button className="px-4 py-1 text-gray-500 hover:text-gray-300 text-xs transition-colors border-r border-gray-800">Quotation Sent</button>
            <button className="px-4 py-1 text-gray-500 hover:text-gray-300 text-xs transition-colors">Sale Order</button>
          </div>
        </div>

        {/* --- MAIN INFO FORM --- */}
        <h2 className="text-3xl font-bold text-white mb-8 tracking-wide">S00075</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-6 mb-10">
          {/* Left Column */}
          <div className="space-y-5">
            <div className="flex items-center">
              <label className="w-32 text-gray-400 text-sm">Customer</label>
              <div className="flex-1 relative border-b border-gray-700 hover:border-gray-500 transition-colors">
                <input type="text" className="w-full bg-transparent outline-none py-1 text-white text-sm" />
                <Search className="absolute right-0 top-1.5 h-3 w-3 text-[#D946EF]" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-32 text-gray-400 text-sm">Invoice Address</label>
              <input type="text" className="flex-1 bg-transparent border-b border-gray-700 outline-none py-1 text-white text-sm hover:border-gray-500 transition-colors" />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-gray-400 text-sm">Delivery Address</label>
              <input type="text" className="flex-1 bg-transparent border-b border-gray-700 outline-none py-1 text-white text-sm hover:border-gray-500 transition-colors" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div className="flex items-center">
              <label className="w-32 text-gray-400 text-sm">Rental Period</label>
              <div className="flex-1 flex gap-4">
                 <div className="flex-1 border-b border-gray-700">
                   <input type="text" placeholder="Start date" className="w-full bg-transparent outline-none py-1 text-white text-sm text-center"/>
                 </div>
                 <span className="text-gray-500">→</span>
                 <div className="flex-1 border-b border-gray-700">
                   <input type="text" placeholder="End date" className="w-full bg-transparent outline-none py-1 text-white text-sm text-center"/>
                 </div>
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-32 text-gray-400 text-sm">Order date</label>
              <input type="text" className="flex-1 bg-transparent border-b border-gray-700 outline-none py-1 text-white text-sm hover:border-gray-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="mb-4 border-b border-gray-800">
          <button className="text-sm font-medium text-white border-b-2 border-white pb-2 px-1">Order Line</button>
        </div>

        {/* --- ORDER LINES TABLE --- */}
        <div className="border-t border-b border-gray-700 mb-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="py-3 font-normal w-[40%]">Product</th>
                <th className="py-3 font-normal">Quantity</th>
                <th className="py-3 font-normal">Unit</th>
                <th className="py-3 font-normal">Unit Price</th>
                <th className="py-3 font-normal">Taxes</th>
                <th className="py-3 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {/* Row 1: Computer */}
              <tr className="border-b border-gray-800/50 group hover:bg-white/5">
                <td className="py-3 pr-4">
                  <div className="font-medium">Computers</div>
                  <div className="text-[10px] text-gray-500">[Start Date -&gt; End Date]</div>
                </td>
                <td className="py-3">20</td>
                <td className="py-3 text-gray-400">Units</td>
                <td className="py-3">Rs 20,000</td>
                <td className="py-3 text-gray-500">—</td>
                <td className="py-3 text-right">Rs 4,00,000</td>
              </tr>
              {/* Row 2: Downpayment */}
              <tr className="border-b border-gray-800/50 group hover:bg-white/5">
                <td className="py-3 pr-4 font-medium">Downpayment</td>
                <td className="py-3">20</td>
                <td className="py-3 text-gray-400">Units</td>
                <td className="py-3 text-gray-500">_______</td>
                <td className="py-3 text-gray-500">_______</td>
                <td className="py-3 text-right text-gray-500">_______</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex gap-6 mb-12">
          <button className="text-[#3b82f6] text-sm hover:underline">Add a Product</button>
          <button className="text-[#3b82f6] text-sm hover:underline">Add a note</button>
        </div>

        {/* --- FOOTER: Totals & Terms --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          
          {/* Terms Link */}
          <div className="text-sm">
             <span className="text-gray-400">Terms & Conditions: </span>
             <a href="#" className="text-[#3b82f6] underline">https://xxxxx.xxx.xxx/terms</a>
          </div>

          {/* Totals Box */}
          <div className="w-full md:w-1/3">
             <div className="flex justify-end gap-2 mb-4">
                <button className="border border-gray-600 rounded px-3 py-1 text-xs text-gray-300 hover:border-gray-400">Coupon Code</button>
                <button className="border border-gray-600 rounded px-3 py-1 text-xs text-gray-300 hover:border-gray-400">Discount</button>
                <button className="border border-gray-600 rounded px-3 py-1 text-xs text-gray-300 hover:border-gray-400">Add Shipping</button>
             </div>

             <div className="space-y-2 text-right">
               <div className="flex justify-between text-sm text-gray-400">
                  <span>Untaxed Amount:</span>
                  <span>Rs 4,00,000</span>
               </div>
               <div className="flex justify-between text-lg font-bold text-white border-t border-gray-700 pt-2 mt-2">
                  <span>Total:</span>
                  <span>Rs 4,00,000</span>
               </div>
             </div>
             
             <p className="text-[10px] text-gray-600 mt-4 text-center leading-tight">
               Downpayments, Deposits, Taxes should be taken into consideration while calculating total amount
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}