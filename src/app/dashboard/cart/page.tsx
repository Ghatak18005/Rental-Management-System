'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, Trash2, Calendar, CreditCard, X, Loader2, ArrowRight, Tag, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH CART FROM DB ---
  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: orderData } = await supabase
        .from('rental_orders')
        .select('*')
        .eq('customer_id', user.id)
        .eq('status', 'draft')
        .single();

      if (orderData) {
        setOrder(orderData);
        const { data: items } = await supabase
          .from('rental_order_items')
          .select('*')
          .eq('order_id', orderData.id);
        setCartItems(items || []);
      }
      setLoading(false);
    };

    fetchCart();
  }, [supabase, router]);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalTotal = subtotal;

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase.from('rental_order_items').delete().eq('id', itemId);
    if (!error) {
      setCartItems(prev => prev.filter(i => i.id !== itemId));
      toast.success("Item removed");
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (order) {
       await supabase.from('rental_orders')
        .update({ status: 'confirmed', total_amount: finalTotal })
        .eq('id', order.id);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setCartItems([]);
    toast.success("Payment Successful! Order Confirmed.");
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary transition-colors duration-300">
      
      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-12">
        
        {/* Breadcrumb / Title */}
        <div className="mb-8">
           <h1 className="text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
           <div className="text-sm text-foreground/50 flex items-center gap-2">
             <span className="text-primary font-semibold">Review Cart</span> 
             <ArrowRight className="h-3 w-3" /> 
             <span>Checkout</span>
             <ArrowRight className="h-3 w-3" />
             <span>Confirmation</span>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
          
          {/* LEFT: CART ITEMS */}
          <div className="flex-[2]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h2 className="text-lg font-bold">Items ({cartItems.length})</h2>
              {cartItems.length > 0 && (
                <button onClick={() => router.push('/dashboard')} className="text-sm text-primary hover:underline font-medium">
                  Continue Shopping
                </button>
              )}
            </div>
            
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border text-foreground/40 shadow-sm">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 opacity-50"/>
                </div>
                <h3 className="text-lg font-bold text-foreground">Your cart is empty</h3>
                <p className="text-sm mt-2">Looks like you haven't added any gear yet.</p>
                <button onClick={() => router.push('/dashboard')} className="mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                  Browse Equipment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="group bg-card p-4 rounded-2xl border border-border flex flex-col sm:flex-row gap-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    
                    {/* Image */}
                    <div className="w-full sm:w-32 h-32 bg-accent/30 rounded-xl overflow-hidden border border-border flex-shrink-0 relative">
                      <img 
                        src={item.image_url || 'https://via.placeholder.com/150'} 
                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" 
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg text-foreground">{item.product_name}</h3>
                           <span className="font-black text-lg text-primary">₹{item.price}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-foreground/50 bg-accent/30 w-fit px-3 py-1.5 rounded-lg border border-border">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {order 
                            ? `${new Date(order.pickup_date).toLocaleDateString()} - ${new Date(order.return_date).toLocaleDateString()}` 
                            : 'Dates not selected'
                          }
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="text-xs text-foreground/40 font-medium">
                           Quantity: <span className="text-foreground">{item.quantity}</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="flex items-center gap-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          {cartItems.length > 0 && (
            <div className="flex-1 max-w-md">
              <div className="bg-card p-8 rounded-3xl border border-border sticky top-28 shadow-xl">
                <h3 className="font-bold text-lg mb-6">Rental Summary</h3>
                
                <div className="space-y-4 mb-8">
                   <div className="bg-accent/30 p-4 rounded-2xl border border-border flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-secondary"></div>
                      <div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-1">Pickup</span>
                        <div className="text-sm font-medium">
                          {order ? new Date(order.pickup_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </div>
                      </div>
                   </div>
                   
                   <div className="bg-accent/30 p-4 rounded-2xl border border-border flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-1">Return</span>
                        <div className="text-sm font-medium">
                          {order ? new Date(order.return_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 mb-8">
                   <div className="flex justify-between text-sm text-foreground/60">
                     <span>Subtotal</span>
                     <span>₹{subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-foreground/60">
                     <span>Taxes & Fees</span>
                     <span>Calculated at checkout</span>
                   </div>
                   <div className="h-px bg-border my-2"></div>
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-lg">Total</span>
                     <span className="font-black text-2xl text-primary">₹{finalTotal.toFixed(2)}</span>
                   </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-accent hover:bg-accent/80 text-foreground font-bold py-3.5 rounded-xl border border-border transition-all flex items-center justify-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-foreground/50" /> Apply Coupon
                  </button>
                  <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-foreground/40 font-medium uppercase tracking-wide">
                   <ShieldCheck className="w-3 h-3" /> Secure Payment
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CHECKOUT MODAL ================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <form onSubmit={handlePayment} className="bg-card w-full max-w-lg rounded-3xl border border-border p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
              
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-accent rounded-full text-foreground/50 hover:text-foreground transition-all">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-1">Express Checkout</h2>
                <p className="text-sm text-foreground/50">Complete your payment to confirm rental.</p>
              </div>

              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Card Information</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                      <input 
                        required 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        className="w-full bg-accent/30 border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/20 font-mono" 
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Expiry</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full bg-accent/30 border border-border rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/20 text-center font-mono" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">CVC</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="123" 
                        className="w-full bg-accent/30 border border-border rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/20 text-center font-mono" 
                      />
                    </div>
                 </div>
                 
                 <div className="pt-4">
                   <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full bg-primary hover:opacity-90 text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                   >
                      {isProcessing ? (
                        <><Loader2 className="animate-spin h-5 w-5"/> Processing...</>
                      ) : (
                        `Pay ₹${finalTotal.toFixed(2)}`
                      )}
                   </button>
                 </div>
              </div>
            </form>
        </div>
      )}

    </div>
  );
}