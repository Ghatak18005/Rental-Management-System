# Cart Empty - Diagnostic Guide

## Immediate Actions

### 1. Click "Refresh" Button
Located at top-right of cart page. This reloads data from database.

### 2. Check Browser Console (F12)

**Look for these logs when cart page loads:**

```
✓ Fetching cart for user: [UUID]
✓ Draft order: { id: "...", status: "draft", ... }
✓ Order items: [{ id: "...", product_name: "...", quantity: 1, price: 0.00 }, ...]
```

**If you see:**
- ❌ `No draft order found` → You haven't added any items yet
- ❌ `Order items: []` → No items in the draft order
- ❌ `Error fetching cart: ...` → Database connection issue

---

## Step-by-Step Fix

### Issue: "No items in cart"

**Verify you added items:**

1. Go to **Dashboard** (`/dashboard`)
2. Select rental dates (start and end dates)
3. Click **"Add to Cart"** button on any product
4. Wait for **"Added to Cart!"** success message
5. Check navbar - cart icon should show count (e.g., 🛒 1)
6. Go back to Cart page (`/dashboard/cart`)
7. Click **"Refresh"** button
8. Items should now appear

**If still empty:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Go to Dashboard page
4. Try adding an item
5. Check console for any error messages
6. Share the error message for debugging

---

### Issue: "Cart shows items but checkout fails"

**When you click "Request Quote":**

1. Check console for logs:
   ```
   ✓ User: [your-user-id]
   ✓ Cart items: [...]
   ✓ Total: [amount]
   ✓ Draft order found: { id: "..." }
   ✓ Order updated successfully
   ```

2. If you see all these ✓ - You should be redirected to checkout page

3. If error:
   - Note the error message
   - Open Supabase dashboard
   - Check `rental_orders` table has your draft order

---

### Issue: "Checkout page shows 'Order Not Found'"

**When redirected to checkout:**

The URL should be: `/dashboard/checkout?orderId=XXXXX`

1. Copy the order ID from URL
2. Open Supabase dashboard
3. Go to `rental_orders` table
4. Search for this order ID
5. Verify:
   - ✅ Order exists
   - ✅ `status` is either 'draft' or 'Quotation'
   - ✅ `customer_id` matches your user ID

If order is missing → Request Quote didn't save properly

---

### Issue: "Dates not saved from cart"

**When cart page loads:**

Expected behavior:
- Start date should pre-fill from `pickup_date`
- End date should pre-fill from `return_date`

To fix:
1. Go to Supabase dashboard
2. Open `rental_orders` table
3. Find your draft order
4. Check `pickup_date` and `return_date` columns
5. If empty/null:
   - Select dates in cart page
   - Click Request Quote
   - Should save dates to order

---

## Database Validation

### Check Rental Orders Table

```sql
SELECT id, customer_id, status, total_amount, pickup_date, return_date 
FROM rental_orders 
WHERE status IN ('draft', 'Quotation')
ORDER BY created_at DESC
LIMIT 5;
```

You should see your orders here.

### Check Rental Order Items Table

```sql
SELECT order_id, product_name, quantity, price 
FROM rental_order_items 
WHERE order_id = '[your-order-id]';
```

You should see all items in that order.

### Check Cart Count Query

```sql
SELECT COUNT(*) FROM rental_order_items 
WHERE order_id IN (
  SELECT id FROM rental_orders 
  WHERE customer_id = '[your-user-id]' 
  AND status = 'draft'
);
```

This is what the navbar uses to show cart count.

---

## Complete Flow Verification

**Test the entire flow:**

1. ✅ **Add to Cart**
   - Dashboard → Select dates → Add item
   - Verify: Success message, navbar shows count

2. ✅ **View Cart**
   - Click cart icon or go to `/dashboard/cart`
   - Verify: Items show with prices, dates pre-filled

3. ✅ **Request Quote**
   - Modify dates if needed
   - Click "Request Quote"
   - Verify: Redirected to checkout with order ID in URL

4. ✅ **Checkout**
   - Page loads order details
   - Select payment method
   - Click "Pay Now"
   - Verify: Redirected to invoice page

5. ✅ **Invoice**
   - Shows order details
   - Status shows "CONFIRMED"
   - Can print/download/email

---

## Still Having Issues?

### Collect Debugging Info

1. **Screenshot of error** - Take screenshot of the error message
2. **Browser console logs** - Press F12, go to Console tab, take screenshot
3. **Order ID** - If available, provide the order ID from URL
4. **Timestamps** - What date/time did you perform the action?

### Send Logs

In browser console:
```javascript
// Run this to collect debug info
console.log('User ID:', (await supabase.auth.getUser()).data.user?.id);
console.log('Draft order:', await supabase.from('rental_orders').select('*').eq('status', 'draft').eq('customer_id', (await supabase.auth.getUser()).data.user.id).maybeSingle());
```

Copy the output and share.

---

## Quick Fixes

| Problem | Fix |
|---------|-----|
| Cart empty | Click "Refresh" button |
| Items not showing | Add items from dashboard first |
| Can't click checkout | Select start AND end dates |
| Checkout fails | Check order exists in database |
| Invoice not loading | Check order ID in URL |
| Payment not processing | Verify total_amount > 0 |

---

## Prevention

- **Always check console logs** - They show exactly what's happening
- **Verify dates selected** - Both start and end dates required
- **Use "Refresh" button** - Reloads from database
- **Clear browser cache** - Sometimes helps: Ctrl+Shift+Del

---

**Last Resort:** Try in a private/incognito browser window to rule out cache issues.
