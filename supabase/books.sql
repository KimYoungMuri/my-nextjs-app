-- Run this in Supabase → SQL Editor → New query

create table if not exists public.books (
  id bigint generated always as identity primary key,
  title text not null,
  author text not null,
  year int,
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;

create policy "Allow public read access"
  on public.books
  for select
  to anon, authenticated
  using (true);

insert into public.books (title, author, year) values
  ('The Hobbit', 'J. R. R. Tolkien', 1937),
  ('Dune', 'Frank Herbert', 1965),
  ('Neuromancer', 'William Gibson', 1984)
on conflict do nothing;
