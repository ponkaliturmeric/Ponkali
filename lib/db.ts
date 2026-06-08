import postgres from 'postgres';

/**
 * Database layer — Supabase (PostgreSQL) via the `postgres` driver.
 *
 * Connection string comes from DATABASE_URL (Supabase → Project Settings →
 * Database → Connection string). For Vercel/serverless, use the **Transaction
 * pooler** string (port 6543) — it REQUIRES `prepare: false`, which we set below.
 *
 * A tiny compatibility shim (`execute` / `executeMultiple` / `batch`) is exposed
 * so the route handlers can keep using `?` placeholders and the same calls they
 * used with the previous SQLite/libSQL driver. `?` is rewritten to Postgres
 * `$1, $2, …` automatically.
 */

type Row = Record<string, unknown>;
type Arg = string | number | boolean | null;

interface ExecuteInput {
  sql: string;
  args?: Arg[];
}

interface ExecuteResult {
  rows: Row[];
  rowsAffected: number;
}

export interface Db {
  execute(input: string | ExecuteInput): Promise<ExecuteResult>;
  executeMultiple(sql: string): Promise<void>;
  batch(statements: ExecuteInput[], mode?: 'write' | 'read'): Promise<void>;
}

// Reuse a single pool across hot reloads in dev and warm serverless invocations.
const globalForPg = globalThis as unknown as { _pgClient?: postgres.Sql };

let _initPromise: Promise<void> | null = null;

function getClient(): postgres.Sql {
  if (globalForPg._pgClient) return globalForPg._pgClient;

  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add your Supabase connection string (Project Settings → Database → Connection string, Transaction pooler) to .env.local and to your Vercel environment variables.',
    );
  }

  // Supabase requires SSL; a local Postgres (localhost) does not.
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const client = postgres(url, {
    prepare: false, // required for Supabase transaction pooler (pgbouncer)
    ssl: isLocal ? false : 'require',
    max: 5,
    idle_timeout: 20,
  });
  globalForPg._pgClient = client;
  return client;
}

/** Rewrites `?` placeholders to Postgres `$1, $2, …` (left to right). */
function toPg(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function makeDb(client: postgres.Sql): Db {
  return {
    async execute(input) {
      const text = typeof input === 'string' ? input : input.sql;
      const args = typeof input === 'string' ? [] : input.args ?? [];
      const result = await client.unsafe(toPg(text), args as Arg[]);
      const rows = result as unknown as Row[];
      return { rows, rowsAffected: result.count ?? rows.length };
    },
    async executeMultiple(sql) {
      // No params → simple query protocol, which allows multiple statements.
      await client.unsafe(sql);
    },
    async batch(statements) {
      await client.begin(async (tx) => {
        for (const s of statements) {
          await tx.unsafe(toPg(s.sql), (s.args ?? []) as Arg[]);
        }
      });
    },
  };
}

async function initialize(db: Db) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
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
      notes TEXT,
      user_id INTEGER
    );

    -- Link orders to a customer account when one is signed in at checkout.
    -- Idempotent so already-deployed databases (created before this column
    -- existed) get it too. Indexed for the order-history lookup.
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER;
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (lower(email));
    -- Admin orders list sorts newest-first; the dashboard aggregates filter by date.
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
    -- order_items is joined/aggregated by order_id on every admin orders page.
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(order_id),
      product_name TEXT NOT NULL,
      weight TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
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
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      changed_at TIMESTAMPTZ DEFAULT now(),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  const { rows } = await db.execute('SELECT COUNT(*) as count FROM products');
  if (Number(rows[0].count) === 0) {
    const desc = 'Pure Erode turmeric powder, stone ground on our family mill. Grown in the GI-tagged Erode region with 2.5% to 3.5% natural curcumin. No added colour, no fillers and no adulteration. FSSAI certified and packed fresh from our farm in Perundurai, Erode.';
    // Seed prices MUST match the static catalogue in lib/products.ts (the prices
    // shown on the storefront), so the DB and the displayed prices agree on day one.
    await db.batch([
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-100g', 'Erode Turmeric Powder', '100g', 149, 0, desc] },
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-250g', 'Erode Turmeric Powder', '250g', 299, 1, desc] },
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-500g', 'Erode Turmeric Powder', '500g', 449, 0, desc] },
      { sql: 'INSERT INTO products (slug, name, weight, price, in_stock, is_bestseller, description) VALUES (?, ?, ?, ?, 1, ?, ?)', args: ['turmeric-1kg', 'Erode Turmeric Powder', '1kg', 719, 0, desc] },
    ], 'write');
  }
}

export async function getDb(): Promise<Db> {
  const db = makeDb(getClient());
  if (!_initPromise) _initPromise = initialize(db);
  await _initPromise;
  return db;
}
