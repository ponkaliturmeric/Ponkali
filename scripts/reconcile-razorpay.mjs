/**
 * Finds Razorpay payments that were CAPTURED but have no order in the database.
 *
 * This is the situation when the customer's browser never called
 * /api/razorpay/verify after paying (mobile UPI app switch killed the tab)
 * and the webhook was not yet recording orders. Money arrived; no order row.
 *
 * READ-ONLY. Prints each orphaned payment with everything Razorpay knows about
 * the customer (phone, email, address from checkout notes, amount, time) so the
 * order can be fulfilled manually.
 *
 * Usage:
 *   node scripts/reconcile-razorpay.mjs            # last 30 days
 *   node scripts/reconcile-razorpay.mjs --days 90
 *
 * Needs RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and DATABASE_URL in .env.local.
 */
import postgres from 'postgres';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = (k) => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
const KEY_ID = get('RAZORPAY_KEY_ID');
const KEY_SECRET = get('RAZORPAY_KEY_SECRET');
const DB_URL = get('DATABASE_URL');
for (const [k, v] of Object.entries({ RAZORPAY_KEY_ID: KEY_ID, RAZORPAY_KEY_SECRET: KEY_SECRET, DATABASE_URL: DB_URL })) {
  if (!v) { console.error(`${k} not found in .env.local`); process.exit(1); }
}

const daysArg = process.argv.indexOf('--days');
const DAYS = daysArg > -1 ? Number(process.argv[daysArg + 1]) : 30;

const auth = 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
const rzp = async (path) => {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, { headers: { Authorization: auth } });
  if (!res.ok) throw new Error(`Razorpay ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
};

// ── 1. Every captured payment in the window (paginated, 100 per page) ────────
const to = Math.floor(Date.now() / 1000);
const from = to - DAYS * 86400;
const payments = [];
for (let skip = 0; ; skip += 100) {
  const page = await rzp(`/payments?from=${from}&to=${to}&count=100&skip=${skip}`);
  payments.push(...page.items);
  if (page.items.length < 100) break;
}
const captured = payments.filter((p) => p.status === 'captured');

// ── 2. Which of them have an order in our DB? ────────────────────────────────
const sql = postgres(DB_URL, { prepare: false, ssl: /@(localhost|127\.0\.0\.1)[:/]/.test(DB_URL) ? false : 'require', max: 1 });
const orders = await sql`
  SELECT order_id, razorpay_order_id, razorpay_payment_id, notes, phone, total, created_at
  FROM orders WHERE payment_method = 'online'`;
await sql.end();

const known = new Set();
for (const o of orders) {
  if (o.razorpay_payment_id) known.add(o.razorpay_payment_id);
  if (o.razorpay_order_id) known.add(o.razorpay_order_id);
  // Older orders only recorded the ids inside the free-text notes column.
  for (const id of String(o.notes ?? '').match(/\b(pay|order)_[A-Za-z0-9]+\b/g) ?? []) known.add(id);
}

const orphans = captured.filter((p) => !known.has(p.id) && !(p.order_id && known.has(p.order_id)));

// ── 3. Report ────────────────────────────────────────────────────────────────
const inr = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;
const when = (ts) => new Date(ts * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

console.log(`Razorpay payments (last ${DAYS} days): ${payments.length} total, ${captured.length} captured`);
console.log(`Online orders in DB: ${orders.length}`);
console.log(`\nCaptured payments with NO order in the database: ${orphans.length}\n`);

for (const p of orphans) {
  // The Razorpay ORDER carries the receipt (PKL id) and, for new checkouts, the items.
  let order = null;
  try { if (p.order_id) order = await rzp(`/orders/${p.order_id}`); } catch { /* keep going */ }
  console.log('─'.repeat(72));
  console.log(`Payment   ${p.id}   ${inr(p.amount)}   ${when(p.created_at)}   ${p.method?.toUpperCase() ?? ''}${p.vpa ? ' ' + p.vpa : ''}`);
  console.log(`Rzp order ${p.order_id ?? '-'}   receipt ${order?.receipt ?? p.notes?.receipt ?? '-'}`);
  console.log(`Contact   ${p.contact ?? '-'}   Email ${p.email ?? '-'}`);
  console.log(`Address   ${p.notes?.address ?? '-'}`);
  if (order?.notes?.items) console.log(`Items     ${order.notes.items}`);
  else console.log(`Items     (not recorded — infer from amount: 100g ₹149 · 250g ₹299 · 500g ₹449 · 1kg ₹719)`);
}
if (orphans.length) console.log('─'.repeat(72));
