-- ============================================
-- COMPLETE ADMIN SYSTEM SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- PART 1: Create all required tables
-- ============================================

-- 1.1 Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Units',
  vendor_id UUID,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_vendor_id_fkey 
    FOREIGN KEY (vendor_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1.2 Rental Order Items Table
CREATE TABLE IF NOT EXISTS public.rental_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT rental_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT rental_order_items_order_id_fkey 
    FOREIGN KEY (order_id) 
    REFERENCES public.rental_orders(id) 
    ON DELETE CASCADE
);

ALTER TABLE public.rental_order_items ENABLE ROW LEVEL SECURITY;

-- 1.3 Invoice Items Table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_items_invoice_id_fkey 
    FOREIGN KEY (invoice_id) 
    REFERENCES public.invoices(id) 
    ON DELETE CASCADE
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- PART 2: Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_rental_order_items_order_id ON public.rental_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- PART 3: RLS Policies
-- ============================================

-- 3.1 Products Policies
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products"
ON public.products FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
);

DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
ON public.products FOR SELECT
USING (is_published = true);

-- 3.2 Rental Order Items Policies
DROP POLICY IF EXISTS "Admins have full access to rental order items" ON public.rental_order_items;
CREATE POLICY "Admins have full access to rental order items"
ON public.rental_order_items FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
);

DROP POLICY IF EXISTS "Customers can view their rental order items" ON public.rental_order_items;
CREATE POLICY "Customers can view their rental order items"
ON public.rental_order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rental_orders
    WHERE rental_orders.id = rental_order_items.order_id
    AND rental_orders.customer_id = auth.uid()
  )
);

-- 3.3 Invoice Items Policies
DROP POLICY IF EXISTS "Admins have full access to invoice items" ON public.invoice_items;
CREATE POLICY "Admins have full access to invoice items"
ON public.invoice_items FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
);

-- PART 4: Insert Sample Data
-- ============================================

-- 4.1 Sample Products (for testing)
INSERT INTO public.products (name, description, price, unit, is_published) VALUES
('Computer', 'Desktop Computer for Rent', 20000, 'Units', true),
('Laptop', 'High-performance Laptop', 15000, 'Units', true),
('Projector', 'HD Projector', 5000, 'Units', true),
('Camera', 'Professional DSLR Camera', 8000, 'Units', true),
('Microphone', 'Studio Quality Microphone', 2000, 'Units', true),
('Printer', 'Laser Printer', 3000, 'Units', true),
('Scanner', 'Document Scanner', 2500, 'Units', true),
('Monitor', '27-inch 4K Monitor', 10000, 'Units', true)
ON CONFLICT DO NOTHING;

-- PART 5: Verification
-- ============================================

-- Verify tables exist
SELECT 
  'products' as table_name, 
  COUNT(*) as row_count 
FROM public.products
UNION ALL
SELECT 
  'rental_order_items', 
  COUNT(*) 
FROM public.rental_order_items
UNION ALL
SELECT 
  'invoice_items', 
  COUNT(*) 
FROM public.invoice_items;

-- Verify admin user
SELECT u.id, u.email, p.role, p.name 
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';

-- SUCCESS! You can now:
-- 1. Login at http://localhost:3001/login
-- 2. Email: admin@gmail.com
-- 3. Password: admin123
-- 4. Create new rental orders
-- 5. View all orders in dashboard
