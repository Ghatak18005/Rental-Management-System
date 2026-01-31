'use client';

import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Box, 
  FileText, 
  RefreshCcw, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function RentalSystemHome() {
  useEffect(() => {
    // Any initialization code needed
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      
      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]"></div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 pt-16 pb-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Enterprise Rental Management
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Manage <span className="text-primary">Rentals</span>,<br /> 
            Not Just Sales.
          </h1>
          
          <p className="text-lg opacity-70 leading-relaxed max-w-xl mx-auto lg:mx-0">
            A unified platform for reservations, inventory tracking, and automated invoicing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
            <button className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button className="h-14 px-8 rounded-full bg-background border border-border text-foreground font-semibold text-lg hover:bg-accent transition-all">
              View Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview - Uses 'Card' and 'Accent' variables */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h3 className="text-lg font-bold">Rental Overview</h3>
              <div className="px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                <span className="text-xs text-secondary font-bold">System Active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-accent/50 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs opacity-60 font-medium">Revenue</span>
                </div>
                <div className="text-2xl font-bold">₹1.2L</div>
                <div className="text-xs text-secondary flex items-center gap-1 mt-1">+12.5%</div>
              </div>
              <div className="bg-accent/50 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Box className="w-4 h-4" />
                  <span className="text-xs opacity-60 font-medium">Active</span>
                </div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-xs opacity-50 mt-1">8 Returning</div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-destructive">Late Return Alert</p>
                <p className="text-[10px] opacity-70">Order #ORD-088 is overdue by 4 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section id="features" className="py-24 bg-accent/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="opacity-60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-background border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                   <RefreshCcw className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">RentFlow</span>
              </div>
              <p className="opacity-50 max-w-sm">The modern ERP solution for rental businesses. Built for scale, designed for simplicity.</p>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center opacity-40 text-sm">
            © 2026 RentFlow Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: <FileText size={24} />, title: "Smart Quotations", desc: "Create editable price proposals and convert to orders." },
  { icon: <Box size={24} />, title: "Reservation Engine", desc: "Prevent overbooking with automated inventory blocking." },
  { icon: <RefreshCcw size={24} />, title: "Pickup & Returns", desc: "Track items with customers and calculate late fees." },
  { icon: <ShieldCheck size={24} />, title: "Security Deposits", desc: "Manage partial payments and refund logic easily." },
  { icon: <BarChart3 size={24} />, title: "Live Insights", desc: "Visualize revenue and inventory performance in real-time." },
  { icon: <Users size={24} />, title: "Multi-User Roles", desc: "Dedicated portals for customers, vendors, and admins." }
];