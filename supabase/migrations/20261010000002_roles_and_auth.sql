-- =============================================================================
-- Roles and authentication hooks
-- =============================================================================

-- Role checks used by RLS policies and functions. SECURITY DEFINER so that the
-- lookup itself is not subject to user_roles RLS (avoids recursion), and kept in
-- the private schema so it is not callable through the REST API.
create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur where ur.user_id = _user_id and ur.role = _role
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role(auth.uid(), 'admin');
$$;

-- Staff = reviewers and administrators.
create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin', 'reviewer')
  );
$$;

-- True when the caller is executing through the REST/API roles rather than as
-- the database owner, a migration, or a security-definer function.
create or replace function private.is_api_caller()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('anon', 'authenticated');
$$;

-- Asset visibility helpers for policies on other tables (bypass assets RLS).
create or replace function private.is_public_asset(_asset_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.assets a where a.id = _asset_id and a.status in ('published', 'sold')
  );
$$;

create or replace function private.is_asset_seller(_asset_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.assets a where a.id = _asset_id and a.seller_id = auth.uid()
  );
$$;

-- A seller may attach documents only to their own submission while it is editable.
create or replace function private.can_edit_submission(_submission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.seller_submissions s
    where s.id = _submission_id
      and s.seller_id = auth.uid()
      and s.status in ('draft', 'changes_requested')
  );
$$;

-- Same check for storage object paths "<uid>/<submission_id>/<file>".
create or replace function private.can_upload_document(_object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  parts text[] := string_to_array(_object_name, '/');
  sid uuid;
begin
  if auth.uid() is null or array_length(parts, 1) <> 3 then
    return false;
  end if;
  if parts[1] <> auth.uid()::text then
    return false;
  end if;
  begin
    sid := parts[2]::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  return private.can_edit_submission(sid);
end;
$$;

-- -----------------------------------------------------------------------------
-- New user hook: create profile and assign a self-service role.
-- Only 'buyer' or 'seller' can ever be requested at sign-up. Reviewer and admin
-- roles can only be granted by an existing administrator (see set_user_role).
-- -----------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested text := lower(coalesce(meta ->> 'account_type', 'buyer'));
  buyer_type text := meta ->> 'buyer_type';
begin
  if buyer_type is not null and buyer_type not in (
    'strategic', 'private_equity', 'family_office', 'financial_institution', 'entrepreneur', 'advisor', 'other'
  ) then
    buyer_type := null;
  end if;

  insert into public.profiles (id, email, full_name, company_name, job_title, country, buyer_type, accepted_terms_at)
  values (
    new.id,
    new.email,
    left(nullif(trim(meta ->> 'full_name'), ''), 120),
    left(nullif(trim(meta ->> 'company_name'), ''), 160),
    left(nullif(trim(meta ->> 'job_title'), ''), 120),
    left(nullif(trim(meta ->> 'country'), ''), 80),
    buyer_type,
    case when (meta ->> 'accepted_terms') = 'true' then now() end
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, case when requested = 'seller' then 'seller'::public.app_role else 'buyer'::public.app_role end)
  on conflict (user_id, role) do nothing;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (new.id, 'user.registered', 'user', new.id::text,
          jsonb_build_object('account_type', case when requested = 'seller' then 'seller' else 'buyer' end));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function private.handle_user_email_change();
