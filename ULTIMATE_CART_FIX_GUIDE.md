# Cart Issue - Ultimate Diagnostic Guide

## 🆘 Quick Fix (Try First)

1. Go to **Dashboard** (`/dashboard`)
2. **Open browser console** (F12 → Console tab)
3. Select dates and add an item
4. **Watch console logs** - you'll see emoji logs like:
   ```
   🛒 Adding to cart - User: [id]
   🛒 Product: [id] [name]
   ✅ Item added successfully
   ```

5. Go to **Cart** page (`/dashboard/cart`)
6. Click **🔄 Refresh** button (not browser refresh)
7. **Watch console** - you'll see:
   ```
   🔍 Fetching cart for user: [id]
   📦 Draft order search result: { id, ... }
   📝 Items query result: [items...]
   ✅ Found X items in cart
   ```

If items appear ✅ - **Problem solved!**

If cart still empty ❌ - Continue to Step 2

---

## 🔧 Diagnostic Tool (If issue persists)

### Step 1: Run Diagnostics
Go to: **`/dashboard/diagnostics`**

This page will check:
- ✅ Are you logged in?
- ✅ Does rental_orders table exist?
- ✅ Are there draft orders?
- ✅ Are items in draft order?
- ✅ Is database connection working?

### Step 2: Read the Results

Each check will show:
- 🟢 **Green ✅** = Working correctly
- 🔴 **Red ❌** = Problem found
- 🔵 **Blue ⏳** = Loading

### Step 3: Understand the Results

**If you see:**

```
✅ Authentication: Logged in as user@example.com
✅ Checking rental_orders table: Found 3 orders
✅ Checking draft orders: Found draft order: abc-123
✅ Checking rental_order_items table: Found 2 items
✅ Database connectivity test: Insert test successful
```

→ **Your system is working!** Try again:
1. Add item from dashboard
2. Go to cart
3. Click 🔄 Refresh
4. Should appear now

---

## 🐛 Debugging by Console Logs

### When Adding Item (Dashboard Page)

**Expected logs:**
```
🛒 Adding to cart - User: [your-user-id]
🛒 Product: [product-id] [product-name]
🛒 Dates: 2026-02-01 to 2026-02-05
✅ Item added successfully
```

**If you see error instead:**
```
❌ Add to cart error: [error message]
```

**Possible causes:**
- `Cannot read property 'id' of undefined` → No product selected
- `ForeignKeyViolation` → rental_orders table issue
- `relation "rental_order_items" does not exist` → Table not created in database

---

### When Loading Cart (Cart Page)

**Expected logs:**
```
🔍 Fetching cart for user: [user-id]
📦 Draft order search result: { id: "abc-123", ... }
✅ Found draft order: abc-123
🔍 Querying rental_order_items for order_id: abc-123
📝 Items query result: [
  { id: "...", product_name: "Product", quantity: 1, price: 100 },
  ...
]
✅ Found 2 items in cart
```

**If you see:**
```
⚠️ No draft order found - cart is empty
```

→ **This means:** You haven't added any items from dashboard

**If you see:**
```
ℹ️ Draft order exists but has no items
```

→ **This means:** Items weren't saved when you added them

**If you see:**
```
❌ Error fetching cart: [error]
```

→ **Something is wrong with database connection**

---

## 🔄 Step-by-Step Workaround

If cart is still empty, try this:

### 1. Verify You're Logged In
- Check navbar - should show your name/email
- If not, login again

### 2. Add Item with Console Watch
- Open DevTools (F12)
- Go to Dashboard
- **Select dates** (both start and end)
- Click "Add to Cart"
- **Watch console for logs**
- Copy any error messages

### 3. Check Cart Page with Console Watch
- Go to Cart page
- **Console should show logs** (not errors)
- If empty, click 🔄 Refresh button
- **Watch console again**

### 4. Check Database Directly (Advanced)
If console shows no errors but cart still empty:

1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Run:
```sql
SELECT * FROM rental_orders 
WHERE customer_id = '[YOUR_USER_ID]' 
AND status = 'draft';
```
4. If result is empty = draft order never created
5. If result has data = order exists, check items table:
```sql
SELECT * FROM rental_order_items 
WHERE order_id = '[ORDER_ID_FROM_ABOVE]';
```

---

## 📋 Checklist for Support

If you need to report the issue, collect:

- [ ] Screenshot of console logs (F12 → Console)
- [ ] Error message (exact text)
- [ ] URL of page where problem occurs
- [ ] Steps to reproduce:
  - [ ] Select dates
  - [ ] Click "Add to Cart"
  - [ ] Notification appears?
  - [ ] Go to Cart page
  - [ ] Items appear?

---

## ✅ What Should Happen

### Correct Workflow:

1. **Dashboard**
   - ✅ Select dates
   - ✅ Click "Add to Cart"
   - ✅ See success message: "Added to Cart!"
   - ✅ Navbar shows cart count

2. **Cart Page**
   - ✅ Load page
   - ✅ Items appear immediately
   - ✅ Dates pre-filled
   - ✅ Total calculated

3. **Checkout**
   - ✅ Click "Request Quote"
   - ✅ Redirect to checkout with order ID
   - ✅ Order details load

4. **Invoice**
   - ✅ Click "Pay Now"
   - ✅ Redirect to invoice
   - ✅ Shows "CONFIRMED"

If any step fails → Check console logs

---

## 🎯 Common Issues & Solutions

| Symptom | Check | Solution |
|---------|-------|----------|
| Cart empty | Console logs show no errors | Click 🔄 Refresh button |
| Error: "No draft order found" | Dashboard console | Add item first |
| Error: "ForeignKeyViolation" | Supabase logs | Table schema issue |
| Error: "relation does not exist" | Supabase dashboard | Run migration SQL |
| "Added to Cart" but cart empty | Browser dev tools | Refresh cart page |
| Can't select dates | Product page | Scroll to see date inputs |
| Cart count wrong | Navbar | Refresh page |

---

## 🚀 How to Report Issue

If problem persists after trying above:

**Provide to support:**
1. **Console output** - What exact error?
2. **Steps to reproduce** - What did you do?
3. **Database state** - Run diagnostics and share results
4. **Browser** - Chrome/Firefox/Safari? Version?
5. **Timestamps** - When did this happen?

---

## 📞 Emergency Bypass

If you need cart working immediately:

**Option 1: Use Diagnostics Page**
- Go to `/dashboard/diagnostics`
- Identifies exact problem
- Can fix if permission issue

**Option 2: Check Supabase Status**
- Go to supabase.com
- Check if database is up
- Sometimes maintenance causes issues

**Option 3: Clear Browser Cache**
- Ctrl+Shift+Delete (Windows)
- Cmd+Shift+Delete (Mac)
- Clear all browser data
- Refresh page

---

**Remember:** Check F12 console first - it shows exactly what's happening!
