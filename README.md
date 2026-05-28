# Ponkali Masalas — E-Commerce Website

Premium Indian spice brand from Erode, Tamil Nadu. Built with Next.js 14, Tailwind CSS, and SQLite.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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
- **Database:** SQLite via better-sqlite3
- **State:** React Context (cart persisted in localStorage)
- **Export:** exceljs (XLSX), built-in CSV generation

## Database

Auto-created at `database/ponkali.db` on first run. Products are seeded automatically.

## Export Orders

From the admin panel, export all orders as:
- **CSV** compatible with Google Sheets, Excel
- **XLSX** native Excel format with formatting

## Brand Details

- **Email:** ponkaliturmeric@gmail.com
- **Phone:** 9944033696
- **FSSAI Lic:** 22426064000154
- **Manufacturer:** The Native, Perundurai, Erode 638055, Tamil Nadu
