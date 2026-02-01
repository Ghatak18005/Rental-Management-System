'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CreditCard, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
  items: OrderItem[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'bank'>('card');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) throw new Error('No order ID provided');

        console.log('Fetching checkout order:', orderId);

        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('rental_orders')
          .select('id, total_amount, pickup_date, return_date')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        console.log('Order data:', orderData);

        // Fetch order items
        const { data: items, error: itemsError } = await supabase
          .from('rental_order_items')
          .select('id, product_name, quantity, price')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        console.log('Order items:', items);

        setOrder({
          ...orderData,
          items: items || [],
        });
      } catch (error: any) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order: ' + (error?.message || error));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, supabase]);

  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);
    try {
      // Update order status to confirmed
      const { error: updateError } = await supabase
        .from('rental_orders')
        .update({ status: 'confirmed' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      toast.success('Payment successful!');
      
      // Redirect to invoice page
      router.push(`/dashboard/invoice/${order.id}`);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your order. Please try again.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proceed to Payment</h1>
          <p className="text-gray-600">Review your order and complete the payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{(item.price * item.quantity * rentalDays).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rental Period</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pickup Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.pickup_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Return Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.return_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">Duration: {rentalDays} days</p>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {['card', 'upi', 'bank'].map((method) => (
                  <label key={method} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{borderColor: paymentMethod === method ? '#7c3aed' : undefined, backgroundColor: paymentMethod === method ? '#f5f3ff' : undefined}}>
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method as any}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 capitalize">{method === 'card' ? 'Credit/Debit Card' : method === 'upi' ? 'UPI' : 'Bank Transfer'}</p>
                      <p className="text-sm text-gray-600">
                        {method === 'card' && 'Visa, Mastercard, Amex'}
                        {method === 'upi' && 'Google Pay, PhonePe, Paytm'}
                        {method === 'bank' && 'Direct bank transfer'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{order.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium text-gray-900">₹{Math.round(order.total_amount * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance</span>
                  <span className="font-medium text-gray-900">₹{Math.round(order.total_amount * 0.05).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-purple-600">
                  ₹{Math.round(order.total_amount * 1.23).toLocaleString()}
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay Now
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                💳 Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
