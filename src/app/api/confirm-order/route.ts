import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as nodemailer from 'nodemailer';

// Create a Supabase client with the SERVICE ROLE key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Fetch Order Details (including customer and items)
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('rental_orders')
      .select(`
        *,
        users (email, name),
        rental_order_items (*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 2. Check status
    if (order.status === 'confirmed') {
      return NextResponse.json({ success: true, message: 'Order is already confirmed' });
    }

    // 3. Update Status to confirmed
    const { error: updateError } = await supabaseAdmin
      .from('rental_orders')
      .update({ status: 'confirmed' })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
    }

    // 4. Send Confirmation Email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Format Items
      const itemsHTML = order.rental_order_items.map((item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs ${item.price?.toLocaleString() || 0}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('');

      // Confirmation Template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            th { background: #22c55e; color: white; padding: 12px; text-align: left; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding: 15px; background: #22c55e; color: white; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .badge { display: inline-block; background: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Order Confirmed!</h1>
              <p>Order #${order.display_id || order.id.slice(0, 8)}</p>
            </div>
            <div class="content">
              <p>Dear ${order.users?.name || 'Customer'},</p>
              <p><strong>Great news!</strong> Your rental order has been confirmed successfully.</p>
              
              <div style="text-align: center;">
                <span class="badge">STATUS: CONFIRMED</span>
              </div>
              
              <h3 style="color: #22c55e; margin-top: 30px;">Order Details:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
              
              <div class="total">
                Total Amount: Rs ${order.total_amount?.toLocaleString()}
              </div>
              
              <p style="margin-top: 30px;">Thank you for confirming your order. We are now preparing your items.</p>
              
              <p>Best regards,<br><strong>Rental Management Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: order.users.email,
        subject: `Order Confirmed - #${order.display_id || order.id.slice(0, 8)}`,
        html: htmlContent,
      });

    } catch (emailError) {
      console.error('Email send warning:', emailError);
      // Don't fail the request, just log
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
