import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

/** Creates staff accounts for the run (reviewer and admin cannot self-register). */
export default async function globalSetup() {
  const keysFile = resolve('.local-stack/keys.env');
  if (!existsSync(keysFile)) throw new Error('Local stack not running. Run: npm run stack:up -- --reset');
  const env = Object.fromEntries(
    readFileSync(keysFile, 'utf8')
      .split('\n')
      .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
      .filter((m): m is RegExpMatchArray => Boolean(m))
      .map((m) => [m[1], m[2]]),
  );
  const health = await fetch(`${env.API_URL}/auth/v1/health`).catch(() => null);
  if (!health?.ok) throw new Error(`Auth is not reachable at ${env.API_URL}. Start the local stack.`);

  const run = Date.now().toString(36);
  const password = 'E2e-password-123';
  const accounts: Record<string, { email: string; password: string; name: string }> = {
    admin: { email: `admin-${run}@e2e.test`, password, name: 'Ava Administrator' },
    reviewer: { email: `reviewer-${run}@e2e.test`, password, name: 'Rui Reviewer' },
    seller: { email: `seller-${run}@e2e.test`, password, name: 'Selma Seller' },
    buyer: { email: `buyer-${run}@e2e.test`, password, name: 'Bram Buyer' },
  };
  const db = new pg.Client({ connectionString: env.DB_URL });
  await db.connect();
  for (const role of ['admin', 'reviewer'] as const) {
    const res = await fetch(`${env.API_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: env.ANON_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        email: accounts[role].email,
        password,
        data: { account_type: 'buyer', full_name: accounts[role].name },
      }),
    });
    if (!res.ok) throw new Error(`Could not create ${role}: ${await res.text()}`);
    await db.query(
      `insert into public.user_roles (user_id, role) select id, $2 from auth.users where email = $1 on conflict do nothing`,
      [accounts[role].email, role],
    );
  }
  await db.end();
  mkdirSync('e2e/.auth', { recursive: true });
  writeFileSync('e2e/.auth/accounts.json', JSON.stringify({ run, accounts, env: { DB_URL: env.DB_URL } }, null, 2));
}
