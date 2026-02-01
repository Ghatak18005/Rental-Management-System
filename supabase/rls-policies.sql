-- ============================================
-- RLS POLICIES FOR VENDOR PORTAL
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.product_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCT_TEMPLATES POLICIES
-- ============================================

-- Vendors can SELECT their own products
CREATE POLICY "Vendors can view their own products"
ON public.product_templates
FOR SELECT
USING (
  vendor_id = auth.uid()
);

-- Vendors can INSERT their own products
CREATE POLICY "Vendors can create their own products"
ON public.product_templates
FOR INSERT
WITH CHECK (
  vendor_id = auth.uid()
);

-- Vendors can UPDATE their own products
CREATE POLICY "Vendors can update their own products"
ON public.product_templates
FOR UPDATE
USING (
  vendor_id = auth.uid()
)
WITH CHECK (
  vendor_id = auth.uid()
);

-- Vendors can DELETE their own products
CREATE POLICY "Vendors can delete their own products"
ON public.product_templates
FOR DELETE
USING (
  vendor_id = auth.uid()
);

-- Customers and Admins can view published products
CREATE POLICY "Public can view published products"
ON public.product_templates
FOR SELECT
USING (
  is_published = true
);

-- ============================================
-- RENTAL_PRICING POLICIES
-- ============================================

-- Vendors can manage pricing for their products
CREATE POLICY "Vendors can manage pricing for their products"
ON public.rental_pricing
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.product_templates
    WHERE product_templates.id = rental_pricing.template_id
    AND product_templates.vendor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.product_templates
    WHERE product_templates.id = rental_pricing.template_id
    AND product_templates.vendor_id = auth.uid()
  )
);

-- Public can view pricing for published products
CREATE POLICY "Public can view pricing for published products"
ON public.rental_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.product_templates
    WHERE product_templates.id = rental_pricing.template_id
    AND product_templates.is_published = true
  )
);

-- ============================================
-- RENTAL_ORDERS POLICIES
-- ============================================

-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders"
ON public.rental_orders
FOR SELECT
USING (
  customer_id = auth.uid()
);

-- Customers can create orders
CREATE POLICY "Customers can create orders"
ON public.rental_orders
FOR INSERT
WITH CHECK (
  customer_id = auth.uid()
);

-- Customers can update their own draft orders
CREATE POLICY "Customers can update their own draft orders"
ON public.rental_orders
FOR UPDATE
USING (
  customer_id = auth.uid() AND status = 'draft'
)
WITH CHECK (
  customer_id = auth.uid()
);

-- Vendors can view orders for their products
-- Note: This requires an order_items table to link orders to products
-- For now, we'll allow vendors to view all orders (you may want to restrict this)
CREATE POLICY "Vendors can view orders"
ON public.rental_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'VENDOR'
  )
);

-- Vendors can update order status (pickup/return)
CREATE POLICY "Vendors can update order status"
ON public.rental_orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'VENDOR'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'VENDOR'
  )
);

-- Admins can do everything
CREATE POLICY "Admins have full access to orders"
ON public.rental_orders
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

-- ============================================
-- USERS TABLE POLICIES (if needed)
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (
  id = auth.uid()
);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
);

-- ============================================
-- ADMIN POLICIES FOR ADDITIONAL TABLES
-- ============================================

-- Admins have full access to products
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

-- Admins have full access to invoices
CREATE POLICY "Admins have full access to invoices"
ON public.invoices
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

