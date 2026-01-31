'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Loader2, Check, X as XIcon, Plus, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export type DocumentMode = 'order' | 'invoice';

interface DocumentLine {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxes: number;
  amount: number;
}

interface DocumentFormProps {
  mode: DocumentMode;
  documentId: string; // 'new' or UUID
}

export default function DocumentForm({ mode, documentId }: DocumentFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const isOrder = mode === 'order';
  const isNew = documentId === 'new';

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Data Lists
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form State
  const [status, setStatus] = useState(isOrder ? 'Quotation' : 'Draft');
  const [formData, setFormData] = useState({
    id: isNew ? undefined : documentId,
    displayId: isNew ? 'Draft' : documentId.slice(0, 8).toUpperCase(),
    customer_id: '',
    invoiceAddress: '',
    deliveryAddress: '',
    date: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
    startDate: '',
    endDate: ''
  });

  const [lines, setLines] = useState<DocumentLine[]>([
    { id: '1', product: '', description: '', quantity: 1, unit: 'Units', unitPrice: 0, taxes: 0, amount: 0 }
  ]);

  const [couponCode, setCouponCode] = useState('');

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // A. Fetch Customers ONLY (Filter out Vendors)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, full_name, email')
          .eq('role', 'CUSTOMER'); // <--- CRITICAL FILTER

        if (userError) console.error('Error fetching users:', userError);
        if (userData) setCustomers(userData);

        // B. Fetch Products (Sourced from Vendors, viewed by Admin)
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*');

        if (prodError) console.error('Error fetching products:', prodError);
        if (prodData) setProducts(prodData);

        // C. If Editing, Fetch Existing Document
        if (!isNew) {
          const table = isOrder ? 'rental_orders' : 'invoices';
          const { data: doc, error: docError } = await supabase
            .from(table)
            .select(`*, items:${isOrder ? 'rental_order_items' : 'invoice_items'}(*)`)
            .eq('id', documentId)
            .single();

          if (docError) {
             console.error('Error fetching document:', docError);
             // If not found, maybe redirect or show error? 
             // keeping silent for now to allow "new" flows to work if ID is fake
          }

          if (doc) {
            setFormData({
              id: doc.id,
              displayId: doc.id.slice(0, 8).toUpperCase(),
              customer_id: doc.customer_id,
              invoiceAddress: '', 
              deliveryAddress: '',
              date: doc.created_at ? doc.created_at.split('T')[0] : '',
              startDate: doc.rental_start || '',
              endDate: doc.rental_end || ''
            });
            setStatus(doc.status);

            if (doc.items && doc.items.length > 0) {
              setLines(doc.items.map((item: any) => ({
                id: item.id,
                product: item.product_name,
                description: '',
                quantity: item.quantity,
                unit: 'Units',
                unitPrice: item.price || item.unit_price || 0,
                taxes: 0,
                amount: (item.quantity * (item.price || item.unit_price || 0))
              })));
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [documentId, isNew, isOrder, supabase]);

  // --- CALCULATIONS ---
  const updateLine = (id: string, field: keyof DocumentLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };

        // Auto-fill price from product list
        if (field === 'product') {
          const selectedProd = products.find(p => p.name === value);
          if (selectedProd) {
            updated.unitPrice = selectedProd.price;
            updated.unit = selectedProd.unit || 'Units';
          }
        }

        // Auto-calculate Amount
        if (field === 'quantity' || field === 'unitPrice' || field === 'product') {
          updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
        return updated;
      }
      return line;
    }));
  };

  const calculateTotal = () => lines.reduce((sum, line) => sum + line.amount, 0);

  // --- ACTIONS: SAVE / CONFIRM ---
  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    const finalStatus = newStatus || status;
    const total = calculateTotal();
    let docId = formData.id;

    try {
      // 1. Upsert Header
      if (isOrder) {
        const payload = {
          customer_id: formData.customer_id,
          total_amount: total,
          status: finalStatus,
          rental_start: formData.startDate || null,
          rental_end: formData.endDate || null,
        };

        if (isNew && !docId) {
          const { data, error } = await supabase.from('rental_orders').insert(payload).select().single();
          if (error) throw error;
          docId = data.id;
        } else {
          const { error } = await supabase.from('rental_orders').update(payload).eq('id', docId);
          if (error) throw error;
        }
      } else {
        // Invoice Logic
        const payload = {
          customer_id: formData.customer_id,
          total_amount: total,
          status: finalStatus,
        };
        if (isNew && !docId) {
          const { data, error } = await supabase.from('invoices').insert(payload).select().single();
          if (error) throw error;
          docId = data.id;
        } else {
          const { error } = await supabase.from('invoices').update(payload).eq('id', docId);
          if (error) throw error;
        }
      }

      // 2. Replace Items (Delete All -> Insert New)
      const itemsTable = isOrder ? 'rental_order_items' : 'invoice_items';
      const foreignKey = isOrder ? 'order_id' : 'invoice_id';

      if (docId) {
        await supabase.from(itemsTable).delete().eq(foreignKey, docId);
        
        const itemsToInsert = lines.map(line => ({
          [foreignKey]: docId,
          product_name: line.product,
          quantity: line.quantity,
          price: line.unitPrice, // Make sure DB uses 'price' or 'unit_price' consistently
          // amount: line.amount 
        }));

        if (itemsToInsert.length > 0) {
            const { error: itemsError } = await supabase.from(itemsTable).insert(itemsToInsert);
            if (itemsError) throw itemsError;
        }
      }

      toast.success("Saved successfully!");
      setStatus(finalStatus);
      
      // Update form ID if we just created a new one
      if (isNew && docId) {
        setFormData(prev => ({ ...prev, id: docId, displayId: docId!.slice(0, 8).toUpperCase() }));
        // Optionally redirect: router.push(`/admin/orders/${docId}`);
      }

    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = () => handleSave(isOrder ? 'confirmed' : 'Posted');

  const handleCreateInvoice = async () => {
    if (status !== 'confirmed') {
      toast.error("Order must be confirmed first");
      return;
    }
    
    setIsCreatingInvoice(true);
    try {
      // Create Invoice Header
      const { data: inv, error } = await supabase.from('invoices').insert({
        order_id: formData.id,
        customer_id: formData.customer_id,
        total_amount: calculateTotal(),
        status: 'Draft'
      }).select().single();

      if (error) throw error;

      // Copy Items
      const invoiceItems = lines.map(line => ({
        invoice_id: inv.id,
        product_name: line.product,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        amount: line.amount
      }));

      await supabase.from('invoice_items').insert(invoiceItems);
      
      toast.success("Invoice Created!");
      router.push(`/admin/invoices/${inv.id}`);
      
    } catch (err: any) {
      toast.error("Error creating invoice: " + err.message);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleAddLine = () => {
    setLines([...lines, { 
      id: Math.random().toString(36).substr(2, 9), 
      product: '', description: '', quantity: 1, unit: 'Units', unitPrice: 0, taxes: 0, amount: 0 
    }]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans p-6">
      
      {/* --- TOP HEADER --- */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#E879F9] text-black px-3 py-1 rounded font-bold text-sm shadow-lg">
           {isNew ? 'New' : status}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
           {isOrder ? 'Rental Order' : 'Invoice'}
        </h1>
        <div className="flex gap-2 ml-2">
           <button className="bg-green-500/10 hover:bg-green-500/20 p-1.5 rounded border border-green-500/30 text-green-500 transition-colors"><Check className="h-4 w-4"/></button>
           <button className="bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded border border-red-500/30 text-red-500 transition-colors"><XIcon className="h-4 w-4"/></button>
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-8 relative shadow-2xl">
        
        {/* --- ACTION BAR --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-800">
          <div className="flex gap-3">
            <button 
              onClick={() => handleSave()} 
              disabled={saving}
              className="px-5 py-2 bg-[#E879F9] hover:bg-[#D946EF] text-black rounded-lg font-bold text-sm shadow-lg shadow-purple-900/20 transition-all hover:scale-105"
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save'}
            </button>
            <button 
              onClick={handleConfirm}
              className="px-5 py-2 bg-transparent border border-gray-600 hover:border-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium transition-all text-gray-300"
            >
              Confirm
            </button>
            
            {isOrder && !isNew && (
              <button 
                onClick={handleCreateInvoice}
                disabled={isCreatingInvoice}
                className={`ml-4 px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-all
                  ${status === 'confirmed' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-105' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                {isCreatingInvoice && <Loader2 className="h-4 w-4 animate-spin"/>}
                Create Invoice
              </button>
            )}
          </div>

          {/* STATUS PILLS */}
          <div className="flex bg-[#121212] rounded-lg p-1 border border-gray-700">
            {isOrder ? (
               ['Quotation', 'confirmed', 'Sale Order'].map(s => (
                 <div key={s} className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase ${status === s ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>{s}</div>
               ))
            ) : (
               ['Draft', 'Posted'].map(s => (
                 <div key={s} className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase ${status === s ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>{s}</div>
               ))
            )}
          </div>
        </div>

        {/* --- FORM FIELDS --- */}
        <h2 className="text-4xl font-bold mb-10 text-white tracking-wide">{formData.displayId}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-12">
          {/* Left: Customer */}
          <div className="space-y-6">
            <div className="flex items-center group">
              <label className="w-32 text-gray-400 text-sm font-medium">Customer</label>
              <div className="flex-1 relative">
                <select 
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-700 focus:border-purple-500 outline-none py-1 text-sm text-white appearance-none"
                >
                  <option value="" className="bg-[#1E1E1E]">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#1E1E1E]">{c.full_name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1.5 h-4 w-4 text-gray-500 pointer-events-none"/>
              </div>
            </div>
            {/* Address fields placeholders */}
            <div className="flex items-center group">
               <label className="w-32 text-gray-400 text-sm font-medium">Invoice Addr</label>
               <input 
                 value={formData.invoiceAddress}
                 onChange={e => setFormData({...formData, invoiceAddress: e.target.value})}
                 className="flex-1 bg-transparent border-b border-gray-700 focus:border-purple-500 outline-none py-1 text-sm text-white"
               />
            </div>
          </div>

          {/* Right: Dates */}
          <div className="space-y-6">
            <div className="flex items-center group">
              <label className="w-32 text-gray-400 text-sm font-medium">Rental Period</label>
              <div className="flex-1 flex gap-4 items-center">
                 <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="bg-transparent border-b border-gray-700 text-white text-sm outline-none"/>
                 <span className="text-gray-600">→</span>
                 <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="bg-transparent border-b border-gray-700 text-white text-sm outline-none"/>
              </div>
            </div>
            <div className="flex items-center group">
               <label className="w-32 text-gray-400 text-sm font-medium">{isOrder ? 'Order Date' : 'Invoice Date'}</label>
               <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="flex-1 bg-transparent border-b border-gray-700 text-white text-sm outline-none"/>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="mb-0 border-b border-gray-800 flex gap-8">
           <button className="text-sm font-bold text-white border-b-2 border-white pb-3 px-1">{isOrder ? 'Order Lines' : 'Invoice Lines'}</button>
           <button className="text-sm font-medium text-gray-500 pb-3 px-1">Other Info</button>
        </div>

        {/* --- LINES TABLE --- */}
        <div className="overflow-hidden mb-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-4 w-1/3">Product</th>
                <th className="py-4 px-2">Qty</th>
                <th className="py-4 px-2">Unit</th>
                <th className="py-4 px-2">Price</th>
                <th className="py-4 px-4 text-right">Total</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <input 
                      list={`products-${line.id}`}
                      value={line.product}
                      onChange={(e) => updateLine(line.id, 'product', e.target.value)}
                      className="w-full bg-transparent outline-none text-white font-medium placeholder-gray-600"
                      placeholder="Search Product..."
                    />
                    <datalist id={`products-${line.id}`}>
                        {products.map(p => <option key={p.id} value={p.name} />)}
                    </datalist>
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="number" 
                      value={line.quantity} 
                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value))} 
                      className="w-16 bg-transparent outline-none text-white text-right"
                    />
                  </td>
                  <td className="py-3 px-2 text-gray-400">{line.unit}</td>
                  <td className="py-3 px-2">
                     <input 
                       type="number" 
                       value={line.unitPrice} 
                       onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value))} 
                       className="w-20 bg-transparent outline-none text-white"
                     />
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white">
                    {line.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <button onClick={() => handleRemoveLine(line.id)} className="text-gray-600 hover:text-red-400">
                        <Trash2 className="h-4 w-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleAddLine} className="text-[#E879F9] text-sm font-medium flex items-center gap-1 mb-6">
            <Plus className="h-3 w-3"/> Add Product
        </button>

        {/* --- FOOTER TOTALS --- */}
        <div className="flex justify-end border-t border-gray-800 pt-4">
            <div className="w-1/3 text-right space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Untaxed Amount:</span>
                    <span className="font-mono">Rs {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-gray-700 pt-2 mt-2">
                    <span>Total:</span>
                    <span className="font-mono text-[#E879F9]">Rs {calculateTotal().toLocaleString()}</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}