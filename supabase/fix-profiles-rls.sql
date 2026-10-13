-- Run this in Supabase → SQL Editor (fixes the save error)

alter table public.profiles disable row level security;

-- Also backfill your user row if missing
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
