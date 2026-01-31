import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
// This client has full access to your database and Auth, so use it carefully.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, password, role, name, company_name, gstin, mobile } = body;

    // 1. Validate Input
    if (!email || !otp || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['CUSTOMER', 'VENDOR', 'ADMIN'];
    const userRole = (role || 'CUSTOMER').toUpperCase();
    if (!validRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Validate vendor-specific fields
    if (userRole === 'VENDOR' && (!company_name || !gstin)) {
      return NextResponse.json({ error: 'Company Name and GSTIN are required for Vendors' }, { status: 400 });
    }

    // Check if user already exists in public.users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    // 2. Verify OTP
    // Check if the OTP exists and matches the email
    const { data: verificationData, error: verifyError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', otp)
      .single();

    if (verifyError || !verificationData) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check expiration (if expires_at exists)
    if (verificationData.expires_at) {
      const expiresAt = new Date(verificationData.expires_at);
      if (new Date() > expiresAt) {
        return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
      }
    }

    // 3. Create Supabase Auth User
    // We use admin.createUser to auto-confirm the email since we just verified it manually.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { name, role }
    });

    if (authError) {
      // Check if error is due to existing user
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const userId = authData.user.id;

    // 4. Create Public Profile in 'users' table
    // ATOMICITY: If this fails, we MUST delete the Auth User.
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: userId, // Link to the Auth User ID
          email,
          name,
          role: userRole,
          company_name: company_name || null,
          gstin: gstin || null,
          mobile: mobile || null,
        }
      ]);

    if (profileError) {
      console.error('Profile Creation Error:', profileError);

      // --- ROLLBACK START ---
      // Delete the Auth User we just created so we don't have a "ghost" user.
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        // Critical Error: Failed to rollback. This requires manual intervention.
        console.error('CRITICAL: Failed to rollback Auth User after Profile failure:', deleteError);
        // Note: In production, you might want to log this to an error tracking service (Sentry, etc.)
      }
      // --- ROLLBACK END ---

      // Return a clean error to the client
      let errorMessage = 'Failed to create user profile';
      if (profileError.code === '23505') { // Postgres unique violation code
         errorMessage = 'A user with these details (Email, GSTIN, etc.) already exists.';
      }

      return NextResponse.json({ error: errorMessage }, { status: 409 }); // 409 Conflict
    }

    // 5. Cleanup: Delete the used OTP
    await supabaseAdmin
      .from('verification_codes')
      .delete()
      .eq('id', verificationData.id);

    return NextResponse.json({ success: true, message: 'Account created successfully!' });

  } catch (error: unknown) {
    console.error('Verify Signup Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
