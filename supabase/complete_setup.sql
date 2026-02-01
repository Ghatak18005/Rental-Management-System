-- ============================================
-- COMPLETE DATABASE SETUP FOR ADMIN SYSTEM
-- Run this script in Supabase SQL Editor
-- ============================================

-- Step 1: Create Products Table
-- ============================================
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
) TABLESPACE pg_default;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Step 2: Create Rental Order Items Table
-- ============================================
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
) TABLESPACE pg_default;

ALTER TABLE public.rental_order_items ENABLE ROW LEVEL SECURITY;

-- Step 3: Create Invoice Items Table
-- ============================================
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
) TABLESPACE pg_default;

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Step 4: Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_rental_order_items_order_id ON public.rental_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- Step 5: RLS Policies for Products
-- ============================================
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products"
ON public.products FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
);

DROP POLICY IF EXISTS "Vendors can view their own products" ON public.products;
CREATE POLICY "Vendors can view their own products"
ON public.products FOR SELECT
USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can create their own products" ON public.products;
CREATE POLICY "Vendors can create their own products"
ON public.products FOR INSERT
WITH CHECK (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
CREATE POLICY "Vendors can update their own products"
ON public.products FOR UPDATE
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can delete their own products" ON public.products;
CREATE POLICY "Vendors can delete their own products"
ON public.products FOR DELETE
USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
ON public.products FOR SELECT
USING (is_published = true);

-- Step 6: RLS Policies for Rental Order Items
-- ============================================
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

DROP POLICY IF EXISTS "Vendors can view rental order items" ON public.rental_order_items;
CREATE POLICY "Vendors can view rental order items"
ON public.rental_order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'VENDOR')
);

-- Step 7: RLS Policies for Invoice Items
-- ============================================
DROP POLICY IF EXISTS "Admins have full access to invoice items" ON public.invoice_items;
CREATE POLICY "Admins have full access to invoice items"
ON public.invoice_items FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
);

DROP POLICY IF EXISTS "Customers can view their invoice items" ON public.invoice_items;
CREATE POLICY "Customers can view their invoice items"
ON public.invoice_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.customer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Vendors can view invoice items" ON public.invoice_items;
CREATE POLICY "Vendors can view invoice items"
ON public.invoice_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'VENDOR')
);

-- Step 8: Insert Sample Products (Optional - for testing)
-- ============================================
-- Uncomment to add sample products
/*
INSERT INTO public.products (name, description, price, unit, is_published) VALUES
('Computer', 'Desktop Computer for Rent', 20000, 'Units', true),
('Laptop', 'High-performance Laptop', 15000, 'Units', true),
('Projector', 'HD Projector', 5000, 'Units', true),
('Camera', 'Professional DSLR Camera', 8000, 'Units', true),
('Microphone', 'Studio Quality Microphone', 2000, 'Units', true)
ON CONFLICT DO NOTHING;
*/

-- Verification Queries
-- ============================================
-- Run these to verify setup:
-- SELECT * FROM public.products;
-- SELECT * FROM public.rental_order_items;
-- SELECT * FROM public.invoice_items;
