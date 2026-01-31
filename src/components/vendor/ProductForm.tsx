"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  cost_price: number | null;
  quantity_on_hand: number | null;
  is_published: boolean;
  is_rentable: boolean;
}

interface PricingRow {
  id?: string;
  duration_unit: "hour" | "day" | "week" | "custom";
  price_per_unit: number;
  late_fee_per_hour: number;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    cost_price: "",
    quantity_on_hand: "",
    is_published: false,
    is_rentable: true,
  });

  const [pricingRows, setPricingRows] = useState<PricingRow[]>([
    { duration_unit: "day", price_per_unit: 0, late_fee_per_hour: 0 },
  ]);

  const [attributes, setAttributes] = useState<{
    brand?: string;
    color?: string;
  }>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        cost_price: product.cost_price?.toString() || "",
        quantity_on_hand: product.quantity_on_hand?.toString() || "",
        is_published: product.is_published || false,
        is_rentable: product.is_rentable ?? true,
      });
      // Load existing pricing
      loadPricing();
    }
  }, [product]);

  const loadPricing = async () => {
    if (!product?.id) return;
    try {
      const { data } = await supabase
        .from("rental_pricing")
        .select("*")
        .eq("template_id", product.id);
      if (data) {
        setPricingRows(
          data.map((p) => ({
            id: p.id,
            duration_unit: p.duration_unit as any,
            price_per_unit: Number(p.price_per_unit),
            late_fee_per_hour: Number(p.late_fee_per_hour || 0),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading pricing:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create or update product
      const productData = {
        vendor_id: user.id,
        name: formData.name,
        description: formData.description || null,
        sku: formData.sku || null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        quantity_on_hand: formData.quantity_on_hand
          ? parseInt(formData.quantity_on_hand)
          : 0,
        is_published: formData.is_published,
        is_rentable: formData.is_rentable,
      };

      let productId: string;

      if (product?.id) {
        // Update existing
        const { data, error } = await supabase
          .from("product_templates")
          .update(productData)
          .eq("id", product.id)
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("product_templates")
          .insert(productData)
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Save pricing
      // Delete existing pricing first
      await supabase
        .from("rental_pricing")
        .delete()
        .eq("template_id", productId);

      // Insert new pricing
      if (pricingRows.length > 0) {
        const pricingData = pricingRows.map((row) => ({
          template_id: productId,
          duration_unit: row.duration_unit,
          price_per_unit: row.price_per_unit,
          late_fee_per_hour: row.late_fee_per_hour || 0,
        }));

        const { error: pricingError } = await supabase
          .from("rental_pricing")
          .insert(pricingData);

        if (pricingError) throw pricingError;
      }

      toast.success(
        `Product ${product ? "updated" : "created"} successfully!`
      );
      onSuccess();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const addPricingRow = () => {
    setPricingRows([
      ...pricingRows,
      { duration_unit: "day", price_per_unit: 0, late_fee_per_hour: 0 },
    ]);
  };

  const removePricingRow = (index: number) => {
    setPricingRows(pricingRows.filter((_, i) => i !== index));
  };

  const updatePricingRow = (
    index: number,
    field: keyof PricingRow,
    value: any
  ) => {
    const updated = [...pricingRows];
    updated[index] = { ...updated[index], [field]: value };
    setPricingRows(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({ ...formData, cost_price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity on Hand
                  </label>
                  <input
                    type="number"
                    value={formData.quantity_on_hand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity_on_hand: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_published: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish Product
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_rentable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_rentable: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available for Rent
                  </span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rental Pricing
                  </h3>
                  <button
                    type="button"
                    onClick={addPricingRow}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Pricing
                  </button>
                </div>

                <div className="space-y-4">
                  {pricingRows.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duration Unit
                        </label>
                        <select
                          value={row.duration_unit}
                          onChange={(e) =>
                            updatePricingRow(
                              index,
                              "duration_unit",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option value="hour">Hourly</option>
                          <option value="day">Daily</option>
                          <option value="week">Weekly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price per Unit (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={row.price_per_unit}
                          onChange={(e) =>
                            updatePricingRow(
                              index,
                              "price_per_unit",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Late Fee per Hour (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={row.late_fee_per_hour}
                          onChange={(e) =>
                            updatePricingRow(
                              index,
                              "late_fee_per_hour",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 flex items-end">
                        {pricingRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePricingRow(index)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Attributes (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={attributes.brand || ""}
                      onChange={(e) =>
                        setAttributes({ ...attributes, brand: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={attributes.color || ""}
                      onChange={(e) =>
                        setAttributes({ ...attributes, color: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {step === 1 ? "Next" : product ? "Update" : "Create"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

