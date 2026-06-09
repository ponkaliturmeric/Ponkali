# Ponkali Masalas — E-Commerce Website

Premium Indian spice brand from Erode, Tamil Nadu. Built with Next.js 14, Tailwind CSS, and Supabase (PostgreSQL).

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## SEO Configuration

Canonical URLs, the sitemap, robots.txt, Open Graph tags and JSON-LD all use a
single base URL. The production domain is **https://ponkali.in** (also the
default in [`lib/seo.ts`](lib/seo.ts)). Override per-environment if needed
(Vercel → Project → Settings → Environment Variables, or local `.env`):

```bash
NEXT_PUBLIC_SITE_URL=https://ponkali.in
```

Also update `TWITTER_HANDLE` and `SOCIAL_PROFILES` in [`lib/seo.ts`](lib/seo.ts)
with the real social links, and verify the site in Google Search Console (then
submit `/sitemap.xml`).

## Payments (Razorpay)

Online payments use [Razorpay](https://razorpay.com). Set the keys (see
[`.env.example`](.env.example)):

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=          # optional, for the webhook
```

Flow:
1. Checkout posts the cart to `POST /api/razorpay/order` — the server **recomputes
   the amount** from the catalogue and creates a Razorpay order.
2. The hosted Razorpay Checkout modal collects payment (UPI / cards / netbanking / wallets).
3. `POST /api/razorpay/verify` validates the payment signature (HMAC-SHA256) before
   the order is confirmed.
4. (Optional but recommended) Configure a webhook in the Razorpay dashboard →
   `/api/razorpay/webhook` with `RAZORPAY_WEBHOOK_SECRET` for reliable confirmation.

If keys are not set, online payment returns a friendly error and customers can
still use **Cash on Delivery**. Test cards: see Razorpay's
[test card docs](https://razorpay.com/docs/payments/payments/test-card-details/).

## Admin Panel

URL: [http://localhost:3000/admin](http://localhost:3000/admin)

- **Username:** `ponkali_admin`
- **Password:** `erode2024secure`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, products, story, reviews |
| `/shop` | Shop with filters and sorting |
| `/product/[slug]` | Product detail with weight selector |
| `/cart` | Cart with free shipping progress bar |
| `/checkout` | Single-page checkout (UPI or COD) |
| `/order-confirmation/[id]` | Post-order confirmation |
| `/our-story` | Brand heritage story |
| `/contact` | Contact form and WhatsApp link |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Orders overview + stats |
| `/admin/orders` | Full orders table with export |
| `/admin/orders/[id]` | Order detail + status update |
| `/admin/products` | Edit prices + toggle stock |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL) via the `postgres` driver
- **State:** React Context (cart persisted in localStorage)
- **Export:** exceljs (XLSX), built-in CSV generation

## Database (Supabase / PostgreSQL)

Set `DATABASE_URL` (see [`.env.example`](.env.example)) to your Supabase
**Transaction pooler** connection string. On the first request the app creates
all tables and seeds the products automatically — no manual SQL needed.

Setup:
1. Create a free project at [supabase.com](https://supabase.com).
2. Project Settings → Database → Connection string → **Transaction pooler**.
3. Copy the URI, replace `[YOUR-PASSWORD]` with your DB password, and put it in
   `.env.local` (local) and in Vercel → Settings → Environment Variables (prod).

## Export Orders

From the admin panel, export all orders as:
- **CSV** compatible with Google Sheets, Excel
- **XLSX** native Excel format with formatting

## Brand Details

- **Email:** ponkaliturmeric@gmail.com
- **Phone:** 9944033696
- **FSSAI Lic:** 22426064000154
- **Manufacturer:** The Native, Erode 638055, Tamil Nadu
