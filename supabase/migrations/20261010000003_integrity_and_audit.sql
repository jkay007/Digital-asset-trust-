-- =============================================================================
-- Integrity triggers and audit trail
--
-- Guard triggers are SECURITY INVOKER so that `current_user` reflects the API
-- role. Requests arriving as `anon` / `authenticated` are held to the strict
-- rules below; trusted code paths (migrations, the service role and the
-- security-definer moderation functions) run as the table owner.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Audit helper
-- -----------------------------------------------------------------------------
create or replace function private.write_audit(
  _action text,
  _entity_type text,
  _entity_id text,
  _details jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), _action, _entity_type, _entity_id, coalesce(_details, '{}'::jsonb));
$$;

-- Generic row audit. Records which columns changed; values are recorded only
-- for non-sensitive workflow fields so confidential data is never copied into
-- the log.
create or replace function private.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_keys constant text[] := array[
    'status', 'verification_status', 'verified_at', 'is_featured', 'approved_at', 'published_at',
    'archived_at', 'sold_at', 'asking_price', 'currency', 'price_on_request', 'title', 'slug', 'role',
    'level', 'noindex', 'transaction_type', 'operating_status', 'category_id', 'jurisdiction_id',
    'asset_id', 'submission_id', 'user_id', 'reference_code', 'document_type', 'file_name', 'path'
  ];
  rec jsonb;
  old_rec jsonb;
  changed text[];
  details jsonb := '{}'::jsonb;
  k text;
begin
  if tg_op = 'DELETE' then
    rec := to_jsonb(old);
  else
    rec := to_jsonb(new);
  end if;

  if tg_op = 'UPDATE' then
    old_rec := to_jsonb(old);
    select array_agg(e.key order by e.key)
      into changed
      from jsonb_each(rec) e
     where e.key not in ('updated_at', 'search_vector', 'asking_price_eur')
       and e.value is distinct from old_rec -> e.key;
    if changed is null then
      return null;
    end if;
    details := jsonb_build_object('changed', to_jsonb(changed));
    foreach k in array changed loop
      if k = any (safe_keys) then
        details := details || jsonb_build_object(k, jsonb_build_object('from', old_rec -> k, 'to', rec -> k));
      end if;
    end loop;
  else
    foreach k in array safe_keys loop
      if rec ? k then
        details := details || jsonb_build_object(k, rec -> k);
      end if;
    end loop;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'path', rec ->> 'asset_id', rec ->> 'currency'),
    details
  );
  return null;
end;
$$;

-- -----------------------------------------------------------------------------
-- Assets
-- -----------------------------------------------------------------------------
create or replace function private.assets_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  rate numeric;
  cat_name text;
  jur_text text;
begin
  if private.is_api_caller() then
    if tg_op = 'INSERT' then
      -- Listings created through the API always start unpublished and unverified.
      new.status := 'draft';
      new.verification_status := 'unverified';
      new.verified_at := null;
      new.approved_by := null;
      new.approved_at := null;
      new.published_at := null;
      new.archived_at := null;
      new.sold_at := null;
      new.is_demo := false;
      new.seller_id := null;
      new.submission_id := null;
    elsif new.status is distinct from old.status
       or new.verification_status is distinct from old.verification_status
       or new.verified_at is distinct from old.verified_at
       or new.approved_by is distinct from old.approved_by
       or new.approved_at is distinct from old.approved_at
       or new.published_at is distinct from old.published_at
       or new.archived_at is distinct from old.archived_at
       or new.sold_at is distinct from old.sold_at
       or new.is_demo is distinct from old.is_demo
       or new.seller_id is distinct from old.seller_id
       or new.submission_id is distinct from old.submission_id
       or new.reference_code is distinct from old.reference_code
       or new.slug is distinct from old.slug then
      raise exception 'Listing status, approval and verification can only be changed through moderation functions'
        using errcode = '42501';
    end if;
  end if;

  if new.slug is null or new.slug = '' then
    new.slug := left(private.slugify(new.title), 70) || '-' || lower(new.reference_code);
  end if;

  if new.price_on_request then
    new.asking_price := null;
  end if;
  if new.asking_price is null then
    new.asking_price_eur := null;
  else
    select r.rate_to_eur into rate from public.currency_rates r where r.currency = new.currency;
    new.asking_price_eur := round(new.asking_price * coalesce(rate, 1), 2);
  end if;

  select c.name into cat_name from public.categories c where c.id = new.category_id;
  select j.name || ' ' || j.region into jur_text from public.jurisdictions j where j.id = new.jurisdiction_id;

  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english',
      coalesce(new.reference_code, '') || ' ' || coalesce(new.licence_type, '') || ' ' ||
      coalesce(new.regulator, '') || ' ' || coalesce(cat_name, '') || ' ' || coalesce(jur_text, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.summary, '')), 'C') ||
    setweight(to_tsvector('english',
      coalesce(new.description, '') || ' ' || array_to_string(new.highlights, ' ') || ' ' ||
      array_to_string(new.included_assets, ' ')), 'D');

  return new;
end;
$$;

create trigger assets_before_write
  before insert or update on public.assets
  for each row execute function private.assets_before_write();

create trigger audit_assets
  after insert or update or delete on public.assets
  for each row execute function private.audit_row();

create trigger audit_asset_private_details
  after insert or update or delete on public.asset_private_details
  for each row execute function private.audit_row();

-- -----------------------------------------------------------------------------
-- Seller submissions
-- -----------------------------------------------------------------------------
create or replace function private.assert_submission_complete(s public.seller_submissions)
returns void
language plpgsql
set search_path = ''
as $$
declare
  missing text[] := '{}';
begin
  if char_length(coalesce(trim(s.title), '')) < 5 then missing := missing || 'a title of at least 5 characters'; end if;
  if s.category_id is null then missing := missing || 'a category'; end if;
  if s.jurisdiction_id is null then missing := missing || 'a jurisdiction'; end if;
  if s.transaction_type is null then missing := missing || 'a transaction type'; end if;
  if s.operating_status is null then missing := missing || 'an operating status'; end if;
  if char_length(coalesce(trim(s.summary), '')) < 20 then missing := missing || 'a summary of at least 20 characters'; end if;
  if not s.price_on_request and s.asking_price is null then missing := missing || 'an asking price or "price on request"'; end if;
  if coalesce(trim(s.company_legal_name), '') = '' then missing := missing || 'the company legal name'; end if;
  if coalesce(trim(s.contact_email), '') = '' then missing := missing || 'a contact email'; end if;
  if not s.seller_declaration then missing := missing || 'the seller declaration'; end if;
  if cardinality(missing) > 0 then
    raise exception 'Submission is incomplete. Please provide %.', array_to_string(missing, ', ')
      using errcode = '22023';
  end if;
end;
$$;

create or replace function private.seller_submissions_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_api_caller() then
    if tg_op = 'INSERT' then
      new.seller_id := auth.uid();
      new.feedback_to_seller := null;
      new.reviewed_at := null;
      new.reviewed_by := null;
      new.asset_id := null;
      new.submitted_at := null;
      if new.status not in ('draft', 'submitted') then
        raise exception 'New submissions must be drafts or submitted for review' using errcode = '42501';
      end if;
    else
      if new.seller_id is distinct from old.seller_id
         or new.feedback_to_seller is distinct from old.feedback_to_seller
         or new.reviewed_at is distinct from old.reviewed_at
         or new.reviewed_by is distinct from old.reviewed_by
         or new.asset_id is distinct from old.asset_id
         or new.submitted_at is distinct from old.submitted_at then
        raise exception 'Review fields can only be changed by reviewers' using errcode = '42501';
      end if;
      if new.status is distinct from old.status and new.status not in ('draft', 'submitted', 'withdrawn') then
        raise exception 'Sellers cannot move a submission to %', new.status using errcode = '42501';
      end if;
    end if;
  end if;

  if new.status = 'submitted' and (tg_op = 'INSERT' or old.status is distinct from 'submitted') then
    perform private.assert_submission_complete(new);
    new.submitted_at := now();
  end if;
  return new;
end;
$$;

create trigger seller_submissions_before_write
  before insert or update on public.seller_submissions
  for each row execute function private.seller_submissions_before_write();

create trigger audit_seller_submissions
  after insert or update or delete on public.seller_submissions
  for each row execute function private.audit_row();

create trigger audit_submission_documents
  after insert or delete on public.submission_documents
  for each row execute function private.audit_row();

-- -----------------------------------------------------------------------------
-- Verification records: append-only, reviewer attributed, drive asset state.
-- -----------------------------------------------------------------------------
create or replace function private.verification_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_api_caller() then
    new.reviewer_id := auth.uid();
    new.is_demo := false;
    new.created_at := now();
    if new.checked_at > now() + interval '5 minutes' then
      raise exception 'A verification date cannot be in the future' using errcode = '22023';
    end if;
  end if;
  if not new.is_demo and new.reviewer_id is null then
    raise exception 'A verification record must identify the reviewer' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger verification_before_insert
  before insert on public.verification_records
  for each row execute function private.verification_before_insert();

create or replace function private.sync_asset_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  latest public.verification_records;
begin
  select * into latest
    from public.verification_records v
   where v.asset_id = new.asset_id
   order by v.checked_at desc, v.created_at desc
   limit 1;

  update public.assets a
     set verification_status = latest.level,
         verified_at = case when latest.level = 'unverified' then null else latest.checked_at end
   where a.id = new.asset_id;
  return null;
end;
$$;

create trigger verification_sync_asset
  after insert on public.verification_records
  for each row execute function private.sync_asset_verification();

create or replace function private.prevent_modification()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% records are append-only', tg_table_name using errcode = '42501';
end;
$$;

create trigger verification_records_append_only
  before update or delete on public.verification_records
  for each row when (current_user in ('anon', 'authenticated'))
  execute function private.prevent_modification();

create trigger audit_logs_append_only
  before update or delete on public.audit_logs
  for each row execute function private.prevent_modification();

create trigger audit_verification_records
  after insert on public.verification_records
  for each row execute function private.audit_row();

-- -----------------------------------------------------------------------------
-- Enquiries, roles, reference data, metadata
-- -----------------------------------------------------------------------------
create or replace function private.enquiries_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.handled_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger enquiries_before_update
  before update on public.enquiries
  for each row execute function private.enquiries_before_update();

create trigger audit_enquiries
  after insert or update or delete on public.enquiries
  for each row execute function private.audit_row();

create trigger audit_user_roles
  after insert or delete on public.user_roles
  for each row execute function private.audit_row();

create trigger audit_buyer_mandates
  after insert or update or delete on public.buyer_mandates
  for each row execute function private.audit_row();

create or replace function private.page_metadata_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger page_metadata_before_write
  before insert or update on public.page_metadata
  for each row execute function private.page_metadata_before_write();

create trigger audit_page_metadata
  after insert or update or delete on public.page_metadata
  for each row execute function private.audit_row();

create trigger audit_categories
  after insert or update or delete on public.categories
  for each row execute function private.audit_row();

create trigger audit_jurisdictions
  after insert or update or delete on public.jurisdictions
  for each row execute function private.audit_row();

create trigger audit_currency_rates
  after insert or update or delete on public.currency_rates
  for each row execute function private.audit_row();

create trigger audit_staff_notes
  after insert on public.staff_notes
  for each row execute function private.audit_row();
