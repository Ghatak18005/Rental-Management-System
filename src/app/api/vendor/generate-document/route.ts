import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { orderId, type } = await req.json();

    if (!orderId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a vendor
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "VENDOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("rental_orders")
      .select(`
        *,
        users!rental_orders_customer_id_fkey(name, email, mobile)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Generate PDF document (simplified - in production, use a PDF library like pdfkit or puppeteer)
    // For now, return a JSON response that the frontend can use to generate/download
    const documentData = {
      type,
      orderId: order.id,
      orderNumber: order.id.slice(0, 8),
      customer: order.users,
      pickupDate: order.pickup_date,
      returnDate: order.return_date,
      totalAmount: order.total_amount,
      securityDeposit: order.security_deposit,
      generatedAt: new Date().toISOString(),
    };

    // In production, generate actual PDF here
    // For now, return document data
    return NextResponse.json({
      success: true,
      document: documentData,
      message: `${type} document generated successfully`,
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

