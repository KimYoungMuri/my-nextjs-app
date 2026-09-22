-- Run this in Supabase → SQL Editor → New query

drop table if exists public.books;

create table if not exists public.artists (
  id bigint generated always as identity primary key,
  name text not null,
  genre text not null,
  era text,
  notable_work text,
  created_at timestamptz not null default now()
);

alter table public.artists enable row level security;

drop policy if exists "Allow public read access" on public.artists;
create policy "Allow public read access"
  on public.artists
  for select
  to anon, authenticated
  using (true);

insert into public.artists (name, genre, era, notable_work) values
  ('Playboi Carti', 'Hip Hop / Rage', '2010s–present', 'Whole Lotta Red'),
  ('Nujabes', 'Jazz Hip Hop / Lo-fi', '1990s–2000s', 'Modal Soul'),
  ('Charlie Parker', 'Bebop / Jazz', '1940s–1950s', 'Ko-Ko');
