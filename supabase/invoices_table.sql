-- ============================================
-- INVOICES TABLE
-- For managing invoices created from rental orders
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  subtotal NUMERIC(10, 2) NOT NULL,
  gst_amount NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  security_deposit NUMERIC(10, 2) DEFAULT 0.00,
  partial_payment NUMERIC(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_order_id_fkey 
    FOREIGN KEY (order_id) 
    REFERENCES public.rental_orders(id) 
    ON DELETE RESTRICT,
  CONSTRAINT invoices_vendor_id_fkey 
    FOREIGN KEY (vendor_id) 
    REFERENCES public.users(id) 
    ON DELETE RESTRICT
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Vendors can manage their own invoices"
ON public.invoices
FOR ALL
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Customers can view invoices for their orders"
ON public.invoices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rental_orders
    WHERE rental_orders.id = invoices.order_id
    AND rental_orders.customer_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON public.invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_timestamp
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoices_updated_at();

