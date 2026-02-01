-- ============================================
-- RENTAL_ORDER_ITEMS TABLE
-- Stores line items for rental orders
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

-- Enable RLS
ALTER TABLE public.rental_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Admins have full access
CREATE POLICY "Admins have full access to rental order items"
ON public.rental_order_items
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

-- Customers can view their order items
CREATE POLICY "Customers can view their rental order items"
ON public.rental_order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rental_orders
    WHERE rental_orders.id = rental_order_items.order_id
    AND rental_orders.customer_id = auth.uid()
  )
);

-- Vendors can view order items (for their products)
CREATE POLICY "Vendors can view rental order items"
ON public.rental_order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'VENDOR'
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_rental_order_items_order_id ON public.rental_order_items(order_id);
