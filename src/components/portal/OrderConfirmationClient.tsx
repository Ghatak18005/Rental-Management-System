'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderConfirmationClient({ order }: { order: any }) {
    const router = useRouter();
    const [isConfirming, setIsConfirming] = useState(false);
    const [status, setStatus] = useState(order.status);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            const response = await fetch('/api/confirm-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: order.id }),
            });

            const result = await response.json();

            if (result.success) {
                setStatus('sale_order');
                toast.success('Order confirmed successfully!');

                // Refresh to show updated state
                router.refresh();
            } else {
                throw new Error(result.error || 'Failed to confirm order');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsConfirming(false);
        }
    };

    // Check if already confirmed
    const isAlreadyConfirmed = status === 'confirmed';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Quotation Review</h1>
                    <p className="opacity-90">Please review your order details below</p>
                </div>

                <div className="p-8">
                    {/* Order Info */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Customer</p>
                            <p className="text-lg font-medium text-gray-900">{order.users?.name}</p>
                            <p className="text-gray-600">{order.users?.email}</p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Order Date</p>
                            <p className="text-lg font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                            <p className="text-sm font-mono text-gray-500">#{order.display_id || order.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto mb-8 rounded-lg border border-gray-100">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.rental_order_items?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-gray-800 font-medium">{item.product_name}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">Rs {item.price?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                                            Rs {(item.price * item.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total & Action */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50 p-6 rounded-xl">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-gray-500 uppercase font-bold">Total Amount</p>
                            <p className="text-3xl font-bold text-indigo-600">Rs {order.total_amount?.toLocaleString()}</p>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={isConfirming}
                            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isConfirming ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Order'
                            )}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        By clicking confirm, you agree to our terms and conditions.
                    </p>
                </div>
            </div>
        </div>
    );
}
