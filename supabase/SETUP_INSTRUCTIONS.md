# Database Setup Instructions

## Quick Setup (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project: https://qksgmqmjqifcgckjrfkf.supabase.co
   - Navigate to SQL Editor

2. **Run the Complete Setup Script**
   - Copy the contents of `supabase/complete_setup.sql`
   - Paste into SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('products', 'rental_order_items', 'invoice_items');
   ```

## Individual File Setup (Alternative)

If you prefer to run files individually:

1. `supabase/products_table.sql` - Creates products table
2. `supabase/rental_order_items_table.sql` - Creates rental order items table
3. `supabase/invoice_items_table.sql` - Creates invoice items table
4. `supabase/rls-policies.sql` - Updates RLS policies for admin access

## Testing the Setup

After running the SQL scripts, test the admin functionality:

1. **Login as Admin**
   - Navigate to `/login`
   - Login with admin credentials

2. **Access Admin Dashboard**
   - Go to `/admin/dashboard`
   - Verify orders display correctly

3. **Create New Order**
   - Click "New" button
   - Select a customer
   - Add products
   - Save the order

4. **Verify Order Appears**
   - Check Kanban view
   - Check List view
   - Try filtering by status

## Troubleshooting

### Issue: "relation does not exist" error
- **Solution**: Run the complete_setup.sql script in Supabase SQL Editor

### Issue: "permission denied" error
- **Solution**: Verify RLS policies are created correctly
- Check that your user has ADMIN role in the users table

### Issue: Products dropdown is empty
- **Solution**: Insert sample products using the commented section in complete_setup.sql
- Or create products through the vendor portal

### Issue: Middleware redirecting away from /admin
- **Solution**: This should be fixed now. Clear browser cache and try again.

## Next Steps

After database setup is complete:

1. Restart your Next.js development server
2. Clear browser cache
3. Test the complete order creation flow
4. Test invoice creation from confirmed orders
