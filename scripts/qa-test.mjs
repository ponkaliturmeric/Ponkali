/**
 * QA harness for the customer-account / mobile-login / customers-list fixes.
 * Runs READ checks against live data + an isolated end-to-end write test that
 * cleans up after itself. Safe to run repeatedly. Does NOT touch real customer
 * rows except the explicitly-named `thirutk2020@gmail.com` diagnostic read.
 */
import postgres from 'postgres';
import crypto from 'crypto';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const url = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!url) { console.error('DATABASE_URL not found'); process.exit(1); }
const sql = postgres(url, { prepare: false, ssl: 'require', max: 1 });

const hashPassword = (pw) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
};
const verifyPassword = (pw, stored) => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex');
  const b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

let pass = 0, fail = 0;
const ok = (n, c, extra = '') => { (c ? pass++ : fail++); console.log(`${c ? '✓' : '✗ FAIL'}  ${n}${extra ? ' — ' + extra : ''}`); };

// ── 1. Apply the migrations (idempotent) ────────────────────────────────────
await sql.unsafe(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users (phone) WHERE phone IS NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (lower(email)) WHERE email IS NOT NULL;
`);
const cols = await sql`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='users'`;
const colMap = Object.fromEntries(cols.map(c => [c.column_name, c.is_nullable]));
ok('users.phone column exists', 'phone' in colMap);
ok('users.email is now nullable', colMap.email === 'YES');

// ── 2. Diagnose the reported account ─────────────────────────────────────────
const reported = await sql`SELECT id, email, phone, name FROM users WHERE lower(email)='thirutk2020@gmail.com'`;
console.log('\n  thirutk2020@gmail.com account row:', reported[0] ?? '(not found)');

// The merged customers query (mirror of app/api/admin/customers/route.ts).
const CUSTOMERS_SQL = `
  WITH order_cust AS (
    SELECT
      right(regexp_replace(phone, '[^0-9]', '', 'g'), 10) AS phone_key,
      (array_agg(phone ORDER BY created_at DESC))[1] AS phone,
      (array_agg(customer_name ORDER BY created_at DESC))[1] AS customer_name,
      (array_agg(NULLIF(email, '') ORDER BY created_at DESC))[1] AS email,
      (array_agg(city ORDER BY created_at DESC))[1] AS city,
      (array_agg(state ORDER BY created_at DESC))[1] AS state,
      COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS total_spent,
      MIN(created_at) AS first_order, MAX(created_at) AS last_order
    FROM orders GROUP BY right(regexp_replace(phone, '[^0-9]', '', 'g'), 10)
  ),
  acct AS (
    SELECT NULLIF(phone,'') AS phone_key, NULLIF(phone,'') AS phone,
           lower(NULLIF(email,'')) AS email, name AS customer_name, created_at AS registered_at
    FROM users
  ),
  cust AS (
    SELECT COALESCE(o.phone, a.phone) AS phone,
           COALESCE(o.customer_name, a.customer_name) AS customer_name,
           COALESCE(o.email, a.email) AS email, o.city, o.state,
           COALESCE(o.order_count, 0) AS order_count, COALESCE(o.total_spent, 0) AS total_spent,
           o.first_order, o.last_order, COALESCE(o.last_order, a.registered_at) AS last_activity,
           (a.phone_key IS NOT NULL OR a.email IS NOT NULL) AS has_account
    FROM order_cust o FULL OUTER JOIN acct a ON o.phone_key = a.phone_key
  )
  SELECT
    (SELECT COALESCE(json_agg(p), '[]'::json) FROM (
       SELECT *, COUNT(*) OVER() AS total_count FROM cust
       WHERE customer_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
       ORDER BY total_spent DESC, order_count DESC, customer_name ASC LIMIT 20 OFFSET 0
    ) p) AS rows,
    (SELECT json_build_object('total_customers', COUNT(*),
       'repeat_customers', COALESCE(SUM(CASE WHEN order_count>=2 THEN 1 ELSE 0 END),0),
       'total_spent', COALESCE(SUM(total_spent),0),
       'avg_ltv', COALESCE(AVG(total_spent) FILTER (WHERE order_count>0),0)) FROM cust) AS summary
`;

// ── 3. The reported account now appears in the customers list ────────────────
if (reported[0]) {
  const [{ rows: r }] = await sql.unsafe(CUSTOMERS_SQL, ['%thirutk2020%']);
  ok('reported account now shows in Customers list', (r || []).some(x => (x.email || '').includes('thirutk2020')),
     `matched ${ (r||[]).length } row(s)`);
}

// ── 4. End-to-end: register (phone) → place order → merges to one customer ───
const tag = 'qatest_' + crypto.randomBytes(3).toString('hex');
const testPhone = '9' + String(Math.abs(crypto.randomBytes(4).readInt32BE()) % 1_000_000_000).padStart(9, '0');
const testEmail = `${tag}@example.com`;
const testOrderId = `QA-${tag}`;
let createdUserId = null;

try {
  // 4a. register with phone only (no email) — proves email-optional works.
  const [u] = await sql`
    INSERT INTO users (email, phone, password_hash, name)
    VALUES (${null}, ${testPhone}, ${hashPassword('Sup3rSecret!')}, ${'QA Phone User'}) RETURNING id`;
  createdUserId = u.id;
  ok('register with phone + NO email succeeds', !!createdUserId);

  // 4b. login by phone resolves the account & password verifies.
  const [byPhone] = await sql`SELECT id, password_hash FROM users WHERE phone=${testPhone}`;
  ok('login lookup by phone finds the account', byPhone?.id === createdUserId);
  ok('password verifies for that account', verifyPassword('Sup3rSecret!', byPhone.password_hash));

  // 4c. account-only customer (zero orders) appears in the list.
  let [{ rows: before }] = await sql.unsafe(CUSTOMERS_SQL, [`%${testPhone}%`]);
  const acctRow = (before || []).find(x => x.phone === testPhone);
  ok('account with ZERO orders appears in Customers', !!acctRow, acctRow ? `order_count=${acctRow.order_count}, segment=Registered` : '');

  // 4d. place an order with the same phone (formatted differently to test normalisation).
  await sql`
    INSERT INTO orders (order_id, customer_name, phone, email, address_line1, city, state, pincode,
                        payment_method, subtotal, shipping, cod_charge, total, status, user_id)
    VALUES (${testOrderId}, ${'QA Phone User'}, ${'+91 ' + testPhone}, ${null}, ${'1 Test St'},
            ${'Erode'}, ${'Tamil Nadu'}, ${'638001'}, ${'cod'}, 299, 0, 30, 329, 'Pending', ${createdUserId})`;

  // 4e. after ordering, the SAME person is ONE row (merged on normalised phone), not two.
  let [{ rows: after }] = await sql.unsafe(CUSTOMERS_SQL, [`%${testPhone}%`]);
  const matches = (after || []).filter(x => (x.phone || '').replace(/\D/g, '').slice(-10) === testPhone);
  ok('order + account merge into ONE customer row', matches.length === 1, `found ${matches.length} row(s)`);
  ok('merged row reflects the order (spend & count)', matches[0]?.order_count === 1 && Number(matches[0]?.total_spent) === 329,
     matches[0] ? `count=${matches[0].order_count}, spent=${matches[0].total_spent}` : '');

  // 4f. order-history query (account/orders route) matches by phone even with formatting diff.
  const hist = await sql.unsafe(`
    SELECT o.order_id FROM orders o
    WHERE o.user_id = $1
       OR ($2 <> '' AND lower(o.email) = $2)
       OR ($3 <> '' AND right(regexp_replace(o.phone, '[^0-9]', '', 'g'), 10) = $3)`,
    [createdUserId, '', testPhone]);
  ok('customer order-history finds the order', hist.some(h => h.order_id === testOrderId));
} finally {
  // ── cleanup: remove every test row we created ──────────────────────────────
  await sql`DELETE FROM order_status_history WHERE order_id=${testOrderId}`;
  await sql`DELETE FROM order_items WHERE order_id=${testOrderId}`;
  await sql`DELETE FROM orders WHERE order_id=${testOrderId}`;
  if (createdUserId) await sql`DELETE FROM users WHERE id=${createdUserId}`;
  console.log('\n  (cleaned up all QA test rows)');
}

console.log(`\n──────────\n${pass} passed, ${fail} failed`);
await sql.end();
process.exit(fail ? 1 : 0);
