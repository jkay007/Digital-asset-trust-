-- =============================================================================
-- Row-level security, public view and least-privilege grants
--
-- Model
--   anon           : reads reference data and the public listing view; may call
--                    submit_enquiry / listing_counts. Nothing else.
--   buyer          : own profile, saved listings, enquiries, mandates.
--   seller         : own submissions, documents, and listings created from them.
--   reviewer       : reads submissions/listings, records verification, requests changes.
--   admin          : everything above plus approval, publication, roles, audit log.
-- Column grants restrict which fields API callers may write; guard triggers and
-- RLS enforce who may write them.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Public listing surface
-- Only published or sold listings, only whitelisted (non-confidential) columns.
-- The view runs with its owner's rights so anonymous visitors never need direct
-- access to the assets table. security_barrier prevents predicate push-down
-- from observing filtered rows.
-- -----------------------------------------------------------------------------
create view public.marketplace_listings
with (security_barrier = true)
as
select
  a.id,
  a.reference_code,
  a.slug,
  a.title,
  a.summary,
  a.description,
  a.category_id,
  c.slug as category_slug,
  c.name as category_name,
  a.jurisdiction_id,
  j.slug as jurisdiction_slug,
  j.name as jurisdiction_name,
  j.region as jurisdiction_region,
  a.transaction_type,
  a.operating_status,
  case when a.price_on_request then null else a.asking_price end as asking_price,
  a.currency,
  a.price_on_request,
  case when a.price_on_request then null else a.asking_price_eur end as asking_price_eur,
  a.licence_type,
  a.regulator,
  a.year_established,
  a.team_size,
  a.revenue_range,
  a.included_assets,
  a.highlights,
  a.verification_status,
  a.verified_at,
  a.status,
  a.is_demo,
  a.is_featured,
  a.published_at,
  a.sold_at,
  a.seo_title,
  a.seo_description,
  a.search_vector
from public.assets a
join public.categories c on c.id = a.category_id
join public.jurisdictions j on j.id = a.jurisdiction_id
where a.status in ('published', 'sold');

comment on view public.marketplace_listings is
  'Public, anonymised listing surface. Exposes only published/sold listings and non-confidential columns.';

-- -----------------------------------------------------------------------------
-- Enable RLS everywhere
-- -----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.jurisdictions enable row level security;
alter table public.currency_rates enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.seller_submissions enable row level security;
alter table public.assets enable row level security;
alter table public.asset_private_details enable row level security;
alter table public.submission_documents enable row level security;
alter table public.staff_notes enable row level security;
alter table public.enquiries enable row level security;
alter table public.saved_listings enable row level security;
alter table public.buyer_mandates enable row level security;
alter table public.verification_records enable row level security;
alter table public.audit_logs enable row level security;
alter table public.page_metadata enable row level security;

-- -----------------------------------------------------------------------------
-- Reference data: public read, admin write
-- -----------------------------------------------------------------------------
create policy "Categories are public" on public.categories
  for select to anon, authenticated using (true);
create policy "Admins insert categories" on public.categories
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update categories" on public.categories
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete categories" on public.categories
  for delete to authenticated using ((select private.is_admin()));

create policy "Jurisdictions are public" on public.jurisdictions
  for select to anon, authenticated using (true);
create policy "Admins insert jurisdictions" on public.jurisdictions
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update jurisdictions" on public.jurisdictions
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete jurisdictions" on public.jurisdictions
  for delete to authenticated using ((select private.is_admin()));

create policy "Currency rates are public" on public.currency_rates
  for select to anon, authenticated using (true);
create policy "Admins manage currency rates" on public.currency_rates
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Page metadata is public" on public.page_metadata
  for select to anon, authenticated using (true);
create policy "Admins insert page metadata" on public.page_metadata
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update page metadata" on public.page_metadata
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete page metadata" on public.page_metadata
  for delete to authenticated using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Profiles and roles
-- -----------------------------------------------------------------------------
create policy "Users read their own profile; admins read all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "Users update their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- No insert/update/delete policies: roles change only via set_user_role(),
-- add_self_service_role() and the sign-up trigger.
create policy "Users read their own roles; admins read all" on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Listings (base table). The public uses marketplace_listings instead.
-- -----------------------------------------------------------------------------
create policy "Staff read all listings; sellers read their own" on public.assets
  for select to authenticated
  using ((select private.is_staff()) or seller_id = (select auth.uid()));
create policy "Admins create listings" on public.assets
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins edit listing content" on public.assets
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete unpublished drafts" on public.assets
  for delete to authenticated using ((select private.is_admin()) and status in ('draft', 'rejected'));

create policy "Staff and the listing's seller read private details" on public.asset_private_details
  for select to authenticated
  using ((select private.is_staff()) or private.is_asset_seller(asset_id));
create policy "Admins insert private details" on public.asset_private_details
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update private details" on public.asset_private_details
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete private details" on public.asset_private_details
  for delete to authenticated using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Seller submissions and documents
-- -----------------------------------------------------------------------------
create policy "Sellers read their own submissions; staff read all" on public.seller_submissions
  for select to authenticated
  using (seller_id = (select auth.uid()) or (select private.is_staff()));
create policy "Sellers create submissions" on public.seller_submissions
  for insert to authenticated
  with check (
    seller_id = (select auth.uid())
    and private.has_role((select auth.uid()), 'seller')
    and status in ('draft', 'submitted')
  );
create policy "Sellers edit their own editable submissions" on public.seller_submissions
  for update to authenticated
  using (seller_id = (select auth.uid()) and status in ('draft', 'changes_requested'))
  with check (
    seller_id = (select auth.uid())
    and status in ('draft', 'changes_requested', 'submitted', 'withdrawn')
  );
create policy "Sellers delete their own drafts" on public.seller_submissions
  for delete to authenticated
  using (seller_id = (select auth.uid()) and status = 'draft');

create policy "Owners and staff read document records" on public.submission_documents
  for select to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_staff()));
create policy "Sellers attach documents to editable submissions" on public.submission_documents
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and private.can_edit_submission(submission_id));
create policy "Sellers remove documents from editable submissions" on public.submission_documents
  for delete to authenticated
  using (owner_id = (select auth.uid()) and private.can_edit_submission(submission_id));

-- -----------------------------------------------------------------------------
-- Staff notes: reviewers see submission/listing notes; enquiry notes are admin only.
-- -----------------------------------------------------------------------------
create policy "Staff read notes" on public.staff_notes
  for select to authenticated
  using ((select private.is_admin()) or ((select private.is_staff()) and enquiry_id is null));
create policy "Staff write notes" on public.staff_notes
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and ((select private.is_admin()) or ((select private.is_staff()) and enquiry_id is null))
  );

-- -----------------------------------------------------------------------------
-- Enquiries contain buyer personal data: visible to the buyer and admins only.
-- Created exclusively through submit_enquiry().
-- -----------------------------------------------------------------------------
create policy "Buyers read their own enquiries; admins read all" on public.enquiries
  for select to authenticated
  using (buyer_id = (select auth.uid()) or (select private.is_admin()));
create policy "Admins update enquiries" on public.enquiries
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete enquiries" on public.enquiries
  for delete to authenticated using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Saved listings and mandates
-- -----------------------------------------------------------------------------
create policy "Users read their saved listings" on public.saved_listings
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users save published listings" on public.saved_listings
  for insert to authenticated
  with check (user_id = (select auth.uid()) and private.is_public_asset(asset_id));
create policy "Users remove their saved listings" on public.saved_listings
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Buyers read their own mandates; admins read all" on public.buyer_mandates
  for select to authenticated
  using (buyer_id = (select auth.uid()) or (select private.is_admin()));
create policy "Buyers create mandates" on public.buyer_mandates
  for insert to authenticated
  with check (buyer_id = (select auth.uid()) and private.has_role((select auth.uid()), 'buyer'));
create policy "Buyers update their own mandates" on public.buyer_mandates
  for update to authenticated
  using (buyer_id = (select auth.uid())) with check (buyer_id = (select auth.uid()));
create policy "Buyers delete their own mandates" on public.buyer_mandates
  for delete to authenticated using (buyer_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Verification records: written only by authorised reviewers, never edited.
-- -----------------------------------------------------------------------------
create policy "Staff and the listing's seller read verification records" on public.verification_records
  for select to authenticated
  using ((select private.is_staff()) or private.is_asset_seller(asset_id));
create policy "Reviewers record verification" on public.verification_records
  for insert to authenticated
  with check ((select private.is_staff()) and reviewer_id = (select auth.uid()) and not is_demo);

-- -----------------------------------------------------------------------------
-- Audit log: administrators read; nobody writes through the API.
-- -----------------------------------------------------------------------------
create policy "Admins read the audit log" on public.audit_logs
  for select to authenticated using ((select private.is_admin()));

-- =============================================================================
-- Grants (least privilege). Supabase grants broad defaults on new tables; we
-- reset them and grant explicitly. service_role keeps full access.
-- =============================================================================
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public;

grant select on public.categories, public.jurisdictions, public.currency_rates, public.page_metadata,
  public.marketplace_listings to anon, authenticated;

grant insert, update, delete on public.categories, public.jurisdictions, public.page_metadata to authenticated;
grant update (rate_to_eur) on public.currency_rates to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, company_name, job_title, phone, country, buyer_type, investment_focus, marketing_opt_in)
  on public.profiles to authenticated;

grant select on public.user_roles to authenticated;

grant select, delete on public.assets to authenticated;
grant insert (
  title, summary, description, category_id, jurisdiction_id, transaction_type, operating_status, asking_price,
  currency, price_on_request, licence_type, regulator, year_established, team_size, revenue_range,
  included_assets, highlights, is_featured, seo_title, seo_description
) on public.assets to authenticated;
grant update (
  title, summary, description, category_id, jurisdiction_id, transaction_type, operating_status, asking_price,
  currency, price_on_request, licence_type, regulator, year_established, team_size, revenue_range,
  included_assets, highlights, is_featured, seo_title, seo_description
) on public.assets to authenticated;
grant usage on sequence public.asset_reference_seq to authenticated;

grant select, delete on public.asset_private_details to authenticated;
grant insert (
  asset_id, company_legal_name, registration_number, licence_number, registered_address, contact_name,
  contact_email, contact_phone, internal_notes
) on public.asset_private_details to authenticated;
grant update (
  company_legal_name, registration_number, licence_number, registered_address, contact_name, contact_email,
  contact_phone, internal_notes
) on public.asset_private_details to authenticated;

grant select, delete on public.seller_submissions to authenticated;
grant insert (
  status, title, category_id, jurisdiction_id, transaction_type, operating_status, asking_price, currency,
  price_on_request, summary, description, licence_type, regulator, year_established, team_size, revenue_range,
  included_assets, highlights, company_legal_name, registration_number, licence_number, reason_for_sale,
  contact_name, contact_email, contact_phone, seller_declaration
) on public.seller_submissions to authenticated;
grant update (
  status, title, category_id, jurisdiction_id, transaction_type, operating_status, asking_price, currency,
  price_on_request, summary, description, licence_type, regulator, year_established, team_size, revenue_range,
  included_assets, highlights, company_legal_name, registration_number, licence_number, reason_for_sale,
  contact_name, contact_email, contact_phone, seller_declaration
) on public.seller_submissions to authenticated;

grant select, delete on public.submission_documents to authenticated;
grant insert (submission_id, storage_path, file_name, mime_type, size_bytes, document_type)
  on public.submission_documents to authenticated;

grant select on public.staff_notes to authenticated;
grant insert (submission_id, asset_id, enquiry_id, body) on public.staff_notes to authenticated;

grant select, delete on public.enquiries to authenticated;
grant update (status) on public.enquiries to authenticated;

grant select, delete on public.saved_listings to authenticated;
grant insert (asset_id) on public.saved_listings to authenticated;

grant select, delete on public.buyer_mandates to authenticated;
grant insert (
  title, category_ids, jurisdiction_ids, transaction_types, min_budget, max_budget, currency, timeline,
  funding_source, requirements, status
) on public.buyer_mandates to authenticated;
grant update (
  title, category_ids, jurisdiction_ids, transaction_types, min_budget, max_budget, currency, timeline,
  funding_source, requirements, status
) on public.buyer_mandates to authenticated;

grant select on public.verification_records to authenticated;
grant insert (asset_id, level, method, source_reference, notes, checked_at)
  on public.verification_records to authenticated;

grant select on public.audit_logs to authenticated;

-- Functions callable through the API.
grant execute on function public.submit_enquiry(uuid, text, text, text, boolean, text, text, text, boolean)
  to anon, authenticated;
grant execute on function public.listing_counts() to anon, authenticated;
grant execute on function public.add_self_service_role(public.app_role) to authenticated;
grant execute on function public.withdraw_submission(uuid) to authenticated;
grant execute on function public.start_submission_review(uuid) to authenticated;
grant execute on function public.request_submission_changes(uuid, text) to authenticated;
grant execute on function public.reject_submission(uuid, text) to authenticated;
grant execute on function public.approve_submission(uuid, text) to authenticated;
grant execute on function public.set_asset_status(uuid, public.asset_status, text) to authenticated;
grant execute on function public.set_user_role(uuid, public.app_role, boolean) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- Private helpers are referenced by policies and must be executable by API
-- roles; the private schema itself is not exposed through the REST API.
grant execute on function private.has_role(uuid, public.app_role) to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_staff() to anon, authenticated;
grant execute on function private.is_api_caller() to anon, authenticated;
grant execute on function private.is_public_asset(uuid) to anon, authenticated;
grant execute on function private.is_asset_seller(uuid) to anon, authenticated;
grant execute on function private.can_edit_submission(uuid) to anon, authenticated;
grant execute on function private.can_upload_document(text) to anon, authenticated;
grant execute on function private.slugify(text) to anon, authenticated;
grant execute on function private.assert_submission_complete(public.seller_submissions) to authenticated;

-- Future objects created in public must be granted explicitly.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
