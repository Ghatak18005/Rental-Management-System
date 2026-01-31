-- ============================================
-- ORDER_ITEMS TABLE
-- Links rental orders to product templates
-- This table is needed for proper inventory tracking
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  template_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) 
    REFERENCES public.rental_orders(id) 
    ON DELETE CASCADE,
  CONSTRAINT order_items_template_id_fkey 
    FOREIGN KEY (template_id) 
    REFERENCES public.product_templates(id) 
    ON DELETE RESTRICT
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items
CREATE POLICY "Customers can view their order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rental_orders
    WHERE rental_orders.id = order_items.order_id
    AND rental_orders.customer_id = auth.uid()
  )
);

CREATE POLICY "Vendors can view order items for their products"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.product_templates
    WHERE product_templates.id = order_items.template_id
    AND product_templates.vendor_id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_template_id ON public.order_items(template_id);

-- Update the double booking function to use order_items
CREATE OR REPLACE FUNCTION check_stock_availability_v2(
  p_template_id UUID,
  p_pickup_date TIMESTAMPTZ,
  p_return_date TIMESTAMPTZ,
  p_quantity INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available_quantity INTEGER;
  v_total_quantity INTEGER;
  v_reserved_quantity INTEGER;
BEGIN
  -- Get total quantity on hand
  SELECT quantity_on_hand INTO v_total_quantity
  FROM public.product_templates
  WHERE id = p_template_id;

  IF v_total_quantity IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Calculate reserved quantity during the rental period
  SELECT COALESCE(SUM(oi.quantity), 0) INTO v_reserved_quantity
  FROM public.order_items oi
  INNER JOIN public.rental_orders ro ON ro.id = oi.order_id
  WHERE oi.template_id = p_template_id
    AND ro.status IN ('confirmed', 'draft')
    AND ro.pickup_status IN ('pending', 'picked_up')
    AND (
      -- Order overlaps with requested period
      (ro.pickup_date <= p_return_date AND ro.return_date >= p_pickup_date)
    );

  -- Calculate available quantity
  v_available_quantity := v_total_quantity - v_reserved_quantity;

  -- Check if requested quantity is available
  RETURN v_available_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql;

