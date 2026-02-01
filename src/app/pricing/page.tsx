'use client';

import React from 'react';
import { Calculator, Calendar, Clock, ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function PricingGuide() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <Link href="/" className="inline-flex items-center text-primary font-semibold mb-6 hover:underline absolute left-8 top-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Transparent Pricing</h1>
        <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
          Pay only for what you use. We offer flexible tiers based on your project duration.
        </p>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
        
        {/* Hourly */}
        <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-secondary px-4 py-2 rounded-bl-xl font-bold text-secondary-foreground text-xs uppercase tracking-wider">SHORT TERM</div>
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-foreground">Hourly Rate</h3>
          <p className="text-foreground/60 mb-6">Perfect for quick jobs or testing equipment.</p>
          <ul className="space-y-3 mb-8 text-foreground/80 text-sm">
            <li className="flex items-center">✓ Billed per 60 minutes</li>
            <li className="flex items-center">✓ Minimum 2 hours</li>
            <li className="flex items-center">✓ Ideal for single-day returns</li>
          </ul>
        </div>

        {/* Daily (Highlighted) */}
        <div className="bg-card border-2 border-primary rounded-2xl p-8 shadow-2xl shadow-primary/10 relative transform md:-translate-y-4 transition-all">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-2 rounded-bl-xl font-bold text-xs uppercase tracking-wider">MOST POPULAR</div>
          <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-foreground">Daily Rate</h3>
          <p className="text-foreground/60 mb-6">Best value for full-day productions.</p>
          <div className="text-xs font-bold text-primary mb-6 bg-primary/10 inline-block px-3 py-1 rounded-full uppercase tracking-tight">
            Save ~30% vs Hourly
          </div>
          <ul className="space-y-3 mb-8 text-foreground/80 text-sm">
            <li className="flex items-center">✓ 24-hour possession window</li>
            <li className="flex items-center">✓ Pickup 9 AM, Return 9 AM</li>
            <li className="flex items-center">✓ Overnight included</li>
          </ul>
        </div>

        {/* Weekly */}
        <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all relative group">
          <div className="absolute top-0 right-0 bg-secondary px-4 py-2 rounded-bl-xl font-bold text-secondary-foreground text-xs uppercase tracking-wider">LONG TERM</div>
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-foreground">Weekly Rate</h3>
          <p className="text-foreground/60 mb-6">For major projects and construction.</p>
           <div className="text-xs font-bold text-green-600 dark:text-green-400 mb-6 bg-green-500/10 inline-block px-3 py-1 rounded-full uppercase tracking-tight">
            Pay for 4 days, Keep for 7
          </div>
          <ul className="space-y-3 mb-8 text-foreground/80 text-sm">
            <li className="flex items-center">✓ 7-day possession window</li>
            <li className="flex items-center">✓ Deepest discounts</li>
            <li className="flex items-center">✓ Priority support</li>
          </ul>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="max-w-4xl mx-auto bg-muted/50 border border-border rounded-2xl p-8 md:p-12 transition-colors">
        <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
          <Calculator className="h-6 w-6 mr-3 text-primary" />
          How We Calculate Your Total
        </h2>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between border-b border-border pb-4">
            <div>
              <h4 className="font-bold text-foreground">1. Base Rental Cost</h4>
              <p className="text-sm text-foreground/60 mt-1">
                Calculated based on duration. e.g., 26 hours is billed as 1 Day + 2 Hours.
              </p>
            </div>
            <div className="mt-2 md:mt-0 font-mono text-primary font-semibold">$ XXX.XX</div>
          </div>

          <div className="flex flex-col md:flex-row justify-between border-b border-border pb-4">
            <div>
              <h4 className="font-bold text-foreground">2. Security Deposit (Refundable)</h4>
              <p className="text-sm text-foreground/60 mt-1">
                Held to cover potential damages or late fees. Released upon successful return inspection.
              </p>
            </div>
            <div className="mt-2 md:mt-0 font-mono text-primary font-semibold">$ 50.00 - $ 500.00</div>
          </div>

          <div className="flex flex-col md:flex-row justify-between border-b border-border pb-4">
            <div>
              <h4 className="font-bold text-foreground">3. Taxes (GST)</h4>
              <p className="text-sm text-foreground/60 mt-1">
                Applicable government taxes based on your billing address.
              </p>
            </div>
            <div className="mt-2 md:mt-0 font-mono text-primary font-semibold">18%</div>
          </div>
        </div>

        {/* Note Box */}
        <div className="mt-8 bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20 flex items-start">
          <HelpCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong className="text-primary">Note on Late Fees:</strong> Late fees are not included in the initial quote. 
            They are calculated automatically at the moment of return if the deadline is missed.
          </p>
        </div>
      </div>

    </div>
  );
}