-- Removes every DEMO listing and its dependent rows (verification records,
-- saved listings and enquiries cascade). Run with a privileged connection, e.g.
--   psql "$DATABASE_URL" -f supabase/scripts/remove-demo-data.sql
begin;
delete from public.assets where is_demo;
insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
values (null, 'demo_data.removed', 'assets', null, '{}'::jsonb);
commit;
