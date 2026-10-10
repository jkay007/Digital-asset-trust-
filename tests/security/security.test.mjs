// Server-side security tests. These call the real API (PostgREST, Auth, Storage,
// Edge Function) as each role and assert that the database, not the UI,
// enforces every rule. Run against a disposable local stack:
//   npm run stack:up && npm run test:security
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  client,
  completeSubmission,
  createUser,
  db,
  env,
  expectDenied,
  reference,
  roles,
} from './helpers.mjs';

const PRIVATE_TABLES = [
  'assets',
  'asset_private_details',
  'seller_submissions',
  'submission_documents',
  'enquiries',
  'audit_logs',
  'profiles',
  'user_roles',
  'buyer_mandates',
  'verification_records',
  'staff_notes',
  'saved_listings',
];
const CONFIDENTIAL_KEYS = ['company_legal_name', 'registration_number', 'licence_number', 'seller_id', 'submission_id', 'approved_by', 'contact_email'];

let anon, admin, reviewer, sellerA, sellerB, buyer, ref;
let demoListing, submissionId, draftForDocsId, assetId, documentId, documentPath;
const fileContent = `%PDF-1.4 security test ${Date.now()}`;

before(async () => {
  anon = client();
  [admin, reviewer, sellerA, sellerB, buyer] = await Promise.all([
    createUser('buyer', ['admin']),
    createUser('buyer', ['reviewer']),
    createUser('seller'),
    createUser('seller'),
    createUser('buyer'),
  ]);
  ref = await reference();
  const { data } = await anon.from('marketplace_listings').select('id, slug, is_demo').eq('status', 'published').eq('is_demo', true).limit(1);
  demoListing = data?.[0];
});

after(async () => {
  await db.end();
});

describe('anonymous visitors', () => {
  test('see only published or sold listings, without confidential columns', async () => {
    const { data, error } = await anon.from('marketplace_listings').select('*').limit(200);
    assert.ifError(error);
    assert.ok(data.length > 0);
    for (const row of data) {
      assert.ok(['published', 'sold'].includes(row.status));
      for (const key of CONFIDENTIAL_KEYS) assert.ok(!(key in row), `public view exposes ${key}`);
    }
  });

  test('cannot read any private table', async () => {
    for (const table of PRIVATE_TABLES) {
      const result = await anon.from(table).select('*').limit(1);
      expectDenied(assert, result);
    }
  });

  test('cannot write to reference data or call moderation functions', async () => {
    expectDenied(assert, await anon.from('categories').insert({ slug: 'x', name: 'x', short_name: 'x', description: 'x' }));
    expectDenied(assert, await anon.rpc('admin_list_users'));
    expectDenied(assert, await anon.rpc('set_asset_status', { p_asset_id: demoListing.id, p_status: 'archived' }));
  });
});

describe('registration', () => {
  test('a sign-up cannot request a privileged role', async () => {
    const attacker = await createUser('admin');
    assert.deepEqual(await roles(attacker.id), ['buyer']);
    const reviewerAttempt = await createUser('reviewer');
    assert.deepEqual(await roles(reviewerAttempt.id), ['buyer']);
  });

  test('self-service can add buyer or seller, never admin or reviewer', async () => {
    const user = await createUser('buyer');
    expectDenied(assert, await user.client.rpc('add_self_service_role', { p_role: 'admin' }));
    expectDenied(assert, await user.client.rpc('add_self_service_role', { p_role: 'reviewer' }));
    const ok = await user.client.rpc('add_self_service_role', { p_role: 'seller' });
    assert.ifError(ok.error);
    assert.deepEqual(await roles(user.id), ['buyer', 'seller']);
  });

  test('users cannot write their own roles directly', async () => {
    expectDenied(assert, await buyer.client.from('user_roles').insert({ user_id: buyer.id, role: 'admin' }));
  });
});

describe('buyers', () => {
  test('cannot moderate, verify or manage users', async () => {
    expectDenied(assert, await buyer.client.rpc('set_asset_status', { p_asset_id: demoListing.id, p_status: 'archived' }));
    expectDenied(assert, await buyer.client.rpc('set_user_role', { p_user_id: buyer.id, p_role: 'admin', p_grant: true }));
    expectDenied(assert, await buyer.client.rpc('admin_list_users'));
    expectDenied(assert, await buyer.client.rpc('admin_dashboard_stats'));
    expectDenied(assert, await buyer.client.from('verification_records').insert({ asset_id: demoListing.id, level: 'documents_reviewed', method: 'fake' }));
  });

  test('cannot edit listings even with a direct API call', async () => {
    const before = await db.query('select title from public.assets where id = $1', [demoListing.id]);
    await buyer.client.from('assets').update({ title: 'Hijacked title' }).eq('id', demoListing.id);
    const afterRow = await db.query('select title from public.assets where id = $1', [demoListing.id]);
    assert.equal(afterRow.rows[0].title, before.rows[0].title);
  });

  test('see only their own profile and an empty audit log', async () => {
    const { data: profiles } = await buyer.client.from('profiles').select('id');
    assert.deepEqual(profiles.map((p) => p.id), [buyer.id]);
    const { data: logs, error } = await buyer.client.from('audit_logs').select('id').limit(5);
    assert.ifError(error);
    assert.equal(logs.length, 0);
  });

  test('can save published listings; saved lists are private', async () => {
    const ok = await buyer.client.from('saved_listings').insert({ asset_id: demoListing.id });
    assert.ifError(ok.error);
    const { data: others } = await sellerA.client.from('saved_listings').select('*');
    assert.equal(others.length, 0);
  });
});

describe('seller submissions', () => {
  test('only sellers can create submissions', async () => {
    expectDenied(assert, await buyer.client.from('seller_submissions').insert({ title: 'Buyer attempt' }));
  });

  test('cannot be created already approved', async () => {
    const r = await sellerA.client.from('seller_submissions').insert({ title: 'Sneaky approval', status: 'approved' });
    assert.ok(r.error, 'insert with approved status must fail');
  });

  test('incomplete submissions are rejected by the server', async () => {
    const draft = await sellerA.client.from('seller_submissions').insert({ title: 'Draft only' }).select('id, status, seller_id').single();
    assert.ifError(draft.error);
    assert.equal(draft.data.status, 'draft');
    assert.equal(draft.data.seller_id, sellerA.id);
    submissionId = draft.data.id;
    const submit = await sellerA.client.from('seller_submissions').update({ status: 'submitted' }).eq('id', submissionId);
    expectDenied(assert, submit, ['22023']);
    assert.match(submit.error.message, /incomplete/i);
  });

  test('complete submissions can be submitted and are then locked', async () => {
    const ok = await sellerA.client
      .from('seller_submissions')
      .update({ ...completeSubmission(ref), status: 'submitted' })
      .eq('id', submissionId)
      .select('status, submitted_at')
      .single();
    assert.ifError(ok.error);
    assert.equal(ok.data.status, 'submitted');
    assert.ok(ok.data.submitted_at);
    await sellerA.client.from('seller_submissions').update({ title: 'Edited after submission' }).eq('id', submissionId);
    const { rows } = await db.query('select title from public.seller_submissions where id = $1', [submissionId]);
    assert.notEqual(rows[0].title, 'Edited after submission');
  });

  test('sellers cannot write review fields', async () => {
    const draft = await sellerA.client.from('seller_submissions').insert({ title: 'Docs draft' }).select('id').single();
    assert.ifError(draft.error);
    draftForDocsId = draft.data.id;
    expectDenied(assert, await sellerA.client.from('seller_submissions').update({ feedback_to_seller: 'self-approved' }).eq('id', draftForDocsId));
    expectDenied(assert, await sellerA.client.from('seller_submissions').update({ asset_id: demoListing.id }).eq('id', draftForDocsId));
    const status = await sellerA.client.from('seller_submissions').update({ status: 'approved' }).eq('id', draftForDocsId);
    assert.ok(status.error, 'seller must not be able to approve');
  });

  test('sellers cannot see each other’s submissions; staff can', async () => {
    const { data: other } = await sellerB.client.from('seller_submissions').select('id').eq('id', submissionId);
    assert.equal(other.length, 0);
    const { data: staff } = await reviewer.client.from('seller_submissions').select('id, company_legal_name').eq('id', submissionId);
    assert.equal(staff.length, 1);
  });
});

describe('confidential documents', () => {
  test('sellers can upload only into their own folder for their own editable submission', async () => {
    documentPath = `${sellerA.id}/${draftForDocsId}/${crypto.randomUUID()}-licence.pdf`;
    const up = await sellerA.client.storage
      .from('confidential-documents')
      .upload(documentPath, new Blob([fileContent], { type: 'application/pdf' }), { contentType: 'application/pdf' });
    assert.ifError(up.error);
    const row = await sellerA.client
      .from('submission_documents')
      .insert({
        submission_id: draftForDocsId,
        storage_path: documentPath,
        file_name: 'licence.pdf',
        mime_type: 'application/pdf',
        size_bytes: fileContent.length,
        document_type: 'licence',
      })
      .select('id')
      .single();
    assert.ifError(row.error);
    documentId = row.data.id;

    const intoOtherFolder = await sellerB.client.storage
      .from('confidential-documents')
      .upload(`${sellerA.id}/${draftForDocsId}/evil.pdf`, new Blob(['x'], { type: 'application/pdf' }), { contentType: 'application/pdf' });
    assert.ok(intoOtherFolder.error, 'upload into another seller’s folder must fail');
    const ownFolderOtherSubmission = await sellerB.client.storage
      .from('confidential-documents')
      .upload(`${sellerB.id}/${draftForDocsId}/evil.pdf`, new Blob(['x'], { type: 'application/pdf' }), { contentType: 'application/pdf' });
    assert.ok(ownFolderOtherSubmission.error, 'upload against another seller’s submission must fail');
  });

  test('the bucket is private', async () => {
    const { rows } = await db.query(`select public from storage.buckets where id = 'confidential-documents'`);
    assert.equal(rows[0].public, false);
    const res = await fetch(`${env.API_URL}/storage/v1/object/public/confidential-documents/${documentPath}`);
    assert.notEqual(res.status, 200);
  });

  test('only the owner can download directly; staff and others cannot', async () => {
    const own = await sellerA.client.storage.from('confidential-documents').download(documentPath);
    assert.ifError(own.error);
    assert.equal(await own.data.text(), fileContent);
    for (const actor of [sellerB, buyer, reviewer, admin]) {
      const r = await actor.client.storage.from('confidential-documents').download(documentPath);
      assert.ok(r.error, 'direct download by non-owner must fail');
    }
    const anonRes = await anon.storage.from('confidential-documents').download(documentPath);
    assert.ok(anonRes.error);
  });

  test('reviewers get a short-lived link through the audited Edge Function; others get 404', async () => {
    const { data, error } = await reviewer.client.functions.invoke('document-access', { body: { document_id: documentId } });
    assert.ifError(error);
    assert.equal(data.expires_in, 60);
    const file = await fetch(data.url);
    assert.equal(file.status, 200);
    assert.equal(await file.text(), fileContent);

    const denied = await buyer.client.functions.invoke('document-access', { body: { document_id: documentId } });
    assert.ok(denied.error);
    assert.equal(denied.error.context?.status, 404);

    const noAuth = await fetch(`${env.API_URL}/functions/v1/document-access`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ document_id: documentId }),
    });
    assert.equal(noAuth.status, 401);

    const { rows } = await db.query(
      `select actor_id from public.audit_logs where action = 'document.accessed' and entity_id = $1`,
      [documentId],
    );
    assert.ok(rows.some((r) => r.actor_id === reviewer.id), 'document access must be audit-logged');
  });
});

describe('review and approval', () => {
  test('reviewers can review and request changes but cannot approve or reject', async () => {
    assert.ifError((await reviewer.client.rpc('start_submission_review', { p_submission_id: submissionId })).error);
    expectDenied(assert, await reviewer.client.rpc('approve_submission', { p_submission_id: submissionId }));
    expectDenied(assert, await reviewer.client.rpc('reject_submission', { p_submission_id: submissionId, p_reason: 'Reviewer cannot reject' }));
    const changes = await reviewer.client.rpc('request_submission_changes', {
      p_submission_id: submissionId,
      p_feedback: 'Please clarify the safeguarding arrangements.',
    });
    assert.ifError(changes.error);
    const { data } = await sellerA.client.from('seller_submissions').select('status, feedback_to_seller').eq('id', submissionId).single();
    assert.equal(data.status, 'changes_requested');
    assert.match(data.feedback_to_seller, /safeguarding/);
  });

  test('the seller can edit and resubmit after changes are requested', async () => {
    const r = await sellerA.client
      .from('seller_submissions')
      .update({ description: 'Safeguarding is held with an EU credit institution.', status: 'submitted' })
      .eq('id', submissionId)
      .select('status')
      .single();
    assert.ifError(r.error);
    assert.equal(r.data.status, 'submitted');
  });

  test('administrator approval creates an unpublished listing with private details kept separate', async () => {
    const { data, error } = await admin.client.rpc('approve_submission', { p_submission_id: submissionId, p_note: 'Looks complete' });
    assert.ifError(error);
    assetId = data;
    const { rows } = await db.query('select status, approved_by, seller_id, verification_status from public.assets where id = $1', [assetId]);
    assert.equal(rows[0].status, 'approved');
    assert.equal(rows[0].approved_by, admin.id);
    assert.equal(rows[0].seller_id, sellerA.id);
    assert.equal(rows[0].verification_status, 'unverified');
    const pub = await anon.from('marketplace_listings').select('id').eq('id', assetId);
    assert.equal(pub.data.length, 0, 'approved listings must not be public before publication');
    const priv = await db.query('select company_legal_name from public.asset_private_details where asset_id = $1', [assetId]);
    assert.equal(priv.rows[0].company_legal_name, 'Confidential Test Holdings Ltd');
  });

  test('sellers see their own listing and private details; others do not', async () => {
    const own = await sellerA.client.from('assets').select('id, status').eq('id', assetId);
    assert.equal(own.data.length, 1);
    const ownPrivate = await sellerA.client.from('asset_private_details').select('asset_id').eq('asset_id', assetId);
    assert.equal(ownPrivate.data.length, 1);
    const other = await sellerB.client.from('asset_private_details').select('asset_id').eq('asset_id', assetId);
    assert.equal(other.data.length, 0);
    const buyerView = await buyer.client.from('assets').select('id').eq('id', assetId);
    assert.equal(buyerView.data.length, 0);
  });

  test('unpublished listings cannot be saved or enquired about', async () => {
    expectDenied(assert, await buyer.client.from('saved_listings').insert({ asset_id: assetId }));
    const e = await anon.rpc('submit_enquiry', {
      p_asset_id: assetId,
      p_name: 'Early Bird',
      p_email: 'early@security.test',
      p_message: 'Trying to enquire about an unpublished listing.',
      p_consent: true,
    });
    expectDenied(assert, e, ['22023']);
  });
});

describe('publication controls', () => {
  test('listings created through the API start as drafts and cannot set protected fields', async () => {
    const withStatus = await admin.client.from('assets').insert({
      title: 'Admin attempt to publish directly',
      summary: 'Trying to create a listing that is already published.',
      category_id: ref.category_id,
      jurisdiction_id: ref.jurisdiction_id,
      transaction_type: 'merger',
      operating_status: 'operating',
      price_on_request: true,
      status: 'published',
    });
    expectDenied(assert, withStatus);

    const draft = await admin.client
      .from('assets')
      .insert({
        title: 'Admin-created draft listing',
        summary: 'A listing created directly by an administrator for testing.',
        category_id: ref.category_id,
        jurisdiction_id: ref.jurisdiction_id,
        transaction_type: 'merger',
        operating_status: 'operating',
        price_on_request: true,
      })
      .select('id, status, verification_status, is_demo')
      .single();
    assert.ifError(draft.error);
    assert.equal(draft.data.status, 'draft');
    assert.equal(draft.data.verification_status, 'unverified');
    assert.equal(draft.data.is_demo, false);

    const skip = await admin.client.rpc('set_asset_status', { p_asset_id: draft.data.id, p_status: 'published' });
    expectDenied(assert, skip, ['22023']);
  });

  test('status and verification cannot be changed by direct update, even by an administrator', async () => {
    expectDenied(assert, await admin.client.from('assets').update({ status: 'published' }).eq('id', assetId));
    expectDenied(assert, await admin.client.from('assets').update({ verification_status: 'documents_reviewed' }).eq('id', assetId));
  });

  test('publishing makes the listing public; invalid transitions are refused', async () => {
    assert.ifError((await admin.client.rpc('set_asset_status', { p_asset_id: assetId, p_status: 'published', p_note: 'Go live' })).error);
    const pub = await anon.from('marketplace_listings').select('id, status, asking_price').eq('id', assetId).single();
    assert.ifError(pub.error);
    assert.equal(pub.data.status, 'published');
    expectDenied(assert, await admin.client.rpc('set_asset_status', { p_asset_id: assetId, p_status: 'draft' }), ['22023']);
  });
});

describe('verification', () => {
  test('only staff can record verification; sellers cannot verify their own listing', async () => {
    expectDenied(assert, await sellerA.client.from('verification_records').insert({ asset_id: assetId, level: 'documents_reviewed', method: 'Self-certified' }));
    expectDenied(assert, await reviewer.client.from('verification_records').insert({ asset_id: assetId, level: 'company_checked', method: 'x', is_demo: true }));
  });

  test('a reviewer record is attributed to the reviewer and drives the public badge', async () => {
    const r = await reviewer.client
      .from('verification_records')
      .insert({ asset_id: assetId, level: 'company_checked', method: 'Official companies register search', source_reference: 'Registry extract' })
      .select('reviewer_id, is_demo')
      .single();
    assert.ifError(r.error);
    assert.equal(r.data.reviewer_id, reviewer.id);
    assert.equal(r.data.is_demo, false);
    const pub = await anon.from('marketplace_listings').select('verification_status, verified_at').eq('id', assetId).single();
    assert.equal(pub.data.verification_status, 'company_checked');
    assert.ok(pub.data.verified_at);
  });

  test('verification records are append-only', async () => {
    const { rows } = await db.query('select id from public.verification_records where asset_id = $1 limit 1', [assetId]);
    expectDenied(assert, await reviewer.client.from('verification_records').update({ level: 'documents_reviewed' }).eq('id', rows[0].id));
    expectDenied(assert, await admin.client.from('verification_records').delete().eq('id', rows[0].id));
  });
});

describe('enquiries', () => {
  test('are refused for demo listings and without consent', async () => {
    const demo = await anon.rpc('submit_enquiry', {
      p_asset_id: demoListing.id,
      p_name: 'Demo Visitor',
      p_email: 'demo@security.test',
      p_message: 'Enquiring about a demo listing, which must be refused.',
      p_consent: true,
    });
    expectDenied(assert, demo, ['22023']);
    const noConsent = await anon.rpc('submit_enquiry', {
      p_asset_id: assetId,
      p_name: 'No Consent',
      p_email: 'noconsent@security.test',
      p_message: 'This enquiry does not include consent so it must fail.',
      p_consent: false,
    });
    expectDenied(assert, noConsent, ['22023']);
  });

  test('anonymous and signed-in buyers can enquire; duplicates are throttled', async () => {
    const args = {
      p_asset_id: assetId,
      p_name: 'Anonymous Acquirer',
      p_email: 'anon-buyer@security.test',
      p_message: 'We would like to discuss acquiring this EMI within six months.',
      p_consent: true,
      p_nda_requested: true,
    };
    const first = await anon.rpc('submit_enquiry', args);
    assert.ifError(first.error);
    expectDenied(assert, await anon.rpc('submit_enquiry', args), ['P0001']);
    const own = await buyer.client.rpc('submit_enquiry', { ...args, p_email: buyer.email, p_name: 'Signed In Buyer' });
    assert.ifError(own.error);
  });

  test('buyer data is visible only to the buyer and administrators', async () => {
    const mine = await buyer.client.from('enquiries').select('id, buyer_id');
    assert.ok(mine.data.length >= 1);
    assert.ok(mine.data.every((e) => e.buyer_id === buyer.id));
    const sellerView = await sellerA.client.from('enquiries').select('id').eq('asset_id', assetId);
    assert.equal(sellerView.data.length, 0, 'sellers must not see buyer enquiries');
    const reviewerView = await reviewer.client.from('enquiries').select('id').eq('asset_id', assetId);
    assert.equal(reviewerView.data.length, 0, 'reviewers must not see buyer enquiries');
    const adminView = await admin.client.from('enquiries').select('id').eq('asset_id', assetId);
    assert.equal(adminView.data.length, 2);
  });

  test('only administrators can change enquiry status, and only the status', async () => {
    const { data: rows } = await admin.client.from('enquiries').select('id').eq('asset_id', assetId).limit(1);
    const id = rows[0].id;
    await buyer.client.from('enquiries').update({ status: 'closed' }).eq('id', id);
    let check = await db.query('select status from public.enquiries where id = $1', [id]);
    assert.equal(check.rows[0].status, 'new');
    expectDenied(assert, await admin.client.from('enquiries').update({ email: 'changed@security.test' }).eq('id', id));
    assert.ifError((await admin.client.from('enquiries').update({ status: 'responded' }).eq('id', id)).error);
    check = await db.query('select status, handled_by from public.enquiries where id = $1', [id]);
    assert.equal(check.rows[0].status, 'responded');
    assert.equal(check.rows[0].handled_by, admin.id);
  });
});

describe('sold listings', () => {
  test('marking sold closes enquiries but keeps the listing visible as sold', async () => {
    assert.ifError((await admin.client.rpc('set_asset_status', { p_asset_id: assetId, p_status: 'sold' })).error);
    const pub = await anon.from('marketplace_listings').select('status, sold_at').eq('id', assetId).single();
    assert.equal(pub.data.status, 'sold');
    assert.ok(pub.data.sold_at);
    const e = await anon.rpc('submit_enquiry', {
      p_asset_id: assetId,
      p_name: 'Late Buyer',
      p_email: 'late@security.test',
      p_message: 'Is this still available? It should be refused as sold.',
      p_consent: true,
    });
    expectDenied(assert, e, ['22023']);
  });
});

describe('administration and audit', () => {
  test('role changes are admin-only and an admin cannot remove their own admin role', async () => {
    const target = await createUser('buyer');
    assert.ifError((await admin.client.rpc('set_user_role', { p_user_id: target.id, p_role: 'reviewer', p_grant: true })).error);
    assert.deepEqual(await roles(target.id), ['buyer', 'reviewer']);
    expectDenied(assert, await target.client.rpc('set_user_role', { p_user_id: target.id, p_role: 'admin', p_grant: true }));
    assert.ifError((await admin.client.rpc('set_user_role', { p_user_id: target.id, p_role: 'reviewer', p_grant: false })).error);
    assert.deepEqual(await roles(target.id), ['buyer']);
    expectDenied(assert, await admin.client.rpc('set_user_role', { p_user_id: admin.id, p_role: 'admin', p_grant: false }), ['22023']);
  });

  test('administrators can list users with emails; reviewers cannot', async () => {
    const { data, error } = await admin.client.rpc('admin_list_users');
    assert.ifError(error);
    assert.ok(data.some((u) => u.email === sellerA.email));
    expectDenied(assert, await reviewer.client.rpc('admin_list_users'));
  });

  test('the audit log records moderation and verification without confidential values', async () => {
    const { data, error } = await admin.client.from('audit_logs').select('action, entity_id, details').in('entity_id', [assetId, submissionId]);
    assert.ifError(error);
    const actions = data.map((r) => r.action);
    for (const expected of ['submission.review_started', 'submission.changes_requested', 'submission.approved', 'asset.status_changed', 'verification_records.insert']) {
      if (expected === 'verification_records.insert') continue; // keyed by record id
      assert.ok(actions.includes(expected), `missing audit action ${expected}`);
    }
    const serialised = JSON.stringify(data);
    for (const secret of ['Confidential Test Holdings Ltd', 'C-SECRET-123', 'LIC-SECRET-999']) {
      assert.ok(!serialised.includes(secret), `audit log leaked ${secret}`);
    }
    const verification = await db.query(`select count(*)::int as n from public.audit_logs where action = 'verification_records.insert' and details->>'asset_id' = $1`, [assetId]);
    assert.ok(verification.rows[0].n >= 1);
  });

  test('the audit log is append-only for everyone, including the database owner', async () => {
    expectDenied(assert, await admin.client.from('audit_logs').delete().gt('id', 0));
    await assert.rejects(db.query('update public.audit_logs set action = action where id = (select min(id) from public.audit_logs)'), /append-only/);
    await assert.rejects(db.query('delete from public.audit_logs where id = (select min(id) from public.audit_logs)'), /append-only/);
  });
});
