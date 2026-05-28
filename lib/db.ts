import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'ponkali.db');
const db = new Database(dbPath);

db.exec(`
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
`);

// Seed products if not exists
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description)
    VALUES (?, ?, ?, ?, 1, ?, ?)
  `);
  const description = 'Pure Erode turmeric powder, stone ground on our ancestral mill. GI-recognised region. 2.5–4.5% natural curcumin. No additives. No adulteration. FSSAI certified. Directly from our family farm in Perundurai, Erode.';
  insertProduct.run('turmeric-100g', 'Erode Turmeric Powder', '100g', 169, 0, description);
  insertProduct.run('turmeric-250g', 'Erode Turmeric Powder', '250g', 329, 1, description);
  insertProduct.run('turmeric-500g', 'Erode Turmeric Powder', '500g', 599, 0, description);
  insertProduct.run('turmeric-1kg', 'Erode Turmeric Powder', '1kg', 849, 0, description);
}

export default db;
