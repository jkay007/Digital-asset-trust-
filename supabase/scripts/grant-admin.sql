-- Bootstrap the first administrator. Run once from the Supabase SQL editor or
-- psql with a privileged connection after the person has signed up:
--   psql "$DATABASE_URL" -v email="'owner@example.com'" -f supabase/scripts/grant-admin.sql
-- Subsequent roles should be granted from the admin console (Users), which
-- calls public.set_user_role() and is fully audited.
insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
  from auth.users u
 where lower(u.email) = lower(:email)
on conflict (user_id, role) do nothing;

insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
select null, 'role.bootstrap_admin', 'user', u.id::text, jsonb_build_object('role', 'admin')
  from auth.users u
 where lower(u.email) = lower(:email);
