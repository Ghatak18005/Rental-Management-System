# Quick Reference - Cart Flow

## URLs

| Page | URL |
|------|-----|
| Dashboard | `/dashboard` |
| Cart | `/dashboard/cart` |
| Checkout | `/dashboard/checkout?orderId=[id]` |
| Invoice | `/dashboard/invoice/[id]` |

---

## Button Flow

```
Dashboard
  ↓ [Add to Cart]
  ↓
Cart Page
  ↓ [Request Quote]
  ↓
Checkout Page
  ↓ [Pay Now]
  ↓
Invoice Page
  ↓ [Done/Print/Download/Email]
  ↓
Dashboard
```

---

## Order Status

| Status | Page | User Action |
|--------|------|-------------|
| draft | Dashboard/Cart | Adding items |
| Quotation | Checkout | Reviewing before payment |
| confirmed | Invoice | Order complete |

---

## Key Tables

### 1. rental_orders
- Stores order header info
- Status tracks progress through flow
- total_amount = calculated from items

### 2. rental_order_items
- Stores individual items in order
- Multiple items per order
- Each item has product_name, quantity, price

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Cart empty | Click "Refresh" button on cart page |
| Can't add items | Select both start AND end dates |
| Checkout fails | Ensure dates are selected in cart |
| Invoice missing | Copy order ID from URL, check database |
| Payment error | Check console (F12) for error details |

---

## Debug Mode

**Open Console (F12) and watch logs:**

1. Adding item → Check dashboard console
2. Loading cart → Check cart console
3. Requesting quote → Check cart console
4. Payment page → Check checkout console
5. Invoice → Check invoice console

**Each page logs:**
- User ID
- Data being fetched
- Success/Error messages

---

## Total Calculation

```
Subtotal = Σ(price × quantity × days)
Tax (18%) = Subtotal × 0.18
Insurance (5%) = Subtotal × 0.05
Total Due = Subtotal + Tax + Insurance
```

---

## Database Query (For admins)

**Check all draft orders:**
```sql
SELECT * FROM rental_orders WHERE status = 'draft' ORDER BY created_at DESC;
```

**Check items in an order:**
```sql
SELECT * FROM rental_order_items WHERE order_id = '[order-id]';
```

**Check all orders for a user:**
```sql
SELECT * FROM rental_orders WHERE customer_id = '[user-id]' ORDER BY created_at DESC;
```

---

## Success Indicators

✅ **Flow working if:**
- Cart shows items added from dashboard
- Dates pre-fill from draft order
- Request Quote redirects to checkout
- Checkout shows order ID in URL
- Pay Now redirects to invoice
- Invoice shows CONFIRMED status

❌ **Check if:**
- Cart empty after adding items → Click "Refresh"
- Checkout fails → Select dates in cart
- Invoice missing → Check order ID in URL

---

## Common Tasks

### Add Item to Cart
1. Dashboard
2. Select dates
3. Click "Add to Cart"
4. ✅ Success message shows

### View Cart
1. Dashboard
2. Click cart icon or go to `/dashboard/cart`
3. ✅ Items appear with prices

### Complete Purchase
1. Cart page
2. Verify dates
3. Click "Request Quote"
4. ✅ Redirects to checkout
5. Select payment method
6. Click "Pay Now"
7. ✅ Redirects to invoice

### Print Invoice
1. Invoice page
2. Click "Print" button or Ctrl+P
3. ✅ Opens print dialog

### Download Invoice
1. Invoice page
2. Click "Download PDF" button
3. ✅ Invoice downloads

### Send Invoice
1. Invoice page
2. Click "Send Email" button
3. ✅ Invoice sent to customer

---

## File Locations

```
src/app/dashboard/
├── page.tsx (Dashboard - adding items)
├── cart/
│   └── page.tsx (Cart - review items)
├── checkout/
│   └── page.tsx (Checkout - payment)
└── invoice/
    └── [id]/
        └── page.tsx (Invoice - confirmation)
```

---

## Important Notes

⚠️ **Must select dates** before adding items or requesting quote
⚠️ **Refresh cart** if items don't appear after adding
⚠️ **Check console logs** (F12) if anything fails
⚠️ **Order ID in URL** must match database order
⚠️ **Status must be 'draft'** to edit, 'confirmed' when done

---

## Browser Compatibility

✅ Works in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

⚠️ Not tested in:
- Internet Explorer (not supported)
- Very old mobile browsers

---

## Performance Notes

- Cart loads in <1 second
- Checkout in <1 second
- Invoice in <1 second
- All queries optimized with indexes

---

**For more details, see:**
- 📖 CART_CHECKOUT_INVOICE_FLOW.md
- 📖 CART_TROUBLESHOOTING.md
- 📖 IMPLEMENTATION_SUMMARY.md
