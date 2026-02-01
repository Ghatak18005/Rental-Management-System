import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const { customerEmail, customerName, orderId, orderDetails, totalAmount } = await request.json();

        // Create email transporter using existing env variables
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '465'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Format order items for email
        const itemsHTML = orderDetails.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs ${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs ${item.amount.toLocaleString()}</td>
      </tr>
    `).join('');

        // Email HTML template for CONFIRMATION
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
            <p>Order #${orderId}</p>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p><strong>Great news!</strong> Your rental order has been confirmed and is now being processed.</p>
            
            <div style="text-align: center;">
              <span class="badge">STATUS: SALE ORDER</span>
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
              Total Amount: Rs ${totalAmount.toLocaleString()}
            </div>
            
            <p style="margin-top: 30px;">Your order is now confirmed and will be prepared for delivery. We'll keep you updated on the progress.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br><strong>Rental Management Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Order Confirmed - #${orderId} | Rental Management`,
            html: htmlContent,
        });

        return NextResponse.json({ success: true, message: 'Confirmation email sent successfully' });
    } catch (error: any) {
        console.error('Email send error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
