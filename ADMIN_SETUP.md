# Admin User Setup Guide

## Quick Setup (2 Methods)

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://qksgmqmjqifcgckjrfkf.supabase.co
   - Click on "Authentication" → "Users"

2. **Create Admin User**
   - Click "Add User" button
   - Fill in:
     - **Email**: `admin@gmail.com`
     - **Password**: `admin123`
     - **Auto Confirm User**: ✅ Check this box (important!)
   - Click "Create User"

3. **Set Admin Role**
   - Copy the User ID (UUID) that was just created
   - Go to "SQL Editor"
   - Run this query (replace `YOUR_USER_ID` with the copied UUID):
   
   ```sql
   INSERT INTO public.users (id, email, full_name, phone, role, created_at)
   VALUES (
     'YOUR_USER_ID',
     'admin@gmail.com',
     'System Administrator',
     '0000000000',
     'ADMIN',
     NOW()
   )
   ON CONFLICT (id) 
   DO UPDATE SET role = 'ADMIN', full_name = 'System Administrator';
   ```

4. **Login**
   - Go to: http://localhost:3001/login
   - Email: `admin@gmail.com`
   - Password: `admin123`

---

### Method 2: Using SQL Only

1. **Create Auth User via SQL**
   - Go to Supabase SQL Editor
   - Run:
   
   ```sql
   -- This creates the user in auth.users
   -- Note: Supabase may require email confirmation
   SELECT auth.uid();
   ```

2. **Use Supabase Dashboard Instead**
   - SQL-only user creation is limited in Supabase
   - **Recommended**: Use Method 1 above

---

## Verify Admin Access

After creating the admin user:

1. **Check User Table**
   ```sql
   SELECT u.id, u.email, p.role, p.full_name 
   FROM auth.users u
   LEFT JOIN public.users p ON u.id = p.id
   WHERE u.email = 'admin@gmail.com';
   ```
   
   Should show:
   - ✅ Email: admin@gmail.com
   - ✅ Role: ADMIN
   - ✅ Full Name: System Administrator

2. **Test Login**
   - Navigate to: http://localhost:3001/login
   - Enter credentials
   - Should redirect to: http://localhost:3001/admin/dashboard

3. **Test Admin Features**
   - ✅ Can view all orders
   - ✅ Can create new orders
   - ✅ Can access admin routes

---

## Troubleshooting

### "Invalid login credentials"
- **Cause**: User not created in auth.users
- **Solution**: Use Supabase Dashboard to create user (Method 1)

### "Access Denied" or redirected to /dashboard
- **Cause**: User role is not set to ADMIN
- **Solution**: Run the UPDATE query to set role = 'ADMIN'

### Email confirmation required
- **Cause**: "Auto Confirm User" was not checked
- **Solution**: 
  1. Go to Authentication → Users
  2. Find the user
  3. Click "..." → "Confirm Email"

---

## Admin Credentials

**Email**: `admin@gmail.com`  
**Password**: `admin123`

> ⚠️ **Security Warning**: Change these credentials in production!

---

## Alternative: Create Admin During Signup

You can also modify the signup flow to allow creating an admin user:

1. Go to `/signup`
2. Create account with email: `admin@gmail.com`
3. After signup, manually update the role in database:
   ```sql
   UPDATE public.users 
   SET role = 'ADMIN' 
   WHERE email = 'admin@gmail.com';
   ```

This method requires the signup flow to be working correctly.
