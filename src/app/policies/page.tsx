'use client';

import React from 'react';
import { ShieldCheck, FileText, Clock, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function RentalPolicies() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <a href="/" className="inline-flex items-center text-indigo-600 font-semibold mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </a>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Rental Policies & Terms</h1>
        <p className="text-gray-600 text-lg">
          Please review our operating procedures regarding reservations, pickups, and returns.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid gap-8">

        {/* 1. Quotations vs Reservations */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Quotations & Reservations</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>Quotations are estimates only.</strong> Generating a quotation via our website does not reserve inventory. 
                  Equipment availability is only guaranteed once a <strong>Rental Order is Confirmed</strong>[cite: 211].
                </p>
                <p>
                  <strong>Reservation Logic:</strong> Once an order is confirmed, our system locks the inventory for your selected dates. 
                  This prevents double-booking[cite: 154]. If payment is not received within 24 hours of the quotation, the draft may be cancelled to release stock for other customers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Pickup & Identification */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Pickup & Identification</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <strong>Valid ID Required:</strong> For all rentals, a valid GSTIN or Government ID matching the user profile is required at pickup[cite: 124].
                </li>
                <li>
                  <strong>Pickup Document:</strong> Upon collecting items, a digital "Pickup Document" will be generated. 
                  The status of the inventory will officially move to <em>"With Customer"</em>[cite: 159].
                </li>
                <li>
                  <strong>Inspection:</strong> We recommend inspecting all equipment before signing the pickup document.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Returns & Late Fees */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
          <div className="flex items-start">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Returns & Late Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Strict Return Windows:</strong> Equipment must be returned by the time specified on your Rental Order. 
                  Our system automatically blocks availability for the duration of your rental[cite: 155].
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h3 className="font-bold text-red-800 flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Automatic Late Fees
                  </h3>
                  <p className="text-sm text-red-700">
                    If items are not returned by the scheduled time, a <strong>Late Return Document</strong> will be generated. 
                    Late fees are calculated automatically based on the hourly rate for every hour overdue[cite: 164].
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Payment & Deposits */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Payments & Security Deposits</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <strong>Payment Methods:</strong> We accept full upfront payments or partial payments via our online gateway[cite: 173, 178].
                </li>
                <li>
                  <strong>Security Deposit:</strong> A refundable security deposit may be required to protect against damage or late returns. 
                  This amount is refunded within 3-5 business days after the "Return Document" is processed and goods are inspected[cite: 163].
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}