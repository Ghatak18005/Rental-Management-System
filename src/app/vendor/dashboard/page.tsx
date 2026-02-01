"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {VendorNavbar} from "@/components/VendorNavbar";


interface DashboardStats {
  totalRevenue: number;
  mostRentedProducts: Array<{
    id: string;
    name: string;
    rental_count: number;
  }>;
  lateReturns: Array<{
    id: string;
    order_id: string;
    product_name: string;
    customer_name: string;
    return_date: string;
    days_late: number;
  }>;
}

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    mostRentedProducts: [],
    lateReturns: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch total revenue from confirmed orders
        const { data: orders } = await supabase
          .from("rental_orders")
          .select("total_amount, status")
          .eq("status", "confirmed");

        const totalRevenue =
          orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

        // Fetch most rented products (this would need a join with order_items if that table exists)
        // For now, we'll get products with their rental counts
        const { data: products } = await supabase
          .from("product_templates")
          .select("id, name")
          .eq("vendor_id", user.id)
          .eq("is_published", true)
          .limit(5);

        // Fetch late returns
        const { data: lateOrders } = await supabase
          .from("rental_orders")
          .select(`
            id,
            return_date,
            pickup_status,
            customer_id,
            users!rental_orders_customer_id_fkey(name)
          `)
          .eq("pickup_status", "picked_up")
          .lt("return_date", new Date().toISOString());

        const lateReturns =
          lateOrders?.map((order) => {
            const returnDate = new Date(order.return_date);
            const now = new Date();
            const daysLate = Math.floor(
              (now.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
              id: order.id,
              order_id: order.id,
              product_name: "Product Name", // Would need join with order_items
              customer_name: (order.users as any)?.name || "Unknown",
              return_date: order.return_date,
              days_late: daysLate,
            };
          }) || [];

        setStats({
          totalRevenue,
          mostRentedProducts:
            products?.map((p) => ({ ...p, rental_count: 0 })) || [],
          lateReturns,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VendorNavbar />
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Global Insights
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your rental business performance
        </p>
      </div>

      {/* Revenue Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              ₹{stats.totalRevenue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">All time</span>
            </div>
          </div>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Rented Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Most Rented Products
            </h2>
          </div>
          {stats.mostRentedProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.mostRentedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {product.rental_count} rentals
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No rental data available yet
            </p>
          )}
        </div>

        {/* Late Return Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Late Return Alerts
            </h2>
          </div>
          {stats.lateReturns.length > 0 ? (
            <div className="space-y-3">
              {stats.lateReturns.map((returnItem) => (
                <div
                  key={returnItem.id}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {returnItem.customer_name}
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      {returnItem.days_late} days late
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {returnItem.product_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {new Date(returnItem.return_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No late returns. Great job! 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

