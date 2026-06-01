import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

let _client: Client | null = null;
let _initPromise: Promise<void> | null = null;

function buildClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;

  // Production requires a real Turso URL — file: URLs don't work on serverless
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TURSO_DATABASE_URL is not set. Add it to your Vercel environment variables.');
    }
    // Local dev fallback
    const localUrl = 'file:./database/local.db';
    try {
      const dir = path.join(process.cwd(), 'database');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch { /* ignore if filesystem is read-only */ }
    return createClient({ url: localUrl });
  }

  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}

async function initialize(db: Client) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      landmark TEXT,
      payment_method TEXT NOT NULL,
      upi_id TEXT,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL,
      cod_charge REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      weight TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      weight TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      in_stock INTEGER DEFAULT 1,
      is_bestseller INTEGER DEFAULT 0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const { rows } = await db.execute('SELECT COUNT(*) as count FROM products');
  if (Number(rows[0].count) === 0) {
    const desc = 'Pure Erode turmeric powder, stone ground on our ancestral mill. GI-recognised region. 2.5–4.5% natural curcumin. No additives. No adulteration. FSSAI certified. Directly from our family farm in Perundurai, Erode.';
    await db.batch([
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-100g', 'Erode Turmeric Powder', '100g', 169, 0, desc] },
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-250g', 'Erode Turmeric Powder', '250g', 329, 1, desc] },
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-500g', 'Erode Turmeric Powder', '500g', 599, 0, desc] },
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-1kg', 'Erode Turmeric Powder', '1kg', 849, 0, desc] },
    ], 'write');
  }
}

export async function getDb(): Promise<Client> {
  if (!_client) _client = buildClient();
  if (!_initPromise) _initPromise = initialize(_client);
  await _initPromise;
  return _client;
}
