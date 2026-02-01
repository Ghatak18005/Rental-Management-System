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
  Calendar,
  IndianRupee // Using this or standard Dollar depending on your pref
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

      const { data, error } = await supabase
        .from("rental_orders")
        .select(`
          *,
          users!rental_orders_customer_id_fkey(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

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

  // --- THEMED STATUS BADGES ---
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { colorClass: string; icon: any; label: string }> = {
      draft: {
        colorClass: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        icon: FileText,
        label: "Quotation",
      },
      confirmed: {
        colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: CheckCircle,
        label: "Confirmed",
      },
      cancelled: {
        colorClass: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.colorClass}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getPickupStatusBadge = (status: string) => {
    const statusConfig: Record<string, { colorClass: string; label: string }> = {
      pending: {
        colorClass: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        label: "Pending",
      },
      picked_up: {
        colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        label: "With Customer",
      },
      returned: {
        colorClass: "bg-green-500/10 text-green-600 border-green-500/20",
        label: "Returned",
      },
      late: {
        colorClass: "bg-red-500/10 text-red-600 border-red-500/20",
        label: "Late Return",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config.colorClass}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 relative">
      
      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders & Lifecycle</h1>
            <p className="mt-1 text-foreground/50 text-sm">
              Track quotations, bookings, and return statuses in real-time.
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3 bg-card p-1 rounded-xl border border-border shadow-sm">
            <div className="pl-3 pr-1">
               <Filter className="h-4 w-4 text-foreground/40" />
            </div>
            {(["all", "draft", "confirmed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground/60 hover:bg-accent hover:text-foreground"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "draft"
                  ? "Quotations"
                  : "Confirmed"}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-accent/30">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Pickup Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Schedule</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mb-4">
                           <ShoppingCart className="h-8 w-8 text-foreground/30" />
                        </div>
                        <p className="text-foreground/60 font-medium">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-accent/20 transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-foreground">
                          #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-[10px] text-foreground/40 mt-0.5 font-mono">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{order.customer?.name || "Unknown"}</span>
                          <span className="text-xs text-foreground/50">{order.customer?.email}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Pickup Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPickupStatusBadge(order.pickup_status)}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-foreground flex items-center">
                          ₹{Number(order.total_amount || 0).toFixed(2)}
                        </div>
                        {order.security_deposit > 0 && (
                          <div className="text-[10px] text-foreground/40 mt-0.5">
                            + ₹{Number(order.security_deposit).toFixed(0)} Dep.
                          </div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          {order.pickup_date && (
                            <div className="flex items-center gap-2 text-xs text-foreground/60">
                              <div className="w-4 h-4 bg-accent rounded flex items-center justify-center">
                                <Package className="h-2.5 w-2.5 text-foreground/50" />
                              </div>
                              {new Date(order.pickup_date).toLocaleDateString()}
                            </div>
                          )}
                          {order.return_date && (
                            <div className="flex items-center gap-2 text-xs text-foreground/60">
                              <div className="w-4 h-4 bg-accent rounded flex items-center justify-center">
                                <Clock className="h-2.5 w-2.5 text-foreground/50" />
                              </div>
                              {new Date(order.return_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
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
    </div>
  );
}