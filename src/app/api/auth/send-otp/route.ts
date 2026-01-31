import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 2. Configure Nodemailer Transporter
const transporter = nodemailer.createTransport(
  process.env.EMAIL_HOST && process.env.EMAIL_PORT
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Strict Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 2. Rate Limiting / Spam Prevention
    // Check if an OTP was sent to this email recently (e.g., last 1 minute)
    const { data: recentOtps } = await supabaseAdmin
      .from('verification_codes')
      .select('created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentOtps && recentOtps.length > 0) {
      const lastSent = new Date(recentOtps[0].created_at);
      const now = new Date();
      const diffInSeconds = (now.getTime() - lastSent.getTime()) / 1000;

      if (diffInSeconds < 60) { // 60 seconds cooldown
        return NextResponse.json({ error: 'Please wait a minute before requesting another OTP.' }, { status: 429 });
      }
    }

    // 3. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Store OTP in Supabase 'verification_codes' table
    // We first delete any existing codes for this email to prevent clutter
    await supabaseAdmin
      .from('verification_codes')
      .delete()
      .eq('email', email);

    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const { error: dbError } = await supabaseAdmin
      .from('verification_codes')
      .insert([
        {
          email,
          code: otp,
          expires_at: expiresAt.toISOString(),
        }
      ]);

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 });
    }

    // 5. Send the Email
    await transporter.sendMail({
      from: `"Rental System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Verification Code</h2>
          <p>You are registering for the Rental Management System.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="letter-spacing: 5px; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">
            ${otp}
          </h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error: unknown) { // 1. Change 'any' to 'unknown'
    console.error('Send OTP Error:', error);

    // 2. Safely check if the error is a standard Error object
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
