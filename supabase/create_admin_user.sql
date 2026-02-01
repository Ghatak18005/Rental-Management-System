-- ============================================
-- CREATE ADMIN USER
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the admin user in Supabase Auth
-- NOTE: You need to do this through Supabase Dashboard > Authentication > Users
-- Click "Add User" and create:
-- Email: admin@gmail.com
-- Password: admin123
-- Email Confirm: YES (check the box)

-- Step 2: After creating the user in Auth, get the user ID and run this:
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from the auth.users table

-- First, let's check if an admin user already exists
SELECT id, email FROM auth.users WHERE email = 'admin@gmail.com';

-- If the user exists, update their profile to ADMIN role
-- Replace the UUID below with the actual user ID from the query above
UPDATE public.users 
SET role = 'ADMIN', 
    full_name = 'System Administrator',
    phone = '0000000000'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');

-- If no user exists in public.users table, insert one
-- Replace 'YOUR_USER_ID_HERE' with the UUID from auth.users
INSERT INTO public.users (id, email, full_name, phone, role, created_at)
SELECT 
    id,
    'admin@gmail.com',
    'System Administrator',
    '0000000000',
    'ADMIN',
    NOW()
FROM auth.users 
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'ADMIN', full_name = 'System Administrator';

-- Verify the admin user
SELECT u.id, u.email, p.role, p.full_name 
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';
