'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Box, 
  FileText, 
  RefreshCcw, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Menu, 
  X,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function RentalSystemHome() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* ================= BACKGROUND EFFECTS (Subtle Pastels) ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-teal-100/30 rounded-full blur-[100px]"></div>
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="relative z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <RefreshCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">RentFlow</span>
              <span className="text-[10px] text-slate-500 block -mt-1 tracking-widest uppercase">Management System</span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#roles" className="hover:text-indigo-600 transition-colors">For Vendors</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-slate-600 hover:text-indigo-600 text-sm font-medium px-4 py-2 transition-colors">
              Log In
            </button>
            <button className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden shadow-xl">
            <a href="#" className="text-slate-600 py-2">Features</a>
            <a href="#" className="text-slate-600 py-2">Vendor Portal</a>
            <hr className="border-slate-100" />
            <button className="w-full text-slate-600 py-2 font-medium">Log In</button>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Sign Up</button>
          </div>
        )}
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 pt-16 pb-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Enterprise Grade Rental ERP
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-slate-900">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Rentals</span>,<br /> 
            Not Just Sales.
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
            A complete system for businesses to rent products online. Manage quotations, smart reservations, inventory tracking, and automated invoicing in one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button className="h-14 px-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-lg transition-all shadow-sm">
              View Demo
            </button>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>GST Compliant Invoicing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-time Inventory</span>
            </div>
          </div>
        </div>

        {/* Right: Light Mode Dashboard Preview */}
        <div className="relative group perspective-1000">
          {/* Subtle Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
          
          {/* Main Dashboard Card - White Theme */}
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rental Overview</h3>
                <p className="text-xs text-slate-500">Last 30 Days</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-emerald-700 font-medium">System Active</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">₹1.2L</div>
                <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> +12.5% vs last month
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-slate-500 font-medium">Active Rentals</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">24</div>
                <div className="text-xs text-slate-500 mt-1">
                  8 Returning Today
                </div>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Activity</h4>
              
              {[
                { id: '#ORD-092', user: 'Tech Corp', status: 'Reserved', time: '2 mins ago', color: 'bg-amber-100 text-amber-700' },
                { id: '#ORD-091', user: 'Event Pros', status: 'Dispatched', time: '1 hour ago', color: 'bg-blue-100 text-blue-700' },
                { id: '#ORD-090', user: 'Studio 24', status: 'Returned', time: '3 hours ago', color: 'bg-emerald-100 text-emerald-700' },
              ].map((order, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-default border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {order.user.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{order.user}</div>
                      <div className="text-xs text-slate-500">{order.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.color}`}>{order.status}</span>
                    <div className="text-[10px] text-slate-400 mt-1">{order.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alert/Notification */}
            <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-700">Late Return Alert</p>
                <p className="text-[10px] text-red-600/80">Order #ORD-088 is overdue by 4 hours. Penalty calculated automatically.</p>
              </div>
            </div>

          </div>

          {/* Floating Badge */}
          <div className="absolute -right-4 top-10 bg-white border border-slate-200 p-3 rounded-xl shadow-xl animate-bounce duration-3000 z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full shadow-sm shadow-rose-200"></div>
              <div className="text-xs font-bold text-slate-800">
                Live Inventory
                <span className="block text-[10px] text-slate-500 font-normal">Syncing...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The Complete Rental Lifecycle</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">From the moment a customer requests a quote to the final product return and invoicing.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Quotations</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Create editable price proposals. Convert approved quotes directly into rental orders with one click.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <Box className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Inventory Reservation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Prevent overbooking. The system automatically blocks stock for specific rental periods (Hour, Day, or Week).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                <RefreshCcw className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pickup & Returns</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Track items "With Customer". Handle late returns automatically with penalty calculations and restock alerts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Security Deposits</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Manage partial payments and security deposits upfront. Refund or adjust against damages upon return.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-rose-100 transition-colors">
                <BarChart3 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Insightful Reports</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Visualize total rental revenue, most rented products, and vendor performance via exportable PDF/CSV reports.
              </p>
            </div>

             {/* Feature 6 */}
             <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-User Roles</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated portals for Customers to browse, Vendors to manage stock, and Admins to control configuration.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE ROLE TOGGLE ================= */}
      <section id="roles" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Designed for every stakeholder</h2>
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setActiveTab('customer')}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
                    activeTab === 'customer' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                For Customers
              </button>
              <button 
                onClick={() => setActiveTab('vendor')}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
                    activeTab === 'vendor' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                For Vendors
              </button>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-lg">
              {activeTab === 'customer' ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Seamless Rental Experience</h3>
                  <ul className="space-y-4">
                    {['Browse products with advanced filters', 'View real-time availability', 'Download invoices & track order history', 'Receive return reminders'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Powerful Backend Controls</h3>
                  <ul className="space-y-4">
                    {['Manage product variants & pricing', 'Process pickup & return documents', 'Track earnings & late fees', 'Configure rental periods (Hr/Day/Week)'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Abstract UI Representation - Light Mode */}
          <div className="relative h-[400px] bg-slate-100 rounded-xl border border-slate-200 shadow-xl overflow-hidden p-6 flex flex-col">
            {/* Fake Browser Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            
            {/* Fake Dashboard Content */}
            <div className="flex-1 flex gap-4">
              <div className="w-1/4 bg-white rounded-lg h-full border border-slate-200 shadow-sm"></div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="h-1/3 bg-white rounded-lg w-full border border-slate-200 shadow-sm"></div>
                <div className="h-2/3 bg-white rounded-lg w-full grid grid-cols-2 gap-4 p-4 border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 rounded border border-slate-100"></div>
                  <div className="bg-slate-50 rounded border border-slate-100"></div>
                  <div className="bg-slate-50 rounded col-span-2 border border-slate-100"></div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-6 right-6 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
              {activeTab === 'customer' ? 'Confirm Order' : 'Generate Invoice'}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#020617] text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                   <RefreshCcw className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RentFlow</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                The modern ERP solution for rental businesses. 
                Built for scale, designed for simplicity.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Inventory</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Quotations</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Invoicing</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Vendor Portal</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">GST Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>© 2026 RentFlow Systems. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="cursor-pointer hover:text-white transition-colors">Twitter</span>
              <span className="cursor-pointer hover:text-white transition-colors">LinkedIn</span>
              <span className="cursor-pointer hover:text-white transition-colors">GitHub</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}