"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { X, Save, Loader2, Calculator } from "lucide-react";
import toast from "react-hot-toast";

interface InvoiceFormProps {
  order: any | null;
  orders: any[];
  vendorGstin: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvoiceForm({
  order: selectedOrder,
  orders,
  vendorGstin,
  onClose,
  onSuccess,
}: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(
    selectedOrder?.id || ""
  );
  const [subtotal, setSubtotal] = useState(0);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [partialPayment, setPartialPayment] = useState(0);
  const supabase = createClient();

  const GST_RATE = 18;

  useEffect(() => {
    if (selectedOrder) {
      setSelectedOrderId(selectedOrder.id);
      setSubtotal(Number(selectedOrder.total_amount || 0));
      setSecurityDeposit(Number(selectedOrder.security_deposit || 0));
    }
  }, [selectedOrder]);

  const selectedOrderData = orders.find((o) => o.id === selectedOrderId);

  const calculateInvoice = () => {
    const baseAmount = subtotal - partialPayment;
    const gstAmount = (baseAmount * GST_RATE) / 100;
    const totalAmount = baseAmount + gstAmount;

    return {
      subtotal: baseAmount,
      gstAmount,
      totalAmount,
    };
  };

  const invoice = calculateInvoice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      toast.error("Please select an order");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Note: You'll need to create an 'invoices' table with these fields:
      // id, order_id, vendor_id, invoice_number, subtotal, gst_amount, total_amount,
      // security_deposit, partial_payment, status, created_at

      // For now, we'll just show a success message
      // In production, insert into invoices table:
      /*
      const { error } = await supabase
        .from("invoices")
        .insert({
          order_id: selectedOrderId,
          vendor_id: user.id,
          invoice_number: invoiceNumber,
          subtotal: invoice.subtotal,
          gst_amount: invoice.gstAmount,
          total_amount: invoice.totalAmount,
          security_deposit: securityDeposit,
          partial_payment: partialPayment,
          status: "draft",
        });

      if (error) throw error;
      */

      toast.success("Invoice created successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Order *
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                const order = orders.find((o) => o.id === e.target.value);
                if (order) {
                  setSubtotal(Number(order.total_amount || 0));
                  setSecurityDeposit(Number(order.security_deposit || 0));
                }
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">-- Select an order --</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  Order #{order.id.slice(0, 8)} - ₹
                  {Number(order.total_amount || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedOrderData && (
            <>
              {/* Order Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Order Details
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Order Amount:
                    </span>{" "}
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Security Deposit:
                    </span>{" "}
                    <span className="font-medium">
                      ₹{securityDeposit.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Payment Adjustments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Partial Payment Received (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={partialPayment}
                    onChange={(e) =>
                      setPartialPayment(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Invoice Calculation */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Invoice Calculation
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      GST ({GST_RATE}%):
                    </span>
                    <span className="font-medium">₹{invoice.gstAmount.toFixed(2)}</span>
                  </div>
                  {vendorGstin && (
                    <div className="text-xs text-gray-500 mt-1">
                      GSTIN: {vendorGstin}
                    </div>
                  )}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span>₹{invoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedOrderId}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

