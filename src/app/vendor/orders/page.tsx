"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  ShoppingCart,
  FileText,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import OrderActions from "@/components/vendor/OrderActions";

interface Order {
  id: string;
  customer_id: string;
  status: string;
  total_amount: number;
  pickup_date: string | null;
  return_date: string | null;
  security_deposit: number;
  pickup_status: string;
  created_at: string;
  customer?: {
    name: string;
    email: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "confirmed">("all");
  const supabase = createClient();

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch orders for products owned by this vendor
      // Note: This assumes there's a way to link orders to vendor products
      // You may need an order_items table or similar
      const { data, error } = await supabase
        .from("rental_orders")
        .select(`
          *,
          users!rental_orders_customer_id_fkey(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // For now, we'll show all orders. In production, filter by vendor's products
      const ordersWithCustomer = (data || []).map((order: any) => ({
        ...order,
        customer: order.users,
      }));

      setOrders(ordersWithCustomer);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "draft") return order.status === "draft";
    if (filter === "confirmed") return order.status === "confirmed";
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      draft: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        icon: FileText,
        label: "Quotation",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: CheckCircle,
        label: "Confirmed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getPickupStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        label: "Pending",
      },
      picked_up: {
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        label: "With Customer",
      },
      returned: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        label: "Returned",
      },
      late: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        label: "Late Return",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.label}
      </span>
    );
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
            Orders & Lifecycle Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage quotations and rental orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <div className="flex gap-2">
          {(["all", "draft", "confirmed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {f === "all"
                ? "All Orders"
                : f === "draft"
                ? "Quotations"
                : "Confirmed Orders"}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pickup Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.customer?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPickupStatusBadge(order.pickup_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{Number(order.total_amount || 0).toFixed(2)}
                      </div>
                      {order.security_deposit > 0 && (
                        <div className="text-xs text-gray-500">
                          Deposit: ₹{Number(order.security_deposit).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {order.pickup_date && (
                          <div className="flex items-center gap-1 mb-1">
                            <Package className="h-3 w-3" />
                            Pickup: {new Date(order.pickup_date).toLocaleDateString()}
                          </div>
                        )}
                        {order.return_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Return: {new Date(order.return_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <OrderActions
                        order={order}
                        onUpdate={fetchOrders}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

