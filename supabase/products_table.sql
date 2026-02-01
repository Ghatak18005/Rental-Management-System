-- ============================================
-- PRODUCTS TABLE
-- Stores product catalog for rental items
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

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Admins have full access
CREATE POLICY "Admins have full access to products"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

-- Vendors can manage their own products
CREATE POLICY "Vendors can view their own products"
ON public.products
FOR SELECT
USING (
  vendor_id = auth.uid()
);

CREATE POLICY "Vendors can create their own products"
ON public.products
FOR INSERT
WITH CHECK (
  vendor_id = auth.uid()
);

CREATE POLICY "Vendors can update their own products"
ON public.products
FOR UPDATE
USING (
  vendor_id = auth.uid()
)
WITH CHECK (
  vendor_id = auth.uid()
);

CREATE POLICY "Vendors can delete their own products"
ON public.products
FOR DELETE
USING (
  vendor_id = auth.uid()
);

-- Public can view published products
CREATE POLICY "Public can view published products"
ON public.products
FOR SELECT
USING (
  is_published = true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);
