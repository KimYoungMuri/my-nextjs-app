-- Weekend Caps: AI generations + votes + strict RLS
-- Run in Supabase → SQL Editor

-- 1) Generations (AI captions + the prompt used)
create table if not exists public.generations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  caption text not null,
  created_at timestamptz not null default now()
);

-- 2) Votes (one vote per user per generation)
create table if not exists public.votes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_id bigint not null references public.generations (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (user_id, generation_id)
);

create index if not exists votes_generation_id_idx on public.votes (generation_id);
create index if not exists generations_created_at_idx on public.generations (created_at desc);

-- 3) Enable RLS on ALL public tables
alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.generations enable row level security;
alter table public.votes enable row level security;

-- Drop old policies if re-running
do $$
declare r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'artists', 'generations', 'votes')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- profiles: anyone can read; users manage only their own row
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- artists: public read only
create policy "artists_select_all"
  on public.artists for select
  using (true);

-- generations: public read; authenticated create own
create policy "generations_select_all"
  on public.generations for select
  using (true);

create policy "generations_insert_own"
  on public.generations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "generations_delete_own"
  on public.generations for delete
  to authenticated
  using (auth.uid() = user_id);

-- votes: public read (for scores); authenticated mutate own vote only
create policy "votes_select_all"
  on public.votes for select
  using (true);

create policy "votes_insert_own"
  on public.votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "votes_update_own"
  on public.votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "votes_delete_own"
  on public.votes for delete
  to authenticated
  using (auth.uid() = user_id);
