'use client';

import React from 'react';
import { ShieldCheck, FileText, Clock, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RentalPolicies() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <Link href="/" className="inline-flex items-center text-primary font-semibold mb-6 hover:underline gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-foreground mb-4">Rental Policies & Terms</h1>
        <p className="text-foreground/60 text-lg">
          Please review our operating procedures regarding reservations, pickups, and returns.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid gap-8">

        {/* 1. Quotations vs Reservations */}
        <section className="bg-card p-8 rounded-2xl shadow-sm border border-border transition-colors">
          <div className="flex items-start">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Quotations & Reservations</h2>
              <div className="space-y-4 text-foreground/70 leading-relaxed">
                <p>
                  <strong className="text-foreground">Quotations are estimates only.</strong> Generating a quotation via our website does not reserve inventory. 
                  Equipment availability is only guaranteed once a <strong className="text-foreground">Rental Order is Confirmed</strong>.
                </p>
                <p>
                  <strong className="text-foreground">Reservation Logic:</strong> Once an order is confirmed, our system locks the inventory for your selected dates. 
                  This prevents double-booking. If payment is not received within 24 hours of the quotation, the draft may be cancelled to release stock for other customers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Pickup & Identification */}
        <section className="bg-card p-8 rounded-2xl shadow-sm border border-border transition-colors">
          <div className="flex items-start">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Pickup & Identification</h2>
              <ul className="list-disc pl-5 space-y-2 text-foreground/70">
                <li>
                  <strong className="text-foreground">Valid ID Required:</strong> For all rentals, a valid GSTIN or Government ID matching the user profile is required at pickup.
                </li>
                <li>
                  <strong className="text-foreground">Pickup Document:</strong> Upon collecting items, a digital "Pickup Document" will be generated. 
                  The status of the inventory will officially move to <em className="text-primary">"With Customer"</em>.
                </li>
                <li>
                  <strong className="text-foreground">Inspection:</strong> We recommend inspecting all equipment before signing the pickup document.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Returns & Late Fees */}
        <section className="bg-card p-8 rounded-2xl shadow-sm border border-border border-l-4 border-l-destructive transition-colors">
          <div className="flex items-start">
            <div className="bg-destructive/10 p-3 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Returns & Late Policy</h2>
              <div className="space-y-4 text-foreground/70">
                <p>
                  <strong className="text-foreground">Strict Return Windows:</strong> Equipment must be returned by the time specified on your Rental Order. 
                  Our system automatically blocks availability for the duration of your rental.
                </p>
                {/* Warning Alert Box */}
                <div className="bg-destructive/5 dark:bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-bold text-destructive flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Automatic Late Fees
                  </h3>
                  <p className="text-sm text-foreground/80">
                    If items are not returned by the scheduled time, a <strong className="text-destructive">Late Return Document</strong> will be generated. 
                    Late fees are calculated automatically based on the hourly rate for every hour overdue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Payment & Deposits */}
        <section className="bg-card p-8 rounded-2xl shadow-sm border border-border transition-colors">
          <div className="flex items-start">
            <div className="bg-green-500/10 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Payments & Security Deposits</h2>
              <ul className="list-disc pl-5 space-y-2 text-foreground/70">
                <li>
                  <strong className="text-foreground">Payment Methods:</strong> We accept full upfront payments or partial payments via our online gateway.
                </li>
                <li>
                  <strong className="text-foreground">Security Deposit:</strong> A refundable security deposit may be required to protect against damage or late returns. 
                  This amount is refunded within 3-5 business days after the "Return Document" is processed and goods are inspected.
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}