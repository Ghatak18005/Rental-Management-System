'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, User, LogOut } from 'lucide-react';

const INVOICES = [
  { id: 'INV-2026-001', customer: 'Mark Wood', date: '2026-01-22', dueDate: '2026-02-22', total: 50, status: 'Posted' },
  { id: 'INV-2026-002', customer: 'Alex', date: '2026-01-23', dueDate: '2026-02-23', total: 775, status: 'Draft' },
  { id: 'INV-2026-003', customer: 'John', date: '2026-01-24', dueDate: '2026-02-24', total: 14.50, status: 'Posted' },
];

export default function InvoicesList() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col">
      
      {/* HEADER */}
      <header className="h-16 bg-[#1E1E1E] border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <div className="bg-white text-black px-2 py-0.5 rounded font-bold text-sm">Your Logo</div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-400">
            <span onClick={() => router.push('/admin/dashboard')} className="hover:text-white cursor-pointer transition-colors">Orders</span>
            <span className="text-white font-medium border-b-2 border-purple-500 pb-5 -mb-5 cursor-pointer">Invoices</span>
            <span className="hover:text-white cursor-pointer transition-colors">Reports</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
            <User className="h-5 w-5 text-gray-300"/>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Invoices</h1>
            <button className="bg-[#E879F9] hover:bg-[#D946EF] text-black px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4" /> New
            </button>
          </div>
          
          <div className="flex gap-3">
            <div className="relative w-64">
              <input type="text" placeholder="Search invoices..." className="w-full bg-[#1E1E1E] border border-gray-700 rounded-md py-2 pl-3 pr-10 text-sm focus:border-purple-500 outline-none" />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            <button className="bg-[#1E1E1E] border border-gray-700 text-gray-300 px-3 py-2 rounded-md hover:bg-gray-800">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#252525] text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded bg-gray-800 border-gray-700"/></th>
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Invoice Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {INVOICES.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                  className="hover:bg-[#2a2a2a] cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4"><input type="checkbox" className="rounded bg-gray-800 border-gray-700"/></td>
                  <td className="px-6 py-4 font-mono text-purple-400 group-hover:underline">{inv.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{inv.customer}</td>
                  <td className="px-6 py-4 text-gray-400">{inv.date}</td>
                  <td className="px-6 py-4 text-gray-400">{inv.dueDate}</td>
                  <td className="px-6 py-4 text-right font-bold text-white">Rs {inv.total}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      inv.status === 'Posted' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                        : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}