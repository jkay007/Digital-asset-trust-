// Prints HS256 JWTs for the anon and service_role API keys of the local stack.
import { createHmac } from 'node:crypto';

const secret = process.argv[2];
if (!secret) {
  console.error('usage: node jwt.mjs <jwt-secret>');
  process.exit(1);
}

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
function sign(payload) {
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64(payload);
  const sig = createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

const iat = Math.floor(Date.now() / 1000);
const exp = iat + 10 * 365 * 24 * 3600;
console.log(`ANON_KEY=${sign({ iss: 'supabase-local', role: 'anon', iat, exp })}`);
console.log(`SERVICE_ROLE_KEY=${sign({ iss: 'supabase-local', role: 'service_role', iat, exp })}`);
