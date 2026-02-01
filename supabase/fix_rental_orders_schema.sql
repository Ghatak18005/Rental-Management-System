-- ============================================
-- FIX RENTAL_ORDER_ITEMS TABLE
-- Remove product_id constraint and use product_name only
-- ============================================

-- Step 1: Check current structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rental_order_items'
ORDER BY ordinal_position;

-- Step 2: Drop the product_id column if it exists (it's causing issues)
ALTER TABLE public.rental_order_items 
DROP COLUMN IF EXISTS product_id CASCADE;

-- Step 3: Ensure product_name column exists and is NOT NULL
ALTER TABLE public.rental_order_items 
ALTER COLUMN product_name SET NOT NULL;

-- Step 4: Add rental_start and rental_end to rental_orders
ALTER TABLE public.rental_orders 
ADD COLUMN IF NOT EXISTS rental_start DATE;

ALTER TABLE public.rental_orders 
ADD COLUMN IF NOT EXISTS rental_end DATE;

ALTER TABLE public.rental_orders 
ADD COLUMN IF NOT EXISTS invoice_address TEXT;

ALTER TABLE public.rental_orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Step 5: Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rental_order_items'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rental_orders'
ORDER BY ordinal_position;

-- SUCCESS! Now orders will save correctly without product_id errors
