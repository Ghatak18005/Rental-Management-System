"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Search,
  Package,
  DollarSign,
  Hash,
  AlertCircle,
  Box
} from "lucide-react";
import toast from "react-hot-toast";
import ProductForm from "@/components/vendor/ProductForm";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  cost_price: number | null;
  quantity_on_hand: number | null;
  is_published: boolean;
  is_rentable: boolean;
  created_at: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("product_templates")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("product_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("product_templates")
        .update({ is_published: !product.is_published })
        .eq("id", product.id);

      if (error) throw error;
      toast.success(
        `Product ${!product.is_published ? "published" : "unpublished"}`
      );
      fetchProducts();
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="mt-1 text-foreground/50 text-sm">
              Manage your catalog, stock levels, and product visibility.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold text-sm"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 text-sm shadow-sm"
          />
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
                <ProductForm
                  product={editingProduct}
                  onClose={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  onSuccess={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    fetchProducts();
                  }}
                />
             </div>
          </div>
        )}

        {/* Products Table Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-accent/30">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">SKU</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mb-4">
                           <Package className="h-8 w-8 text-foreground/30" />
                        </div>
                        <p className="text-foreground/60 font-medium">
                          {searchQuery
                            ? "No matching products found."
                            : "Your inventory is empty."}
                        </p>
                        {!searchQuery && (
                          <p className="text-xs text-foreground/40 mt-1">Start by adding your first item.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-accent/20 transition-colors group"
                    >
                      {/* Product Name & Desc */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-xs text-foreground/50 truncate max-w-[200px] mt-0.5">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-foreground/60 bg-accent/30 px-2 py-1 rounded w-fit border border-border">
                          <Hash className="h-3 w-3 opacity-50" />
                          <span className="font-mono">{product.sku || "N/A"}</span>
                        </div>
                      </td>

                      {/* Stock Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${
                            (product.quantity_on_hand || 0) > 0
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                        >
                          {(product.quantity_on_hand || 0) > 0 ? (
                             <Box className="w-3 h-3" />
                          ) : (
                             <AlertCircle className="w-3 h-3" />
                          )}
                          {product.quantity_on_hand || 0} units
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                          <DollarSign className="h-3.5 w-3.5 text-foreground/40" />
                          {product.cost_price?.toFixed(2) || "0.00"}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(product)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            product.is_published
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"
                              : "bg-foreground/5 text-foreground/50 border-border hover:bg-foreground/10"
                          }`}
                        >
                          {product.is_published ? (
                            <>
                              <Eye className="h-3 w-3" /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowForm(true);
                            }}
                            className="p-2 text-foreground/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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