import { createClient } from '@supabase/supabase-js';
import OrderConfirmationClient from '@/components/portal/OrderConfirmationClient';
import { notFound } from 'next/navigation';

// Server-side fetch with admin privileges
async function getOrder(id: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: order } = await supabaseAdmin
        .from('rental_orders')
        .select(`
      *,
      users (email, name),
      rental_order_items (*)
    `)
        .eq('id', id)
        .single();

    return order;
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const order = await getOrder(resolvedParams.id);

    if (!order) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <OrderConfirmationClient order={order} />
        </div>
    );
}
