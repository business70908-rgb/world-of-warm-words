-- ============================================================
-- Server key authentication
-- Run this in YOUR Supabase project: Dashboard -> SQL Editor.
--
-- The key lives in public.server_config and is editable there
-- (Table Editor or SQL). The app never reads the raw key: it
-- calls validate_server_key(entered_key) which only returns
-- true/false, so the real key is never exposed to clients.
-- ============================================================

-- 1. Table holding the current server key (single row, id = 1)
create table if not exists public.server_config (
  id int primary key default 1 check (id = 1),
  server_key text not null,
  updated_at timestamptz not null default now()
);

-- 2. Lock the table down: only the dashboard / service role can
--    read or edit it. No anon/authenticated access at all.
revoke all on public.server_config from anon, authenticated;
grant all on public.server_config to service_role;
alter table public.server_config enable row level security;
-- (intentionally no policies: only service role / dashboard)

-- Keep updated_at fresh when the key is edited
create or replace function public.touch_server_config()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists server_config_touch on public.server_config;
create trigger server_config_touch
  before update on public.server_config
  for each row execute function public.touch_server_config();

-- 3. Validation function: returns true only when the submitted
--    key matches the key stored in the table.
create or replace function public.validate_server_key(entered_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.server_config
    where server_key = entered_key
  );
$$;

revoke all on function public.validate_server_key(text) from public, anon, authenticated;
grant execute on function public.validate_server_key(text) to anon, authenticated;

-- 4. Initial row. Replace 'CHANGE-ME' with the key you want to
--    use, or edit it later in Table Editor -> server_config.
insert into public.server_config (id, server_key)
values (1, 'CHANGE-ME')
on conflict (id) do update set server_key = excluded.server_key;
