// One-off: clear test orders/messages and restore seed prices on Supabase.
import postgres from 'postgres';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const url = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!url) { console.error('DATABASE_URL not found in .env.local'); process.exit(1); }

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1 });

await sql`DELETE FROM order_status_history`;
await sql`DELETE FROM order_items`;
await sql`DELETE FROM orders`;
await sql`DELETE FROM contact_messages`;
// Restore the catalogue seed prices (in case any were edited during testing).
await sql`UPDATE products SET price = 149, in_stock = 1 WHERE slug = 'turmeric-100g'`;
await sql`UPDATE products SET price = 299, in_stock = 1 WHERE slug = 'turmeric-250g'`;
await sql`UPDATE products SET price = 449, in_stock = 1 WHERE slug = 'turmeric-500g'`;
await sql`UPDATE products SET price = 719, in_stock = 1 WHERE slug = 'turmeric-1kg'`;

const [{ count: orders }] = await sql`SELECT COUNT(*)::int AS count FROM orders`;
const products = await sql`SELECT slug, price FROM products ORDER BY id`;
console.log('orders remaining:', orders);
console.log('products:', products.map(p => `${p.slug}=${p.price}`).join(', '));

await sql.end();
console.log('✓ Supabase reset to a clean state.');
