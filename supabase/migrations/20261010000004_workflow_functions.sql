-- =============================================================================
-- Workflow functions (RPC)
-- Every function re-checks the caller's role; the UI is never trusted.
-- =============================================================================

create or replace function private.require_staff()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_staff() then
    raise exception 'Not authorised: reviewer or administrator role required' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Not authorised: administrator role required' using errcode = '42501';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Public: confidential enquiry (anonymous or signed-in)
-- -----------------------------------------------------------------------------
create or replace function public.submit_enquiry(
  p_asset_id uuid,
  p_name text,
  p_email text,
  p_message text,
  p_consent boolean,
  p_company text default null,
  p_phone text default null,
  p_buyer_type text default null,
  p_nda_requested boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_asset public.assets;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := trim(coalesce(p_name, ''));
  v_message text := trim(coalesce(p_message, ''));
  v_id uuid;
begin
  if p_consent is distinct from true then
    raise exception 'Please confirm you agree to the privacy notice before sending an enquiry' using errcode = '22023';
  end if;

  select * into v_asset from public.assets where id = p_asset_id;
  if not found or v_asset.status <> 'published' then
    raise exception 'This listing is not currently accepting enquiries' using errcode = '22023';
  end if;
  if v_asset.is_demo then
    raise exception 'Enquiries are disabled for demo listings' using errcode = '22023';
  end if;

  if char_length(v_name) not between 2 and 120 then
    raise exception 'Please enter your full name' using errcode = '22023';
  end if;
  if char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address' using errcode = '22023';
  end if;
  if char_length(v_message) not between 20 and 3000 then
    raise exception 'Your message must be between 20 and 3,000 characters' using errcode = '22023';
  end if;
  if p_buyer_type is not null and p_buyer_type not in (
    'strategic', 'private_equity', 'family_office', 'financial_institution', 'entrepreneur', 'advisor', 'other'
  ) then
    raise exception 'Unknown buyer type' using errcode = '22023';
  end if;

  -- Throttling (defence against abuse of an anonymous endpoint).
  if exists (
    select 1 from public.enquiries e
     where e.asset_id = p_asset_id and lower(e.email) = v_email and e.created_at > now() - interval '24 hours'
  ) then
    raise exception 'You have already sent an enquiry about this listing in the last 24 hours' using errcode = 'P0001';
  end if;
  if (select count(*) from public.enquiries e
       where lower(e.email) = v_email and e.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many enquiries from this email address. Please try again later' using errcode = 'P0001';
  end if;
  if auth.uid() is null and (select count(*) from public.enquiries e
       where e.buyer_id is null and e.created_at > now() - interval '1 minute') >= 30 then
    raise exception 'The enquiry service is busy. Please try again in a minute' using errcode = 'P0001';
  end if;

  insert into public.enquiries (
    asset_id, buyer_id, name, email, company, phone, buyer_type, message, nda_requested, consent
  ) values (
    p_asset_id,
    auth.uid(),
    v_name,
    v_email,
    left(nullif(trim(p_company), ''), 160),
    left(nullif(trim(p_phone), ''), 30),
    p_buyer_type,
    v_message,
    coalesce(p_nda_requested, false),
    true
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Public: published listing counts per category / jurisdiction
-- -----------------------------------------------------------------------------
create or replace function public.listing_counts()
returns table (kind text, ref_id uuid, listing_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select 'category'::text, a.category_id, count(*)
    from public.assets a where a.status = 'published' group by a.category_id
  union all
  select 'jurisdiction'::text, a.jurisdiction_id, count(*)
    from public.assets a where a.status = 'published' group by a.jurisdiction_id;
$$;

-- -----------------------------------------------------------------------------
-- Self-service
-- -----------------------------------------------------------------------------
create or replace function public.add_self_service_role(p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  if p_role not in ('buyer', 'seller') then
    raise exception 'Only buyer or seller access can be requested' using errcode = '42501';
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), p_role)
  on conflict (user_id, role) do nothing;
end;
$$;

create or replace function public.withdraw_submission(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.seller_submissions
     set status = 'withdrawn'
   where id = p_submission_id
     and seller_id = auth.uid()
     and status in ('draft', 'submitted', 'under_review', 'changes_requested');
  if not found then
    raise exception 'This submission cannot be withdrawn' using errcode = '22023';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Moderation: submissions
-- -----------------------------------------------------------------------------
create or replace function public.start_submission_review(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  update public.seller_submissions
     set status = 'under_review', reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_submission_id and status = 'submitted';
  if not found then
    raise exception 'Only submitted submissions can be moved into review' using errcode = '22023';
  end if;
  perform private.write_audit('submission.review_started', 'seller_submissions', p_submission_id::text);
end;
$$;

create or replace function public.request_submission_changes(p_submission_id uuid, p_feedback text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  if char_length(trim(coalesce(p_feedback, ''))) < 10 then
    raise exception 'Please explain the changes required (at least 10 characters)' using errcode = '22023';
  end if;
  update public.seller_submissions
     set status = 'changes_requested',
         feedback_to_seller = left(trim(p_feedback), 4000),
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where id = p_submission_id and status in ('submitted', 'under_review');
  if not found then
    raise exception 'Changes can only be requested on submissions awaiting review' using errcode = '22023';
  end if;
  perform private.write_audit('submission.changes_requested', 'seller_submissions', p_submission_id::text);
end;
$$;

create or replace function public.reject_submission(p_submission_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_admin();
  if char_length(trim(coalesce(p_reason, ''))) < 10 then
    raise exception 'Please give a reason for rejection (at least 10 characters)' using errcode = '22023';
  end if;
  update public.seller_submissions
     set status = 'rejected',
         feedback_to_seller = left(trim(p_reason), 4000),
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where id = p_submission_id and status in ('submitted', 'under_review', 'changes_requested');
  if not found then
    raise exception 'This submission cannot be rejected in its current state' using errcode = '22023';
  end if;
  perform private.write_audit('submission.rejected', 'seller_submissions', p_submission_id::text);
end;
$$;

-- Approving a submission creates an UNPUBLISHED listing (status 'approved').
-- Publication is a separate, explicit administrator action.
create or replace function public.approve_submission(p_submission_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.seller_submissions;
  v_asset_id uuid;
begin
  perform private.require_admin();

  select * into s from public.seller_submissions where id = p_submission_id for update;
  if not found then
    raise exception 'Submission not found' using errcode = '22023';
  end if;
  if s.status not in ('submitted', 'under_review') then
    raise exception 'Only submissions awaiting review can be approved (current status: %)', s.status
      using errcode = '22023';
  end if;
  perform private.assert_submission_complete(s);

  insert into public.assets (
    title, summary, description, category_id, jurisdiction_id, transaction_type, operating_status,
    asking_price, currency, price_on_request, licence_type, regulator, year_established, team_size,
    revenue_range, included_assets, highlights, status, seller_id, submission_id, approved_by, approved_at
  ) values (
    s.title, s.summary, s.description, s.category_id, s.jurisdiction_id, s.transaction_type, s.operating_status,
    case when s.price_on_request then null else s.asking_price end, s.currency, s.price_on_request,
    s.licence_type, s.regulator, s.year_established, s.team_size, s.revenue_range,
    s.included_assets, s.highlights, 'approved', s.seller_id, s.id, auth.uid(), now()
  )
  returning id into v_asset_id;

  insert into public.asset_private_details (
    asset_id, company_legal_name, registration_number, licence_number, contact_name, contact_email, contact_phone
  ) values (
    v_asset_id, s.company_legal_name, s.registration_number, s.licence_number, s.contact_name, s.contact_email,
    s.contact_phone
  );

  update public.seller_submissions
     set status = 'approved', asset_id = v_asset_id, reviewed_by = auth.uid(), reviewed_at = now()
   where id = s.id;

  if nullif(trim(coalesce(p_note, '')), '') is not null then
    insert into public.staff_notes (submission_id, author_id, body) values (s.id, auth.uid(), left(trim(p_note), 5000));
  end if;

  perform private.write_audit('submission.approved', 'seller_submissions', s.id::text,
    jsonb_build_object('asset_id', v_asset_id));
  return v_asset_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Moderation: listing lifecycle
--   draft / pending_review -> approved -> published -> sold / archived
-- Publishing requires a recorded administrator approval.
-- -----------------------------------------------------------------------------
create or replace function public.set_asset_status(
  p_asset_id uuid,
  p_status public.asset_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.assets;
  allowed public.asset_status[];
  approving boolean;
  revoking boolean;
begin
  perform private.require_admin();

  select * into a from public.assets where id = p_asset_id for update;
  if not found then
    raise exception 'Listing not found' using errcode = '22023';
  end if;
  if a.status = p_status then
    return;
  end if;

  allowed := case a.status
    when 'draft' then array['pending_review', 'approved', 'rejected']::public.asset_status[]
    when 'pending_review' then array['draft', 'approved', 'rejected']::public.asset_status[]
    when 'approved' then array['published', 'archived', 'rejected', 'draft']::public.asset_status[]
    when 'published' then array['approved', 'archived', 'sold']::public.asset_status[]
    when 'archived' then array['approved', 'published']::public.asset_status[]
    when 'sold' then array['published', 'archived']::public.asset_status[]
    when 'rejected' then array['draft', 'pending_review']::public.asset_status[]
  end;

  if not (p_status = any (allowed)) then
    raise exception 'A listing cannot move from % to %', a.status, p_status using errcode = '22023';
  end if;

  approving := p_status = 'approved' and a.status in ('draft', 'pending_review', 'rejected');
  revoking := p_status in ('draft', 'pending_review', 'rejected');

  if p_status = 'published' and a.approved_at is null then
    raise exception 'A listing must be approved by an administrator before it can be published' using errcode = '22023';
  end if;

  update public.assets
     set status = p_status,
         approved_by = case when approving then auth.uid() when revoking then null else approved_by end,
         approved_at = case when approving then now() when revoking then null else approved_at end,
         published_at = case when p_status = 'published' then coalesce(published_at, now()) else published_at end,
         archived_at = case when p_status = 'archived' then now() else archived_at end,
         sold_at = case when p_status = 'sold' then now() when p_status = 'published' then null else sold_at end
   where id = p_asset_id;

  perform private.write_audit('asset.status_changed', 'assets', p_asset_id::text,
    jsonb_build_object('from', a.status, 'to', p_status, 'note', nullif(left(trim(coalesce(p_note, '')), 500), '')));
end;
$$;

-- -----------------------------------------------------------------------------
-- Administration: roles and users
-- -----------------------------------------------------------------------------
create or replace function public.set_user_role(p_user_id uuid, p_role public.app_role, p_grant boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_admin();
  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'User not found' using errcode = '22023';
  end if;
  if p_user_id = auth.uid() and p_role = 'admin' and not p_grant then
    raise exception 'You cannot remove your own administrator role' using errcode = '22023';
  end if;
  if p_grant then
    insert into public.user_roles (user_id, role, granted_by) values (p_user_id, p_role, auth.uid())
    on conflict (user_id, role) do nothing;
  else
    delete from public.user_roles where user_id = p_user_id and role = p_role;
  end if;
  perform private.write_audit(case when p_grant then 'role.granted' else 'role.revoked' end, 'user', p_user_id::text,
    jsonb_build_object('role', p_role));
end;
$$;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  company_name text,
  roles public.app_role[],
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.require_admin();
  return query
    select u.id,
           u.email::text,
           p.full_name,
           p.company_name,
           coalesce(array_agg(r.role order by r.role) filter (where r.role is not null), '{}'::public.app_role[]),
           u.created_at,
           u.last_sign_in_at
      from auth.users u
      left join public.profiles p on p.id = u.id
      left join public.user_roles r on r.user_id = u.id
     group by u.id, u.email, p.full_name, p.company_name, u.created_at, u.last_sign_in_at
     order by u.created_at desc;
end;
$$;

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_staff();
  select jsonb_build_object(
    'submissions', coalesce((select jsonb_object_agg(status, n) from (
        select s.status, count(*) as n from public.seller_submissions s group by s.status) x), '{}'::jsonb),
    'assets', coalesce((select jsonb_object_agg(status, n) from (
        select a.status, count(*) as n from public.assets a group by a.status) y), '{}'::jsonb),
    'enquiries_new', case when private.is_admin()
        then (select count(*) from public.enquiries e where e.status = 'new') end,
    'mandates_active', case when private.is_admin()
        then (select count(*) from public.buyer_mandates m where m.status = 'active') end,
    'users', case when private.is_admin() then (select count(*) from auth.users) end
  ) into result;
  return result;
end;
$$;
