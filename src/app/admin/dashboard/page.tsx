'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, LayoutGrid, List, Loader2, LogOut,
  User, Filter, Settings
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

/* ================= TYPES ================= */
interface AdminOrder {
  id: string;
  created_at: string;
  status: string; // Changed to string to be flexible
  total_amount: number;
  customer: { name: string };
  items: { product_name: string }[];
}

/* ================= CONFIG ================= */
// Define colors for every possible status
const STATUS_CONFIG: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  quotation: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  quotation_sent: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  sale_order: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/30',
  invoiced: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  posted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  // --- STATE ---
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  // --- FETCH DATA (Bulletproof Method) ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAdminName(user?.user_metadata?.name || user?.user_metadata?.full_name || 'Admin');

      try {
        // 1. Fetch Orders directly
        const { data: rawOrders, error: orderError } = await supabase
          .from('rental_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;

        if (!rawOrders || rawOrders.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // 2. Fetch Users (Customers) manually to avoid join errors
        const customerIds = [...new Set(rawOrders.map(o => o.customer_id).filter(Boolean))];
        const { data: customers } = await supabase
          .from('users')
          .select('id, name')
          .in('id', customerIds);

        // 3. Fetch Items manually
        const orderIds = rawOrders.map(o => o.id);
        const { data: items } = await supabase
          .from('rental_order_items')
          .select('order_id, product_name')
          .in('order_id', orderIds);

        // 4. Merge Data
        const combinedData: AdminOrder[] = rawOrders.map(order => {
          const customer = customers?.find(c => c.id === order.customer_id);
          const orderItems = items?.filter(i => i.order_id === order.id) || [];

          return {
            id: order.id,
            created_at: order.created_at,
            // Force status to lowercase to ensure matching works
            status: order.status?.toLowerCase().trim() || 'draft',
            total_amount: order.total_amount || 0,
            customer: { name: customer?.name || 'Unknown' },
            items: orderItems.map((i: any) => ({ product_name: i.product_name }))
          };
        });

        setOrders(combinedData);

      } catch (err: any) {
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // --- FILTER LOGIC ---
  const filtered = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase());

    // Loose matching for status
    const matchesStatus = activeStatus === 'all' || o.status.includes(activeStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  // --- STATS ---
  const getCount = (key: string) => orders.filter(o => o.status.includes(key)).length;

  const stats = {
    total: orders.length,
    draft: getCount('draft'),
    quotation: getCount('quotation'),
    quotation_sent: getCount('quotation_sent'),
    invoiced: getCount('invoiced'),
    confirmed: getCount('confirmed'),
    cancelled: getCount('cancelled'),
  };

  const handleLogout = async () => {
    localStorage.removeItem('isAdminAuthenticated');
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans">

      {/* HEADER */}
      <header className="h-16 bg-[#1E1E1E] border-b border-gray-800 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-12">
          <div className="bg-white text-black px-2 py-0.5 rounded font-bold text-sm">RentFlow</div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-400">
            <span className="text-white font-medium border-b-2 border-purple-500 pb-5 -mb-5 cursor-pointer">Orders</span>
            <span onClick={() => router.push("/admin/invoices")} className="hover:text-white cursor-pointer transition-colors">Invoices</span>
            <span className="hover:text-white cursor-pointer transition-colors">Reports</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold">{adminName}</div>
            <div className="text-xs text-green-400">Online</div>
          </div>
          <div className="h-9 w-9 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
            <User className="h-5 w-5 text-gray-300" />
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 ml-2">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        {view === 'kanban' ? (
          <aside className="w-72 bg-[#121212] border-r border-gray-800 p-6 hidden lg:block overflow-y-auto">
            <div className="mb-8 space-y-1">
              <div onClick={() => setActiveStatus('all')} className={`flex justify-between items-center px-3 py-2 rounded-lg border cursor-pointer ${activeStatus === 'all' ? 'bg-[#2A2A2A] border-purple-500 text-white' : 'bg-[#1E1E1E] border-gray-700 text-gray-300'}`}>
                <span className="text-sm font-medium">Orders</span>
              </div>
              <div onClick={() => router.push("/admin/invoices")} className="flex justify-between items-center px-3 py-2 text-gray-400 hover:bg-[#1E1E1E] rounded-lg cursor-pointer">
                <span className="text-sm font-medium">Invoices</span>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#252525]">
                <span className="font-bold text-sm text-gray-200">Rental Status</span>
                <Filter className="h-3 w-3 text-gray-500" />
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div onClick={() => setActiveStatus('all')} className={`flex justify-between items-center cursor-pointer p-1 rounded hover:bg-white/5 ${activeStatus === 'all' ? 'text-purple-400 font-bold' : ''}`}>
                  <span className={activeStatus === 'all' ? 'text-purple-400' : 'text-gray-400'}>Total:</span>
                  <span className="font-mono text-white">{stats.total}</span>
                </div>
                <div className="h-px bg-gray-700 w-full my-1"></div>
                {[
                  { label: 'Draft', key: 'draft', count: stats.draft },
                  { label: 'Quotation', key: 'quotation', count: stats.quotation },
                  { label: 'Quotation Sent', key: 'quotation_sent', count: stats.quotation_sent },
                  { label: 'Invoiced', key: 'invoiced', count: stats.invoiced },
                  { label: 'Confirmed', key: 'confirmed', count: stats.confirmed },
                  { label: 'Cancelled', key: 'cancelled', count: stats.cancelled },
                ].map((item) => (
                  <div key={item.key} onClick={() => setActiveStatus(item.key)} className={`flex justify-between items-center cursor-pointer p-1 rounded hover:bg-white/5 ${activeStatus === item.key ? 'text-purple-400 font-bold' : ''}`}>
                    <span className={activeStatus === item.key ? 'text-purple-400' : 'text-gray-400'}>{item.label}</span>
                    <span className="font-mono text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        ) : (
          <aside className="w-14 bg-[#121212] border-r border-gray-800 flex flex-col items-center py-6 gap-6">
            <div className="p-2 bg-[#1E1E1E] rounded-lg border border-gray-700 cursor-pointer"><span className="text-xs font-bold">OS</span></div>
            <div className="flex-1 flex items-center justify-center"><div className="rotate-90 whitespace-nowrap text-gray-500 text-sm tracking-widest font-mono">STATUS</div></div>
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#121212]">

          {/* TOOLBAR */}
          <div className="px-8 py-6 border-b border-gray-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Rental Order</h2>
              <Settings className="h-5 w-5 text-gray-500 cursor-pointer hover:text-white" />
              <button onClick={() => router.push('/admin/orders/new')} className="bg-[#E879F9] hover:bg-[#D946EF] text-black px-6 py-1.5 rounded-md text-sm font-bold">New</button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#1E1E1E] border border-gray-700 rounded-md py-1.5 pl-3 pr-8 text-sm focus:border-purple-500 outline-none" placeholder="Search orders..." />
                <Search className="absolute right-2 top-2 h-4 w-4 text-gray-500" />
              </div>
              <div className="flex bg-[#1E1E1E] rounded-md border border-gray-700 p-0.5 ml-2">
                <button onClick={() => setView('kanban')} className={`p-1.5 rounded-sm ${view === 'kanban' ? 'bg-gray-600' : ''}`}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setView('list')} className={`p-1.5 rounded-sm ${view === 'list' ? 'bg-gray-600' : ''}`}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* KANBAN VIEW */}
          <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden">
            {view === 'kanban' ? (
              <div className="flex gap-5 h-full min-w-[1200px]">
                {/* ADDED 'DRAFT' COLUMN HERE so your new orders appear */}
                {['Draft', 'Quotation', 'Quotation Sent', 'Confirmed', 'Invoiced', 'Cancelled'].map((colTitle) => {
                  const colKey = colTitle.toLowerCase().replace(' ', '_');
                  const isColumnActive = activeStatus === 'all' || activeStatus === colKey;
                  const colOrders = filtered.filter(o => o.status === colKey);

                  // If filtering, hide empty columns
                  if (!isColumnActive && activeStatus !== 'all') return null;

                  return (
                    <div key={colKey} className="flex-1 flex flex-col h-full min-w-[260px]">
                      <div className="bg-[#1E1E1E] border border-gray-700 rounded-t-lg p-3 flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-300 text-sm">{colTitle}</span>
                        <span className="text-xs bg-[#252525] px-2 py-0.5 rounded text-gray-400">{colOrders.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                        {colOrders.map(order => {
                          const style = STATUS_CONFIG[order.status] || STATUS_CONFIG['draft'];
                          return (
                            <div key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)} className="bg-[#1E1E1E] border border-gray-800 rounded-md p-4 shadow-sm hover:border-gray-600 transition-all cursor-pointer group">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-200 text-sm truncate max-w-[140px]">{order.customer.name}</span>
                                <span className="text-gray-400 text-xs truncate max-w-[80px]">{order.items[0]?.product_name || 'No Item'}</span>
                              </div>
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-gray-500 font-mono">#{order.id.slice(0, 6)}</span>
                                <span className="font-bold text-white text-sm">Rs {order.total_amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                                <span className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${style}`}>{order.status.replace('_', ' ')}</span>
                              </div>
                            </div>
                          );
                        })}
                        {colOrders.length === 0 && (
                          <div className="text-center py-10 text-gray-700 text-xs italic">No orders</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="bg-[#1E1E1E] border border-gray-800 rounded-lg overflow-hidden h-full flex flex-col">
                {activeStatus !== 'all' && (
                  <div className="bg-purple-900/20 text-purple-300 px-6 py-2 text-xs border-b border-gray-800 flex justify-between items-center">
                    <span>Filtering by: <b>{activeStatus.toUpperCase()}</b></span>
                    <button onClick={() => setActiveStatus('all')} className="hover:underline">Clear Filter</button>
                  </div>
                )}
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#252525] text-gray-400 font-medium border-b border-gray-800 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-700 bg-gray-800" /></th>
                      <th className="px-6 py-3">Order Ref</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3 text-right">Total</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 overflow-y-auto">
                    {filtered.length > 0 ? filtered.map(order => {
                      const style = STATUS_CONFIG[order.status] || STATUS_CONFIG['draft'];
                      return (
                        <tr key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:bg-[#252525] transition-colors cursor-pointer">
                          <td className="px-6 py-3"><input type="checkbox" className="rounded border-gray-700 bg-gray-800" /></td>
                          <td className="px-6 py-3 font-mono text-gray-400">#{order.id.slice(0, 6)}</td>
                          <td className="px-6 py-3 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3 font-medium text-white">{order.customer.name}</td>
                          <td className="px-6 py-3 text-gray-400">{order.items[0]?.product_name || 'No Items'}</td>
                          <td className="px-6 py-3 text-right font-bold text-white">Rs {order.total_amount.toLocaleString()}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase inline-block w-24 ${style}`}>{order.status.replace('_', ' ')}</span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-500">No orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}