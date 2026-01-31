# Vendor Dashboard - Complete Implementation Guide

## 📁 Folder Structure

```
src/
├── app/
│   └── (vendor)/                    # Route group for vendor pages
│       ├── layout.tsx               # Sidebar layout with navigation
│       ├── dashboard/
│       │   └── page.tsx             # Global Insights dashboard
│       ├── inventory/
│       │   └── page.tsx             # Product listing & management
│       ├── orders/
│       │   └── page.tsx             # Order lifecycle management
│       └── invoicing/
│           └── page.tsx             # Invoice creation & management
│
├── components/
│   └── vendor/
│       ├── ProductForm.tsx          # Multi-step product add/edit form
│       ├── OrderActions.tsx         # Pickup/Return action buttons
│       └── InvoiceForm.tsx         # Invoice creation form
│
├── app/api/vendor/
│   └── generate-document/
│       └── route.ts                 # PDF document generation API
│
└── supabase/
    ├── rls-policies.sql            # Row Level Security policies
    ├── functions.sql                # PostgreSQL functions & triggers
    ├── order_items_table.sql        # Order items table schema
    └── invoices_table.sql           # Invoices table schema
```

## 🚀 Features Implemented

### 1. Vendor Portal UI
- ✅ Sidebar-driven dashboard layout
- ✅ Responsive mobile navigation
- ✅ Role-based access control (VENDOR only)
- ✅ User profile display in sidebar

### 2. Global Insights Dashboard
- ✅ Total Revenue calculation
- ✅ Most Rented Products list
- ✅ Late Return Alerts with days overdue
- ✅ Real-time data fetching from Supabase

### 3. Advanced Inventory Management
- ✅ Product listing table with search
- ✅ Multi-step add/edit form:
  - Basic product details (Name, SKU, Description, Cost Price, Stock)
  - Publish toggle
  - Dynamic Pricing section (Hourly, Daily, Weekly, Custom)
  - Late fee configuration
  - Attributes (Brand, Color)
- ✅ Publish/Unpublish toggle
- ✅ Delete products

### 4. Order & Lifecycle Management
- ✅ Order listing with filters (All, Quotations, Confirmed)
- ✅ Status badges (Draft/Quotation, Confirmed, Cancelled)
- ✅ Pickup Status tracking (Pending, With Customer, Returned, Late)
- ✅ Action buttons:
  - **Pickup**: Generate pickup document, update status to "With Customer"
  - **Return**: Generate return document, restore stock, calculate late fees
- ✅ Date display (Pickup & Return dates)

### 5. Invoicing
- ✅ Invoice creation from confirmed orders
- ✅ Automatic GST calculation (18%)
- ✅ Support for Security Deposits
- ✅ Partial Payment handling
- ✅ Invoice listing table
- ✅ GSTIN display from vendor profile

## 🔒 Security (RLS Policies)

All tables have Row Level Security enabled:

### Product Templates
- Vendors can only SELECT/INSERT/UPDATE/DELETE their own products
- Public can view published products

### Rental Pricing
- Vendors can manage pricing for their products
- Public can view pricing for published products

### Rental Orders
- Customers can view/create/update their own orders
- Vendors can view orders and update status
- Admins have full access

## 🛡️ Double Booking Prevention

### PostgreSQL Functions
1. **`check_stock_availability()`**: Checks if stock is available for a rental period
2. **`prevent_double_booking()`**: Trigger function that prevents confirming orders when stock is unavailable
3. **`calculate_late_fees()`**: Calculates late return fees based on hours overdue
4. **`restore_stock_on_return()`**: Automatically restores stock when order is returned

### Implementation Notes
- Requires `order_items` table to link orders to products
- Stock availability is checked before order confirmation
- Overlapping rental periods are detected and prevented

## 📊 Database Schema Additions

### Order Items Table
```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES rental_orders(id),
  template_id UUID REFERENCES product_templates(id),
  quantity INTEGER,
  unit_price NUMERIC(10, 2),
  subtotal NUMERIC(10, 2)
);
```

### Invoices Table
```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES rental_orders(id),
  vendor_id UUID REFERENCES users(id),
  invoice_number TEXT UNIQUE,
  subtotal NUMERIC(10, 2),
  gst_amount NUMERIC(10, 2),
  total_amount NUMERIC(10, 2),
  status TEXT DEFAULT 'draft'
);
```

## 🔧 Setup Instructions

### 1. Run SQL Scripts
Execute these SQL files in your Supabase SQL Editor in order:
1. `supabase/order_items_table.sql`
2. `supabase/invoices_table.sql`
3. `supabase/rls-policies.sql`
4. `supabase/functions.sql`

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Test the Implementation
1. Login as a vendor user
2. Navigate to `/vendor/dashboard`
3. Test each section:
   - Add a product in Inventory
   - Create pricing rules
   - View orders
   - Generate invoices

## 📝 Important Notes

1. **Order Items Table**: The current implementation assumes an `order_items` table exists to link orders to products. If you don't have this, you'll need to:
   - Create the table using `order_items_table.sql`
   - Update order creation logic to include order items

2. **PDF Generation**: The document generation API currently returns JSON. For production, integrate a PDF library like:
   - `pdfkit`
   - `puppeteer`
   - `@react-pdf/renderer`

3. **Late Fee Calculation**: The late fee calculation uses a default rate. Update the `calculate_late_fees()` function to fetch actual rates from `rental_pricing.late_fee_per_hour`.

4. **Stock Restoration**: The stock restoration trigger is a placeholder. Implement it based on your `order_items` structure.

## 🎨 UI Components

All components use:
- **Lucide React** icons
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Dark mode** support

## 🔄 Next Steps

1. Implement actual PDF generation for pickup/return documents
2. Add order_items creation when orders are created
3. Implement real-time updates using Supabase subscriptions
4. Add email notifications for order status changes
5. Create vendor analytics dashboard with charts
6. Add product image upload functionality

## 📞 Support

For issues or questions, refer to:
- Supabase RLS documentation
- Next.js App Router documentation
- PostgreSQL trigger documentation

