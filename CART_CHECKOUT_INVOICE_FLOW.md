# Complete Cart → Checkout → Invoice Flow

## Overview
The complete flow: **Dashboard (Add Item) → Cart (Review) → Checkout (Pay) → Invoice (Confirmation)**

---

## Step 1: Add Item to Cart (Dashboard)

**File:** `src/app/dashboard/page.tsx`

```typescript
const handleQuickAddToCart = async () => {
  // 1. Select rental dates (startDate, endDate)
  // 2. Click "Add to Cart" on product
  // 3. Creates/updates draft order in database
  // 4. Adds item to rental_order_items
}
```

**Database Changes:**
- ✅ Creates `rental_orders` with status='draft' if doesn't exist
- ✅ Adds items to `rental_order_items` table
- ✅ Updates cart icon count in navbar

---

## Step 2: View Cart

**File:** `src/app/dashboard/cart/page.tsx`

**On Page Load:**
1. Fetches user's draft order from `rental_orders` table
2. Fetches all items in that order from `rental_order_items` table
3. Displays items with prices and quantities
4. Pre-fills start/end dates from draft order

**If Cart is Empty:**
- Shows "Your cart is empty" message
- Provides button to browse products
- **Tip:** Click "Refresh" button to reload from database

**Console Logs (for debugging):**
```
✓ Fetching cart for user: [user-id]
✓ Draft order: { id: ..., pickup_date: ..., return_date: ... }
✓ Order items: [{ id, product_name, quantity, price }, ...]
```

---

## Step 3: Checkout (Request Quote)

**File:** `src/app/dashboard/cart/page.tsx`

**User Actions:**
1. Review items in cart
2. Verify/modify start and end dates
3. Click "Request Quote" button

**Behind the Scenes:**
1. Calculates total: `price × quantity × days`
2. Updates draft order:
   - Sets `status` = 'Quotation'
   - Sets `total_amount` = calculated total
   - Updates `pickup_date` and `return_date`
3. Redirects to checkout page with order ID

**Console Logs:**
```
✓ User: [user-id]
✓ Cart items: [...]
✓ Total: [calculated-amount]
✓ Draft order found: { id: ... }
✓ Order updated successfully
```

---

## Step 4: Payment Page

**File:** `src/app/dashboard/checkout/page.tsx`
**URL:** `/dashboard/checkout?orderId=[order-id]`

**Displays:**
- Order summary with all items
- Rental period (pickup and return dates)
- Payment method selection (Card, UPI, Bank)
- Subtotal + Tax (18%) + Insurance (5%)
- **Total Amount Due**

**User Actions:**
1. Review order details
2. Select payment method
3. Click "Pay Now"

**On Payment:**
1. Updates order status from 'Quotation' to 'confirmed'
2. Redirects to invoice page

---

## Step 5: Invoice

**File:** `src/app/dashboard/invoice/[id]/page.tsx`
**URL:** `/dashboard/invoice/[order-id]`

**Displays:**
- Professional invoice document
- Order number and status (CONFIRMED)
- Customer details
- Item breakdown
- Rental period
- Financial summary
- Order total with taxes and insurance

**Available Actions:**
- 🖨️ **Print** - Print invoice to PDF
- 📥 **Download PDF** - Save invoice locally
- 📧 **Send Email** - Email invoice to customer
- ✅ **Done** - Return to dashboard

---

## Troubleshooting

### Cart is Empty?

**Check 1: Did you add items?**
- Go to dashboard
- Select dates
- Click "Add to Cart"
- Should show success message

**Check 2: Is there a draft order?**
- Open browser DevTools (F12)
- Go to Cart page
- Check console for logs:
  ```
  ✓ Fetching cart for user: [id]
  ✓ Draft order: { ... }  // Should NOT be null
  ✓ Order items: [...]    // Should have items
  ```

**Check 3: Refresh cart page**
- Click "Refresh" button on cart page
- Should reload data from database

**Check 4: Database inspection**
- Go to Supabase dashboard
- Check `rental_orders` table
  - Should have row with `status='draft'`
  - Should have matching `customer_id`
- Check `rental_order_items` table
  - Should have rows with matching `order_id`

### Flow Not Working?

**Step 1: Add → Cart**
- ✅ Items appear in cart
- ✅ Cart count shows in navbar
- ❌ If not: Check console logs in dashboard page

**Step 2: Cart → Checkout**
- ✅ Request Quote button works
- ✅ Redirects to checkout page
- ❌ If not: Check console logs in cart page

**Step 3: Checkout → Invoice**
- ✅ Pay Now button works
- ✅ Redirects to invoice page
- ❌ If not: Check console logs in checkout page

---

## Data Flow Diagram

```
Dashboard
  ↓ (Add Item)
  ├→ Creates rental_orders (status='draft')
  └→ Adds rental_order_items
         ↓
      Cart Page
        ↓ (Fetches from database)
        ├→ Gets draft order
        └→ Gets order items
         ↓
    Display in UI
         ↓ (Request Quote)
    Checkout Page
        ↓ (Fetches from database)
        ├→ Gets order (with items)
        └→ Shows payment options
         ↓ (Pay Now)
    Updates status to 'confirmed'
         ↓
    Invoice Page
        ↓ (Displays confirmation)
        ├→ Print/Download/Email
        └→ Done → Return to Dashboard
```

---

## Key Tables

### rental_orders
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| customer_id | UUID | User who created order |
| status | TEXT | 'draft' → 'Quotation' → 'confirmed' |
| total_amount | NUMERIC | Calculated from items |
| pickup_date | TIMESTAMPTZ | Rental start date |
| return_date | TIMESTAMPTZ | Rental end date |

### rental_order_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| order_id | UUID | Links to rental_orders |
| product_id | UUID | Product reference |
| product_name | TEXT | Product name |
| quantity | INTEGER | Quantity ordered |
| price | NUMERIC | Price per day |

---

## Success Indicators

✅ **Working correctly if:**
1. Items added from dashboard appear in cart
2. Cart shows correct date range
3. Cart shows correct total (price × qty × days)
4. Request Quote redirects to checkout with order ID
5. Checkout page loads order details
6. Pay Now redirects to invoice
7. Invoice shows "CONFIRMED" status

---

## Support

**Debug Mode:** Check browser console (F12) for detailed logs at each step.
All pages have `console.log()` statements showing:
- User ID
- Order data
- Item data
- Calculation steps
- API responses
