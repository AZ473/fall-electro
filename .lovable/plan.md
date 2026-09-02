## ElectroMaison Backend — Implementation Plan

This is a large, multi-phase backend build. I'll execute it in ordered milestones so you can review at each checkpoint instead of getting one giant unreviewable change.

### Step 0 — Enable Lovable Cloud
Provisions Postgres, Auth, Storage, and server runtime. Required before anything else.

### Step 1 — Database schema (one migration)
Tables: `profiles`, `user_roles` (+ `app_role` enum + `has_role()` security definer), `categories`, `brands`, `products`, `product_images`, `cart_items`, `orders`, `order_items`, `reviews`, `payments`.
- FKs, indexes on hot columns (category_id, brand_id, user_id, order_id, slug).
- RLS enabled on every table + GRANTs to `authenticated` / `anon` / `service_role` per access pattern.
- Triggers: auto-create profile on signup, auto-update `updated_at`, stock deduction on order paid, low-stock notification flag.
- Storage buckets: `product-images` (public read), `brand-logos` (public read).

### Step 2 — Auth (email/password + Google)
- `/auth` route (login + signup tabs)
- `/reset-password` route
- `useAuth` hook with `onAuthStateChange` listener wired in `__root.tsx`
- Integration-managed `_authenticated` layout for protected routes

### Step 3 — Data layer
- Server functions in `src/lib/*.functions.ts` for products, categories, brands, cart, orders, reviews
- React Query hooks (`useProducts`, `useCart`, `useOrders`, …)
- Wire homepage to real product data

### Step 4 — Storefront pages
- `/products`, `/products/$slug`, `/categories/$slug`
- Cart drawer + `/cart` + `/checkout`
- WhatsApp order button (pre-filled message, mobile-optimized)

### Step 5 — Customer account
- `/account` (profile, orders history, order detail, addresses)

### Step 6 — Admin dashboard (`/_authenticated/admin/*`, role-gated)
- Overview (sales, orders, low-stock)
- Products CRUD with multi-image upload
- Categories + brands CRUD
- Orders management + status updates
- Customers list

### Step 7 — Payments
Wave + Orange Money + card. These require API credentials. Approach:
- Build order + payment record flow now (status `pending`)
- For card payments, I recommend Lovable's built-in Stripe Payments (no API keys, supports XOF via conversion or you can switch to local). I'll ask before enabling.
- Wave / Orange Money: no official Lovable integration — needs your merchant API keys. I'll set up secrets + webhook endpoints when you're ready.

### Step 8 — Inventory & realtime
- Realtime subscription on stock for product pages
- Low-stock email/dashboard alert
- Out-of-stock UI handling

---

### Confirm before I start
1. **Cloud** — OK to enable Lovable Cloud now? (required)
2. **Auth methods** — Email/password + Google sign-in OK as defaults?
3. **Profile fields** — beyond `full_name` + `phone`, anything else (address, city, default delivery zone)?
4. **Scope of first iteration** — should I ship Steps 0–4 in this turn (schema + auth + storefront wired to real data + WhatsApp), then do admin + payments in follow-ups? Or do you want everything in one go (much larger, harder to review)?
