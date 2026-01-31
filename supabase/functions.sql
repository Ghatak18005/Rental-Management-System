-- ============================================
-- POSTGRESQL FUNCTIONS FOR RENTAL SYSTEM
-- ============================================

-- ============================================
-- FUNCTION: Check Stock Availability
-- Prevents double booking by checking if stock is available
-- ============================================

CREATE OR REPLACE FUNCTION check_stock_availability(
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
  -- This checks for overlapping rental periods
  SELECT COALESCE(SUM(1), 0) INTO v_reserved_quantity
  FROM public.rental_orders
  WHERE status IN ('confirmed', 'draft')
    AND pickup_status IN ('pending', 'picked_up')
    AND (
      -- Order overlaps with requested period
      (pickup_date <= p_return_date AND return_date >= p_pickup_date)
    )
    -- Note: This assumes order_items table exists to link orders to products
    -- For now, we'll need to add a product_id to rental_orders or create order_items
    -- AND EXISTS (
    --   SELECT 1 FROM public.order_items
    --   WHERE order_items.order_id = rental_orders.id
    --   AND order_items.template_id = p_template_id
    -- )
  ;

  -- Calculate available quantity
  v_available_quantity := v_total_quantity - v_reserved_quantity;

  -- Check if requested quantity is available
  RETURN v_available_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Prevent Double Booking (Trigger Function)
-- ============================================

CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_template_id UUID;
  v_is_available BOOLEAN;
BEGIN
  -- Get template_id from order
  -- Note: This requires an order_items table or product_id in rental_orders
  -- For now, we'll create a simplified version
  
  -- If status is being changed to 'confirmed', check availability
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status = 'draft') THEN
    -- Check if stock is available
    -- This is a placeholder - you'll need to implement based on your schema
    -- v_is_available := check_stock_availability(
    --   v_template_id,
    --   NEW.pickup_date,
    --   NEW.return_date,
    --   1
    -- );
    
    -- IF NOT v_is_available THEN
    --   RAISE EXCEPTION 'Stock not available for the requested rental period';
    -- END IF;
    
    -- For now, we'll just log a warning
    RAISE NOTICE 'Order confirmed - stock availability check should be implemented';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Apply Double Booking Prevention
-- ============================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS check_double_booking ON public.rental_orders;

-- Create trigger
CREATE TRIGGER check_double_booking
BEFORE INSERT OR UPDATE ON public.rental_orders
FOR EACH ROW
EXECUTE FUNCTION prevent_double_booking();

-- ============================================
-- FUNCTION: Calculate Late Return Fees
-- ============================================

CREATE OR REPLACE FUNCTION calculate_late_fees(
  p_order_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_order RECORD;
  v_late_fee_per_hour NUMERIC;
  v_hours_late INTEGER;
  v_total_late_fee NUMERIC;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM public.rental_orders
  WHERE id = p_order_id;

  IF v_order.return_date IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate hours late
  v_hours_late := EXTRACT(EPOCH FROM (NOW() - v_order.return_date)) / 3600;

  IF v_hours_late <= 0 THEN
    RETURN 0;
  END IF;

  -- Get late fee from pricing
  -- Note: This requires order_items to get template_id
  -- For now, using a default
  v_late_fee_per_hour := 100; -- Default ₹100 per hour

  -- Calculate total late fee
  v_total_late_fee := v_hours_late * v_late_fee_per_hour;

  RETURN v_total_late_fee;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Restore Stock on Return
-- ============================================

CREATE OR REPLACE FUNCTION restore_stock_on_return()
RETURNS TRIGGER AS $$
DECLARE
  v_template_id UUID;
BEGIN
  -- When order status changes to 'returned', restore stock
  IF NEW.pickup_status = 'returned' AND OLD.pickup_status != 'returned' THEN
    -- Get template_id from order_items
    -- For now, this is a placeholder
    -- UPDATE public.product_templates
    -- SET quantity_on_hand = quantity_on_hand + 1
    -- WHERE id = v_template_id;
    
    RAISE NOTICE 'Stock restoration should be implemented with order_items table';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Restore Stock on Return
-- ============================================

DROP TRIGGER IF EXISTS restore_stock_trigger ON public.rental_orders;

CREATE TRIGGER restore_stock_trigger
AFTER UPDATE ON public.rental_orders
FOR EACH ROW
WHEN (NEW.pickup_status = 'returned' AND OLD.pickup_status != 'returned')
EXECUTE FUNCTION restore_stock_on_return();

-- ============================================
-- FUNCTION: Update Order Status to Late
-- ============================================

CREATE OR REPLACE FUNCTION update_late_orders()
RETURNS void AS $$
BEGIN
  -- Update orders that are past return date and still with customer
  UPDATE public.rental_orders
  SET pickup_status = 'late'
  WHERE pickup_status = 'picked_up'
    AND return_date < NOW()
    AND return_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHEDULED JOB (using pg_cron if available)
-- ============================================

-- Uncomment if you have pg_cron extension installed
-- SELECT cron.schedule(
--   'update-late-orders',
--   '*/15 * * * *', -- Every 15 minutes
--   $$SELECT update_late_orders();$$
-- );

