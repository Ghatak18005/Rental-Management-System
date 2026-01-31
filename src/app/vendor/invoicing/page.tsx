"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  FileText,
  Plus,
  Download,
  Loader2,
  Calculator,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";
import InvoiceForm from "@/components/vendor/InvoiceForm";

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  order?: {
    id: string;
    customer_id: string;
    total_amount: number;
    security_deposit: number;
  };
}

export default function InvoicingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [vendorGstin, setVendorGstin] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch vendor GSTIN
        const { data: profile } = await supabase
          .from("users")
          .select("gstin")
          .eq("id", user.id)
          .single();

        if (profile?.gstin) {
          setVendorGstin(profile.gstin);
        }

        // Fetch confirmed orders that don't have invoices yet
        const { data: confirmedOrders } = await supabase
          .from("rental_orders")
          .select("*")
          .eq("status", "confirmed")
          .order("created_at", { ascending: false });

        setOrders(confirmedOrders || []);

        // Fetch existing invoices
        // Note: You'll need to create an 'invoices' table
        // For now, we'll show a placeholder
        setInvoices([]);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateGST = (amount: number, gstRate: number = 18) => {
    return (amount * gstRate) / 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Invoicing
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage invoices for rental orders
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedOrder(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Create Invoice
        </button>
      </div>

      {/* GST Info */}
      {vendorGstin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              GSTIN: {vendorGstin} | GST will be calculated automatically at 18%
            </span>
          </div>
        </div>
      )}

      {/* Invoice Form Modal */}
      {showForm && (
        <InvoiceForm
          order={selectedOrder}
          orders={orders}
          vendorGstin={vendorGstin}
          onClose={() => {
            setShowForm(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedOrder(null);
            // Refresh invoices
          }}
        />
      )}

      {/* Invoices List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No invoices created yet</p>
            <p className="text-sm text-gray-400">
              Create your first invoice from a confirmed order
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    GST (18%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{invoice.order_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₹{Number(invoice.subtotal).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₹{Number(invoice.gst_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{Number(invoice.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          // Download invoice PDF
                        }}
                        className="text-primary hover:text-primary/80 p-2 hover:bg-primary/10 rounded transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Orders for Invoicing */}
      {orders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Orders Available for Invoicing
          </h2>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Amount: ₹{Number(order.total_amount || 0).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Create Invoice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

