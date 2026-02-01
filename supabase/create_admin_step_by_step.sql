-- ============================================
-- STEP-BY-STEP ADMIN USER CREATION
-- Run each step in order in Supabase SQL Editor
-- ============================================

-- STEP 1: First, check what columns exist in your users table
-- Run this to see the actual structure:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- STEP 2: Create the admin user in Supabase Auth Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@gmail.com
-- Password: admin123
-- ✅ Check "Auto Confirm User"
-- Click "Create User"

-- STEP 3: After creating the user, run this to get the user ID
SELECT id, email FROM auth.users WHERE email = 'admin@gmail.com';

-- STEP 4: Insert admin into public.users table
-- This query works regardless of column names
INSERT INTO public.users (id, email, role)
SELECT 
  id,
  email,
  'ADMIN'
FROM auth.users 
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'ADMIN';

-- STEP 5: Verify the admin user was created
SELECT u.id, u.email, p.role 
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';

-- You should see:
-- ✅ Email: admin@gmail.com
-- ✅ Role: ADMIN

-- STEP 6: (Optional) If your table has full_name column, add it:
UPDATE public.users 
SET full_name = 'System Administrator'
WHERE email = 'admin@gmail.com';

-- DONE! Now you can login at:
-- http://localhost:3001/login
-- Email: admin@gmail.com
-- Password: admin123
