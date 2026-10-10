// Shared helpers for the security test suite. Requires the local stack
// (scripts/local-stack/up.sh) or env vars API_URL, ANON_KEY, DB_URL.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

function loadKeys() {
  const file = resolve(process.cwd(), '.local-stack/keys.env');
  const env = { ...process.env };
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  }
  for (const key of ['API_URL', 'ANON_KEY', 'DB_URL']) {
    if (!env[key]) throw new Error(`${key} is not set. Start the local stack with: npm run stack:up`);
  }
  return env;
}

export const env = loadKeys();
export const db = new pg.Pool({ connectionString: env.DB_URL, max: 4 });
export const RUN = Date.now().toString(36);
export const PASSWORD = 'Sec-test-pass-123';

export function client() {
  return createClient(env.API_URL, env.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let counter = 0;
/** Creates a user via the real sign-up endpoint, optionally adding roles directly in the DB. */
export async function createUser(accountType = 'buyer', extraRoles = [], metadata = {}) {
  const email = `sec-${RUN}-${++counter}-${accountType}@security.test`;
  const c = client();
  const { data, error } = await c.auth.signUp({
    email,
    password: PASSWORD,
    options: { data: { account_type: accountType, full_name: `Test ${accountType} ${counter}`, ...metadata } },
  });
  if (error) throw error;
  if (!data.session) throw new Error('Expected auto-confirmed session from local auth');
  for (const role of extraRoles) {
    await db.query(
      `insert into public.user_roles (user_id, role) values ($1, $2) on conflict do nothing`,
      [data.user.id, role],
    );
  }
  return { client: c, id: data.user.id, email };
}

export async function roles(userId) {
  const { rows } = await db.query('select role from public.user_roles where user_id = $1 order by role', [userId]);
  return rows.map((r) => r.role);
}

export function uuid() {
  return randomUUID();
}

export async function reference() {
  const { rows } = await db.query(`
    select (select id from public.categories where slug = 'payments-emis') as category_id,
           (select id from public.jurisdictions where slug = 'malta') as jurisdiction_id`);
  return rows[0];
}

export function completeSubmission(ref, overrides = {}) {
  return {
    title: 'Security test EMI with passporting',
    category_id: ref.category_id,
    jurisdiction_id: ref.jurisdiction_id,
    transaction_type: 'full_acquisition',
    operating_status: 'operating',
    summary: 'An authorised EMI used to exercise the security test suite end to end.',
    description: 'Paragraph one.\n\nParagraph two.',
    asking_price: 1500000,
    currency: 'EUR',
    price_on_request: false,
    licence_type: 'Electronic money institution licence',
    regulator: 'Malta Financial Services Authority (MFSA)',
    company_legal_name: 'Confidential Test Holdings Ltd',
    registration_number: 'C-SECRET-123',
    licence_number: 'LIC-SECRET-999',
    contact_email: 'owner@security.test',
    seller_declaration: true,
    ...overrides,
  };
}

/** Asserts a PostgREST / RPC response failed with one of the given SQLSTATE codes. */
export function expectDenied(assert, result, codes = ['42501']) {
  assert.ok(result.error, `expected an error but the call succeeded: ${JSON.stringify(result.data)?.slice(0, 200)}`);
  if (codes) assert.ok(codes.includes(result.error.code), `unexpected error ${result.error.code}: ${result.error.message}`);
}
