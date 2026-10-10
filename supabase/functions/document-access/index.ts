// document-access
//
// Issues a short-lived signed URL for a confidential submission document.
//
// Security model
//   1. The caller's JWT is required (verify_jwt = true in config.toml) and is
//      re-validated here with auth.getUser().
//   2. Authorisation is delegated to row-level security: the document row is read
//      with a client acting AS THE CALLER, so only the uploading seller and
//      reviewers/administrators can see it. If RLS hides the row we return 404.
//   3. Only then is the service-role client used, server-side, to sign a URL
//      valid for 60 seconds and to write an audit-log entry. The service-role key
//      never leaves this function.
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BUCKET = 'confidential-documents';
const URL_TTL_SECONDS = 60;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Method not allowed' });

  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json(req, 401, { error: 'Sign in required' });

  let documentId: unknown;
  try {
    ({ document_id: documentId } = await req.json());
  } catch {
    return json(req, 400, { error: 'Invalid JSON body' });
  }
  if (typeof documentId !== 'string' || !UUID_RE.test(documentId)) {
    return json(req, 400, { error: 'document_id must be a UUID' });
  }

  const asCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await asCaller.auth.getUser();
  if (userError || !userData.user) return json(req, 401, { error: 'Session is invalid or expired' });
  const user = userData.user;

  // RLS decides whether this caller may see the document.
  const { data: doc, error: docError } = await asCaller
    .from('submission_documents')
    .select('id, storage_path, file_name, submission_id, owner_id')
    .eq('id', documentId)
    .maybeSingle();
  if (docError) return json(req, 500, { error: 'Could not load document' });
  if (!doc) return json(req, 404, { error: 'Document not found' });

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, URL_TTL_SECONDS, { download: doc.file_name });
  if (signError || !signed) return json(req, 500, { error: 'Could not create a download link' });

  const { error: auditError } = await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'document.accessed',
    entity_type: 'submission_documents',
    entity_id: doc.id,
    details: { submission_id: doc.submission_id, by_owner: doc.owner_id === user.id },
  });
  if (auditError) {
    // Fail closed: no audit entry, no document.
    return json(req, 500, { error: 'Could not record access' });
  }

  return json(req, 200, { url: signed.signedUrl, expires_in: URL_TTL_SECONDS });
});
