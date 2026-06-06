import { getDb } from './db';
import { PRODUCTS } from './products';
import { Product } from './types';

/**
 * Server-only product catalogue, backed by the database.
 *
 * The DB `products` table is the source of truth for the MUTABLE fields the
 * admin edits (price, in_stock). The static list in lib/products.ts is the seed
 * and the fallback if the DB is ever unreachable. Import this ONLY from server
 * code (route handlers, server components) — it pulls in lib/db.ts which uses
 * the Node filesystem. Client components should keep importing the static
 * PRODUCTS from lib/products.ts.
 */

function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    name: String(r.name),
    weight: String(r.weight),
    price: Number(r.price),
    original_price: r.original_price != null ? Number(r.original_price) : undefined,
    in_stock: Number(r.in_stock),
    is_bestseller: Number(r.is_bestseller),
    description: r.description != null ? String(r.description) : undefined,
  };
}

export async function getCatalog(): Promise<Product[]> {
  // Product copy (name, description) is owned by the code in lib/products.ts, not
  // by the admin, so we always source it from there. The DB only governs the
  // fields the admin can change (price, in_stock, is_bestseller). This keeps the
  // marketing copy editable in one place and prevents stale seeded descriptions.
  const staticBySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
  try {
    const db = await getDb();
    const { rows } = await db.execute(
      'SELECT id, slug, name, weight, price, original_price, in_stock, is_bestseller, description FROM products ORDER BY id',
    );
    if (rows.length === 0) return PRODUCTS;
    return rows.map((r) => {
      const p = rowToProduct(r as unknown as Record<string, unknown>);
      const s = staticBySlug.get(p.slug);
      if (s) { p.name = s.name; p.description = s.description; }
      return p;
    });
  } catch (err) {
    console.error('getCatalog failed, falling back to static catalogue:', err);
    return PRODUCTS;
  }
}

export async function getCatalogItem(slug: string): Promise<Product | null> {
  const catalog = await getCatalog();
  return catalog.find((p) => p.slug === slug) ?? null;
}
