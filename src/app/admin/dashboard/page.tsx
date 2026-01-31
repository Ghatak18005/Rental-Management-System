'use client';

import React, { useState } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  User, 
  Settings as SettingsIcon,
  ChevronDown,
  Filter,
  Plus
} from 'lucide-react';

// --- Types & Mock Data based on Wireframe ---
type OrderStatus = 'Sale Order' | 'Confirmed' | 'Cancelled' | 'Quotation' | 'Invoiced';

interface Order {
  id: string;
  customer: string;
  product: string;
  price: number;
  status: OrderStatus;
  rentalDuration: string;
}

const MOCK_ORDERS: Order[] = [
  { id: 'SO0001', customer: 'Smith', product: 'TV', price: 1450, status: 'Sale Order', rentalDuration: '2 Days' },
  { id: 'SO0010', customer: 'Mark Wood', product: 'Sony Cam', price: 1450, status: 'Sale Order', rentalDuration: '1 Week' },
  { id: 'SO0008', customer: 'Alex', product: 'Car', price: 775, status: 'Invoiced', rentalDuration: '3 Days' },
  { id: 'SO0012', customer: 'Smith', product: 'TV', price: 1450, status: 'Cancelled', rentalDuration: '2 Days' },
  { id: 'SO0005', customer: 'John', product: 'Projector', price: 14.50, status: 'Quotation', rentalDuration: '1 Day' },
  { id: 'SO0006', customer: 'Mark Wood', product: 'Printer', price: 150, status: 'Confirmed', rentalDuration: '5 Days' },
  { id: 'SO0013', customer: 'Smith', product: 'Games', price: 50, status: 'Cancelled', rentalDuration: '1 Day' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Sale Order': 'bg-orange-500 text-white',
  'Confirmed': 'bg-green-500 text-white',
  'Cancelled': 'bg-red-500 text-white',
  'Quotation': 'bg-purple-500 text-white',
  'Invoiced': 'bg-blue-400 text-white',
};

export default function AdminDashboard() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans flex">
      
      {/* ================= SIDEBAR (Status Filter) ================= */}
      {/* Left sidebar showing counts */}
      <aside className="w-64 border-r border-gray-800 p-6 hidden md:block">
        <div className="flex items-center space-x-2 mb-10">
           <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
             <span className="text-black font-bold text-xs">YL</span>
           </div>
           <span className="font-bold text-lg">Your Logo</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-6 mb-10">
          <div className="text-gray-400 font-medium hover:text-white cursor-pointer border-l-2 border-white pl-4">Orders</div>
          <div className="text-gray-400 font-medium hover:text-white cursor-pointer pl-4">Invoices</div>
          <div className="text-gray-400 font-medium hover:text-white cursor-pointer pl-4">Customers</div>
        </nav>

        {/* Rental Status Stats Block */}
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800">
          <div className="flex justify-between items-center mb-4 text-sm font-semibold text-gray-300">
            <span>Rental Status</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total:</span>
              <span className="font-bold">7</span>
            </div>
            <div className="w-full h-px bg-gray-700 my-2"></div>
            <div className="flex justify-between items-center hover:bg-gray-800 p-1 rounded cursor-pointer">
              <span className="text-gray-400">Sale order</span>
              <span>2</span>
            </div>
            <div className="flex justify-between items-center hover:bg-gray-800 p-1 rounded cursor-pointer">
              <span className="text-gray-400">Quotation</span>
              <span>1</span>
            </div>
            <div className="flex justify-between items-center hover:bg-gray-800 p-1 rounded cursor-pointer">
              <span className="text-gray-400">Invoiced</span>
              <span>1</span>
            </div>
            <div className="flex justify-between items-center hover:bg-gray-800 p-1 rounded cursor-pointer">
              <span className="text-gray-400">Confirmed</span>
              <span>1</span>
            </div>
            <div className="flex justify-between items-center hover:bg-gray-800 p-1 rounded cursor-pointer">
              <span className="text-gray-400">Cancelled</span>
              <span>2</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col">
        
        {/* Top Header Row */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0F0F0F]">
          
          {/* Menu Links */}
          <div className="flex space-x-6 text-sm font-medium text-gray-400">
             <span className="text-white">Orders</span>
             <span className="hover:text-white cursor-pointer">Products</span>
             <span className="hover:text-white cursor-pointer">Reports</span>
             <span className="hover:text-white cursor-pointer">Settings</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-[#1A1A1A] px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-sm font-medium">Name</span>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-300" />
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </header>

        {/* Toolbar Row */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
             <h1 className="text-2xl font-bold">Rental Order</h1>
             <button className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200">
               <SettingsIcon className="h-4 w-4" />
             </button>
             
             {/* New Button */}
             <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg shadow-purple-900/20">
               New
             </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative group">
              <input 
                type="text" 
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Search orders..."
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500 group-focus-within:text-purple-500" />
            </div>
          </div>

          {/* Filters & View Switcher */}
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-800 transition-colors">
              Pickup
            </button>
            <button className="px-4 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-800 transition-colors">
              Return
            </button>
            
            <div className="w-px h-8 bg-gray-700 mx-2"></div>

            {/* View Switcher Icons */}
            <div className="flex bg-[#1A1A1A] rounded-lg border border-gray-700 p-1">
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Kanban Board Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {MOCK_ORDERS.map((order) => (
              <div 
                key={order.id} 
                className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800 hover:border-gray-600 transition-all cursor-pointer shadow-sm hover:shadow-md relative group"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-200">{order.customer}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-gray-200">{order.product}</h4>
                    <p className="font-bold text-lg mt-1">${order.price}</p>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-px bg-gray-800 my-4"></div>

                {/* Footer Status Row */}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <p>Rental Duration</p>
                    {/* Placeholder for duration bars seen in wireframe */}
                    <div className="h-1 w-12 bg-gray-700 mt-1 rounded-full"></div> 
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}

            {/* Empty "Add New" Placeholder Card (Optional UI enhancement) */}
            <div className="border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center min-h-[160px] text-gray-600 hover:text-gray-400 hover:border-gray-600 cursor-pointer transition-colors">
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Create New Order</span>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}