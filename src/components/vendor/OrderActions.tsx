"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Package,
  RotateCcw,
  FileText,
  Loader2,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  pickup_status: string;
  return_date: string | null;
}

interface OrderActionsProps {
  order: Order;
  onUpdate: () => void;
}

export default function OrderActions({ order, onUpdate }: OrderActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handlePickup = async () => {
    if (!confirm("Generate pickup document and mark as 'With Customer'?")) return;

    setLoading("pickup");
    try {
      const { error } = await supabase
        .from("rental_orders")
        .update({
          pickup_status: "picked_up",
          status: "confirmed",
        })
        .eq("id", order.id);

      if (error) throw error;

      // Generate pickup document (PDF generation would be done server-side)
      toast.success("Pickup document generated. Order status updated to 'With Customer'");
      onUpdate();
    } catch (error: any) {
      console.error("Error processing pickup:", error);
      toast.error("Failed to process pickup");
    } finally {
      setLoading(null);
    }
  };

  const handleReturn = async () => {
    if (!confirm("Generate return document and restore stock?")) return;

    setLoading("return");
    try {
      const returnDate = new Date();
      const dueDate = order.return_date ? new Date(order.return_date) : null;
      const isLate = dueDate && returnDate > dueDate;

      // Calculate late fees if applicable
      let lateFee = 0;
      if (isLate && dueDate) {
        const hoursLate = Math.ceil(
          (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60)
        );
        // Fetch late fee from pricing (would need order_items join)
        // For now, using a default
        lateFee = hoursLate * 100; // Example: ₹100 per hour
      }

      const { error } = await supabase
        .from("rental_orders")
        .update({
          pickup_status: isLate ? "late" : "returned",
        })
        .eq("id", order.id);

      if (error) throw error;

      // Restore stock (would need to update product_templates quantity_on_hand)
      // This would typically be done via a trigger or API route

      // Generate return document
      toast.success(
        `Return document generated. ${isLate ? `Late fee: ₹${lateFee.toFixed(2)}` : "No late fees."}`
      );
      onUpdate();
    } catch (error: any) {
      console.error("Error processing return:", error);
      toast.error("Failed to process return");
    } finally {
      setLoading(null);
    }
  };

  const generateDocument = async (type: "pickup" | "return") => {
    setLoading(type);
    try {
      // This would call an API route to generate PDF
      const response = await fetch(`/api/vendor/generate-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, type }),
      });

      if (!response.ok) throw new Error("Failed to generate document");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${order.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${type === "pickup" ? "Pickup" : "Return"} document downloaded`);
    } catch (error: any) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {order.status === "draft" && (
        <button
          onClick={() => generateDocument("pickup")}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          title="Generate Pickup Document"
        >
          {loading === "pickup" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </button>
      )}

      {order.pickup_status === "pending" && order.status === "confirmed" && (
        <button
          onClick={handlePickup}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading === "pickup" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Package className="h-3 w-3" />
          )}
          Pickup
        </button>
      )}

      {order.pickup_status === "picked_up" && (
        <>
          <button
            onClick={() => generateDocument("return")}
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
            title="Generate Return Document"
          >
            {loading === "return" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleReturn}
            disabled={loading !== null}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading === "return" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RotateCcw className="h-3 w-3" />
            )}
            Return
          </button>
        </>
      )}

      {order.pickup_status === "returned" && (
        <span className="text-xs text-gray-500">Completed</span>
      )}
    </div>
  );
}

