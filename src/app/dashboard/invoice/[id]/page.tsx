'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FileText, Download, Mail, Check, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total_amount: number;
  pickup_date: string;
  return_date: string;
  status: string;
  items: OrderItem[];
  customer_id: string;
}

interface Customer {
  full_name: string;
  email: string;
}

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!orderId) throw new Error('No order ID provided');

        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('rental_orders')
          .select('id, total_amount, pickup_date, return_date, status, customer_id')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // Fetch order items
        const { data: items, error: itemsError } = await supabase
          .from('rental_order_items')
          .select('id, product_name, quantity, price')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        // Fetch customer details
        const { data: customerData, error: customerError } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', orderData.customer_id)
          .single();

        if (customerError) throw customerError;

        setOrder({
          ...orderData,
          items: items || [],
        });
        setCustomer(customerData);
      } catch (error: any) {
        console.error('Error fetching invoice:', error);
        toast.error('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId, supabase]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Invoice downloaded!');
    // In a real app, this would generate a PDF
  };

  const handleSendEmail = async () => {
    if (!customer) return;
    try {
      // Call API to send invoice email
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerEmail: customer.email,
          customerName: customer.full_name,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      toast.success('Invoice sent to ' + customer.email);
    } catch (error: any) {
      toast.error('Failed to send invoice: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!order || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your invoice.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const rentalDays = Math.ceil(
    (new Date(order.return_date).getTime() - new Date(order.pickup_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const tax = Math.round(order.total_amount * 0.18);
  const insurance = Math.round(order.total_amount * 0.05);
  const totalAmount = order.total_amount + tax + insurance;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="h-5 w-5" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Mail className="h-5 w-5" />
            Send Email
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ml-auto"
          >
            <Check className="h-5 w-5" />
            Done
          </button>
        </div>

        {/* Invoice Document */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-purple-600">INVOICE</h1>
              <p className="text-gray-600 mt-1">Order #{order.id.substring(0, 8)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <Check className="h-6 w-6 text-green-500" />
                <span className="text-lg font-semibold text-green-600">CONFIRMED</span>
              </div>
              <p className="text-sm text-gray-600">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Order Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Bill To</h3>
              <p className="font-semibold text-gray-900">{customer.full_name}</p>
              <p className="text-sm text-gray-600">{customer.email}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Rental Period</h3>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">From:</span> {new Date(order.pickup_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">To:</span> {new Date(order.return_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Duration: {rentalDays} days</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-center py-3 text-sm font-semibold text-gray-600">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600">Price/Day</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600">Days</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-gray-900">{item.product_name}</td>
                    <td className="text-center py-4 text-sm text-gray-900">{item.quantity}</td>
                    <td className="text-right py-4 text-sm text-gray-900">₹{item.price}</td>
                    <td className="text-right py-4 text-sm text-gray-900">{rentalDays}</td>
                    <td className="text-right py-4 text-sm font-semibold text-gray-900">
                      ₹{(item.price * item.quantity * rentalDays).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80">
              <div className="space-y-3 border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{order.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="text-gray-900">₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance (5%)</span>
                  <span className="text-gray-900">₹{insurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span>Total Amount Due</span>
                  <span className="text-purple-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Thank you for your business!</p>
            <p className="mt-1">This is a computer-generated invoice. No signature required.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
