-- Emergency Supabase security fix for advisory: rls_disabled_in_public
-- Project: Natural writing (bwdnmwbdfontihocsldj)
--
-- What this does:
-- 1. Enables Row-Level Security on every base/partitioned table in public.
-- 2. Removes direct table/sequence privileges from anon and authenticated roles.
-- 3. Leaves FORCE ROW LEVEL SECURITY disabled so backend/admin/service-role access
--    can continue to work through privileged Postgres connections.
--
-- Run this in Supabase SQL Editor, then re-run the Security Advisor.

begin;

do $$
declare
  public_table record;
begin
  for public_table in
    select
      n.nspname as schema_name,
      c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relname not in ('spatial_ref_sys')
    order by c.relname
  loop
    execute format(
      'alter table %I.%I enable row level security',
      public_table.schema_name,
      public_table.table_name
    );
  end loop;
end $$;

revoke all privileges on all tables in schema public from anon;
revoke all privileges on all tables in schema public from authenticated;
revoke all privileges on all sequences in schema public from anon;
revoke all privileges on all sequences in schema public from authenticated;

commit;

notify pgrst, 'reload schema';

-- Verification query:
-- select schemaname, tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;
