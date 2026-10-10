-- =============================================================================
-- Global Financial Assets: core schema
-- Tables, enums, constraints and indexes. Security (RLS, grants) is applied in
-- later migrations; nothing here is reachable by API roles until then.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- Internal helpers live in a schema that PostgREST does not expose.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Enumerations
-- -----------------------------------------------------------------------------
create type public.app_role as enum ('buyer', 'seller', 'reviewer', 'admin');

create type public.asset_status as enum (
  'draft', 'pending_review', 'approved', 'published', 'rejected', 'archived', 'sold'
);

create type public.verification_level as enum (
  'unverified', 'company_checked', 'regulator_record_checked', 'documents_reviewed'
);

create type public.transaction_type as enum (
  'full_acquisition', 'majority_stake', 'minority_stake', 'asset_purchase', 'merger', 'joint_venture'
);

create type public.operating_status as enum ('operating', 'pre_launch', 'dormant', 'licence_pending');

create type public.submission_status as enum (
  'draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected', 'withdrawn'
);

create type public.enquiry_status as enum ('new', 'in_review', 'responded', 'closed', 'spam');

create type public.mandate_status as enum ('active', 'paused', 'closed');

-- -----------------------------------------------------------------------------
-- Generic helpers
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.slugify(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

-- -----------------------------------------------------------------------------
-- Reference data
-- -----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  short_name text not null check (char_length(short_name) between 2 and 60),
  description text not null check (char_length(description) <= 600),
  long_description text check (char_length(long_description) <= 4000),
  icon text not null default 'building' check (icon ~ '^[a-z-]+$'),
  sort_order integer not null default 0,
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jurisdictions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  region text not null check (char_length(region) between 2 and 60),
  iso_code text check (iso_code ~ '^[A-Z]{2}$'),
  description text not null check (char_length(description) <= 1000),
  regulator_summary text check (char_length(regulator_summary) <= 1000),
  sort_order integer not null default 0,
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indicative FX rates used only to normalise asking prices for filtering/sorting.
create table public.currency_rates (
  currency text primary key check (currency ~ '^[A-Z]{3}$'),
  rate_to_eur numeric(18, 8) not null check (rate_to_eur > 0),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- People
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text check (char_length(full_name) <= 120),
  company_name text check (char_length(company_name) <= 160),
  job_title text check (char_length(job_title) <= 120),
  phone text check (char_length(phone) <= 30),
  country text check (char_length(country) <= 80),
  buyer_type text check (char_length(buyer_type) <= 40),
  investment_focus text check (char_length(investment_focus) <= 1000),
  marketing_opt_in boolean not null default false,
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Roles are kept in their own table (never on profiles) so that a user can
-- never grant themselves a privileged role by updating their own profile.
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index user_roles_user_id_idx on public.user_roles (user_id);

-- -----------------------------------------------------------------------------
-- Seller submissions (private working copy owned by the seller)
-- -----------------------------------------------------------------------------
create table public.seller_submissions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status public.submission_status not null default 'draft',
  title text not null check (char_length(title) between 3 and 160),
  category_id uuid references public.categories (id) on delete restrict,
  jurisdiction_id uuid references public.jurisdictions (id) on delete restrict,
  transaction_type public.transaction_type,
  operating_status public.operating_status,
  asking_price numeric(16, 2) check (asking_price is null or asking_price > 0),
  currency text not null default 'EUR' references public.currency_rates (currency),
  price_on_request boolean not null default false,
  summary text check (char_length(summary) <= 400),
  description text check (char_length(description) <= 10000),
  licence_type text check (char_length(licence_type) <= 200),
  regulator text check (char_length(regulator) <= 200),
  year_established integer check (year_established between 1800 and 2100),
  team_size text check (char_length(team_size) <= 60),
  revenue_range text check (char_length(revenue_range) <= 60),
  included_assets text[] not null default '{}' check (cardinality(included_assets) <= 30),
  highlights text[] not null default '{}' check (cardinality(highlights) <= 12),
  -- Confidential: never copied to the public listing.
  company_legal_name text check (char_length(company_legal_name) <= 200),
  registration_number text check (char_length(registration_number) <= 100),
  licence_number text check (char_length(licence_number) <= 100),
  reason_for_sale text check (char_length(reason_for_sale) <= 2000),
  contact_name text check (char_length(contact_name) <= 120),
  contact_email text check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  contact_phone text check (char_length(contact_phone) <= 30),
  seller_declaration boolean not null default false,
  -- Review outcome (written only by reviewers/administrators via functions).
  feedback_to_seller text check (char_length(feedback_to_seller) <= 4000),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  asset_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index seller_submissions_seller_idx on public.seller_submissions (seller_id, created_at desc);
create index seller_submissions_status_idx on public.seller_submissions (status, submitted_at desc);

-- -----------------------------------------------------------------------------
-- Assets (marketplace listings). Created only by administrators, usually by
-- approving a submission. Publication is controlled by status transitions.
-- -----------------------------------------------------------------------------
create sequence public.asset_reference_seq start 1001;

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default ('GFA-' || nextval('public.asset_reference_seq')::text),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 5 and 160),
  summary text not null check (char_length(summary) between 20 and 400),
  description text check (char_length(description) <= 10000),
  category_id uuid not null references public.categories (id) on delete restrict,
  jurisdiction_id uuid not null references public.jurisdictions (id) on delete restrict,
  transaction_type public.transaction_type not null,
  operating_status public.operating_status not null,
  asking_price numeric(16, 2) check (asking_price is null or asking_price > 0),
  currency text not null default 'EUR' references public.currency_rates (currency),
  price_on_request boolean not null default false,
  asking_price_eur numeric(18, 2),
  licence_type text check (char_length(licence_type) <= 200),
  regulator text check (char_length(regulator) <= 200),
  year_established integer check (year_established between 1800 and 2100),
  team_size text check (char_length(team_size) <= 60),
  revenue_range text check (char_length(revenue_range) <= 60),
  included_assets text[] not null default '{}' check (cardinality(included_assets) <= 30),
  highlights text[] not null default '{}' check (cardinality(highlights) <= 12),
  verification_status public.verification_level not null default 'unverified',
  verified_at timestamptz,
  status public.asset_status not null default 'draft',
  is_demo boolean not null default false,
  is_featured boolean not null default false,
  seller_id uuid references auth.users (id) on delete set null,
  submission_id uuid unique references public.seller_submissions (id) on delete set null,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  sold_at timestamptz,
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assets_price_or_por check (price_on_request or asking_price is not null),
  constraint assets_published_requires_approval check (
    status not in ('published', 'sold') or approved_at is not null
  )
);

alter table public.seller_submissions
  add constraint seller_submissions_asset_id_fkey
  foreign key (asset_id) references public.assets (id) on delete set null;

create index assets_status_published_idx on public.assets (status, published_at desc);
create index assets_category_idx on public.assets (category_id) where status in ('published', 'sold');
create index assets_jurisdiction_idx on public.assets (jurisdiction_id) where status in ('published', 'sold');
create index assets_price_idx on public.assets (asking_price_eur) where status in ('published', 'sold');
create index assets_seller_idx on public.assets (seller_id);
create index assets_search_idx on public.assets using gin (search_vector);

-- Confidential identifying details, separated from the listing so they can
-- never leak through the public listing surface.
create table public.asset_private_details (
  asset_id uuid primary key references public.assets (id) on delete cascade,
  company_legal_name text check (char_length(company_legal_name) <= 200),
  registration_number text check (char_length(registration_number) <= 100),
  licence_number text check (char_length(licence_number) <= 100),
  registered_address text check (char_length(registered_address) <= 500),
  contact_name text check (char_length(contact_name) <= 120),
  contact_email text check (char_length(contact_email) <= 254),
  contact_phone text check (char_length(contact_phone) <= 30),
  internal_notes text check (char_length(internal_notes) <= 5000),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Documents uploaded to private storage for a submission
-- -----------------------------------------------------------------------------
create table public.submission_documents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.seller_submissions (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (char_length(mime_type) <= 120),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  document_type text not null check (document_type in ('licence', 'corporate', 'financial', 'regulatory', 'other')),
  created_at timestamptz not null default now(),
  -- Objects must live under <owner>/<submission>/ so storage policies line up.
  constraint submission_documents_path_scope check (
    storage_path like owner_id::text || '/' || submission_id::text || '/%'
  )
);
create index submission_documents_submission_idx on public.submission_documents (submission_id);

-- -----------------------------------------------------------------------------
-- Staff-only notes (submissions, assets, enquiries)
-- -----------------------------------------------------------------------------
create table public.staff_notes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.seller_submissions (id) on delete cascade,
  asset_id uuid references public.assets (id) on delete cascade,
  enquiry_id uuid,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  constraint staff_notes_target check (num_nonnulls(submission_id, asset_id, enquiry_id) = 1)
);
create index staff_notes_submission_idx on public.staff_notes (submission_id);
create index staff_notes_asset_idx on public.staff_notes (asset_id);
create index staff_notes_enquiry_idx on public.staff_notes (enquiry_id);

-- -----------------------------------------------------------------------------
-- Buyer activity
-- -----------------------------------------------------------------------------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  buyer_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company text check (char_length(company) <= 160),
  phone text check (char_length(phone) <= 30),
  buyer_type text check (char_length(buyer_type) <= 40),
  message text not null check (char_length(message) between 20 and 3000),
  nda_requested boolean not null default false,
  consent boolean not null check (consent),
  status public.enquiry_status not null default 'new',
  handled_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index enquiries_asset_idx on public.enquiries (asset_id);
create index enquiries_buyer_idx on public.enquiries (buyer_id, created_at desc);
create index enquiries_status_idx on public.enquiries (status, created_at desc);
create index enquiries_email_recent_idx on public.enquiries (lower(email), created_at desc);

alter table public.staff_notes
  add constraint staff_notes_enquiry_id_fkey
  foreign key (enquiry_id) references public.enquiries (id) on delete cascade;

create table public.saved_listings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  asset_id uuid not null references public.assets (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, asset_id)
);
create index saved_listings_asset_idx on public.saved_listings (asset_id);

create table public.buyer_mandates (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160),
  category_ids uuid[] not null default '{}' check (cardinality(category_ids) <= 10),
  jurisdiction_ids uuid[] not null default '{}' check (cardinality(jurisdiction_ids) <= 40),
  transaction_types public.transaction_type[] not null default '{}',
  min_budget numeric(16, 2) check (min_budget is null or min_budget >= 0),
  max_budget numeric(16, 2) check (max_budget is null or max_budget > 0),
  currency text not null default 'EUR' references public.currency_rates (currency),
  timeline text check (char_length(timeline) <= 120),
  funding_source text check (char_length(funding_source) <= 200),
  requirements text check (char_length(requirements) <= 4000),
  status public.mandate_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_mandates_budget_range check (
    min_budget is null or max_budget is null or min_budget <= max_budget
  )
);
create index buyer_mandates_buyer_idx on public.buyer_mandates (buyer_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Verification records (append-only)
-- -----------------------------------------------------------------------------
create table public.verification_records (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  level public.verification_level not null,
  method text not null check (char_length(method) between 3 and 300),
  source_reference text check (char_length(source_reference) <= 500),
  notes text check (char_length(notes) <= 5000),
  reviewer_id uuid default auth.uid() references auth.users (id) on delete set null,
  checked_at timestamptz not null default now(),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index verification_records_asset_idx on public.verification_records (asset_id, checked_at desc);

-- -----------------------------------------------------------------------------
-- Audit log (append-only; written only by triggers and security-definer code)
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null check (char_length(action) <= 80),
  entity_type text not null check (char_length(entity_type) <= 80),
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- Admin-editable page metadata (SEO overrides by path)
-- -----------------------------------------------------------------------------
create table public.page_metadata (
  path text primary key check (path ~ '^/[a-z0-9/_-]*$' and char_length(path) <= 200),
  title text check (char_length(title) <= 120),
  description text check (char_length(description) <= 320),
  og_image_url text check (og_image_url is null or og_image_url ~ '^https://'),
  noindex boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users (id) on delete set null
);

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create trigger set_updated_at before update on public.categories
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.jurisdictions
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.currency_rates
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.seller_submissions
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.assets
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.asset_private_details
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.enquiries
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.buyer_mandates
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.page_metadata
  for each row execute function private.set_updated_at();
