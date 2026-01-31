'use client';

import React from 'react';
import { Calculator, Calendar, Clock, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PricingGuide() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <a href="/" className="inline-flex items-center text-indigo-600 font-semibold mb-6 hover:underline absolute left-8 top-8">
          <ArrowLeft className="h-4 w-4 mr-2" /> Home
        </a>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Transparent Pricing</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Pay only for what you use. We offer flexible tiers based on your project duration.
        </p>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
        
        {/* Hourly */}
        <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gray-100 px-4 py-2 rounded-bl-xl font-bold text-gray-500 text-sm">SHORT TERM</div>
          <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
            <Clock className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Hourly Rate</h3>
          <p className="text-gray-500 mb-6">Perfect for quick jobs or testing equipment.</p>
          <ul className="space-y-3 mb-8 text-gray-600 text-sm">
            <li className="flex items-center">✓ billed per 60 minutes</li>
            <li className="flex items-center">✓ Minimum 2 hours</li>
            <li className="flex items-center">✓ Ideal for single-day returns</li>
          </ul>
        </div>

        {/* Daily (Highlighted) */}
        <div className="border-2 border-indigo-600 rounded-2xl p-8 shadow-2xl relative transform md:-translate-y-4 bg-white">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-2 rounded-bl-xl font-bold text-sm">MOST POPULAR</div>
          <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Daily Rate</h3>
          <p className="text-gray-500 mb-6">Best value for full-day productions.</p>
          <div className="text-sm font-medium text-indigo-600 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded-full">
            Save ~30% vs Hourly
          </div>
          <ul className="space-y-3 mb-8 text-gray-600 text-sm">
            <li className="flex items-center">✓ 24-hour possession window</li>
            <li className="flex items-center">✓ Pickup 9 AM, Return 9 AM</li>
            <li className="flex items-center">✓ Overnight included</li>
          </ul>
        </div>

        {/* Weekly */}
        <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow relative">
          <div className="absolute top-0 right-0 bg-gray-100 px-4 py-2 rounded-bl-xl font-bold text-gray-500 text-sm">LONG TERM</div>
          <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Weekly Rate</h3>
          <p className="text-gray-500 mb-6">For major projects and construction.</p>
           <div className="text-sm font-medium text-green-600 mb-6 bg-green-50 inline-block px-3 py-1 rounded-full">
            Pay for 4 days, Keep for 7
          </div>
          <ul className="space-y-3 mb-8 text-gray-600 text-sm">
            <li className="flex items-center">✓ 7-day possession window</li>
            <li className="flex items-center">✓ Deepest discounts</li>
            <li className="flex items-center">✓ Priority support</li>
          </ul>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <Calculator className="h-6 w-6 mr-3 text-gray-700" />
          How We Calculate Your Total
        </h2>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between border-b border-gray-200 pb-4">
            <div>
              <h4 className="font-bold text-gray-900">1. Base Rental Cost</h4>
              <p className="text-sm text-gray-500 mt-1">
                Calculated based on duration. e.g., 26 hours is billed as 1 Day + 2 Hours.
              </p>
            </div>
            <div className="mt-2 md:mt-0 font-mono text-gray-600">$ XXX.XX</div>
          </div>

          <div className="flex flex-col md:flex-row justify-between border-b border-gray-200 pb-4">
            <div>
              <h4 className="font-bold text-gray-900">2. Security Deposit (Refundable)</h4>
              <p className="text-sm text-gray-500 mt-1">
                Held to cover potential damages or late fees. Released upon successful return inspection.
              </p>
            </div>
            <div className="mt-2 md:mt-0 font-mono text-gray-600">$ 50.00 - $ 500.00</div>
          </div>

          <div className="flex flex-col md:flex-row justify-between border-b border-gray-200 pb-4">
            <div>
              <h4 className="font-bold text-gray-900">3. Taxes (GST)</h4>
              <p className="text-sm text-gray-500 mt-1">
                Applicable government taxes based on your billing address[cite: 175].
              </p>
            </div>
            <div className="mt-2 md:mt-0 font-mono text-gray-600">18%</div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg flex items-start">
          <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Note on Late Fees:</strong> Late fees are not included in the initial quote. 
            They are calculated automatically at the moment of return if the deadline is missed[cite: 164].
          </p>
        </div>
      </div>

    </div>
  );
}