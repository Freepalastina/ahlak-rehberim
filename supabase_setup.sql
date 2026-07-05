create extension if not exists "pgcrypto";

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  marka text not null,
  ana_firma text,
  kategori text,
  alternatif text,
  kaynak text,
  notlar text,
  durum text not null default 'boykot',
  barkod jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- V7.1: UNIQUE zorunlu değil. Uygulama marka varsa UPDATE, yoksa INSERT yapar.
create index if not exists brands_marka_lower_idx on public.brands (lower(marka));
create index if not exists brands_durum_idx on public.brands (durum);
create index if not exists brands_barkod_gin_idx on public.brands using gin (barkod);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

alter table public.brands enable row level security;

drop policy if exists "Public can read brands" on public.brands;
create policy "Public can read brands"
on public.brands for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can insert brands" on public.brands;
create policy "Authenticated can insert brands"
on public.brands for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update brands" on public.brands;
create policy "Authenticated can update brands"
on public.brands for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete brands" on public.brands;
create policy "Authenticated can delete brands"
on public.brands for delete
to authenticated
using (true);


alter table public.brands add column if not exists image_url text;
