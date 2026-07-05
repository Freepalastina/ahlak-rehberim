-- Ahlak Rehberim V8 - Profesyonel Supabase Veritabanı
-- Supabase Dashboard > SQL Editor içine yapıştırıp RUN bas.

create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  country text,
  logo_url text,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  company_id uuid references public.companies(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'boykot',
  note text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.barcodes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  barcode text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  title text,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_images (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.alternatives (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

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

create or replace view public.brand_cards as
select
  b.id,
  b.name as marka,
  coalesce(c.name, b.name) as ana_firma,
  cat.name as kategori,
  coalesce((
    select string_agg(a.name, '; ' order by a.name)
    from public.alternatives a
    where a.brand_id = b.id
  ), '') as alternatif,
  coalesce((
    select string_agg(coalesce(s.title, s.url) || case when s.title is not null then ' | ' || s.url else '' end, '; ' order by s.created_at)
    from public.sources s
    where s.brand_id = b.id
  ), '') as kaynak,
  b.note as notlar,
  b.status as durum,
  coalesce((
    select jsonb_agg(ba.barcode order by ba.barcode)
    from public.barcodes ba
    where ba.brand_id = b.id
  ), '[]'::jsonb) as barkod,
  coalesce(
    b.image_url,
    (select bi.image_url from public.brand_images bi where bi.brand_id = b.id order by bi.is_primary desc, bi.created_at asc limit 1),
    c.logo_url
  ) as image_url
from public.brands b
left join public.companies c on c.id = b.company_id
left join public.categories cat on cat.id = b.category_id;

create or replace function public.upsert_brand_full(
  p_marka text,
  p_ana_firma text default null,
  p_kategori text default null,
  p_durum text default 'boykot',
  p_not text default null,
  p_image_url text default null,
  p_alternatif text default null,
  p_kaynak text default null,
  p_barkod jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_company_id uuid;
  v_category_id uuid;
  v_brand_id uuid;
  v_alt text;
  v_bar text;
  v_source text;
begin
  if p_marka is null or length(trim(p_marka)) = 0 then
    raise exception 'Marka adı gerekli';
  end if;

  if p_ana_firma is not null and length(trim(p_ana_firma)) > 0 then
    insert into public.companies(name)
    values(trim(p_ana_firma))
    on conflict (name) do update set name = excluded.name
    returning id into v_company_id;
  end if;

  if p_kategori is not null and length(trim(p_kategori)) > 0 then
    insert into public.categories(name)
    values(trim(p_kategori))
    on conflict (name) do update set name = excluded.name
    returning id into v_category_id;
  end if;

  insert into public.brands(name, company_id, category_id, status, note, image_url)
  values(trim(p_marka), v_company_id, v_category_id, coalesce(p_durum,'boykot'), p_not, nullif(p_image_url,''))
  on conflict (name) do update set
    company_id = excluded.company_id,
    category_id = excluded.category_id,
    status = excluded.status,
    note = excluded.note,
    image_url = excluded.image_url
  returning id into v_brand_id;

  delete from public.alternatives where brand_id = v_brand_id;
  if p_alternatif is not null and length(trim(p_alternatif)) > 0 then
    foreach v_alt in array regexp_split_to_array(p_alternatif, '[;,•]+') loop
      if length(trim(v_alt)) > 0 then
        insert into public.alternatives(brand_id, name) values(v_brand_id, trim(v_alt));
      end if;
    end loop;
  end if;

  if p_barkod is not null then
    for v_bar in select jsonb_array_elements_text(p_barkod) loop
      if length(trim(v_bar)) > 0 then
        insert into public.barcodes(brand_id, barcode)
        values(v_brand_id, trim(v_bar))
        on conflict (barcode) do update set brand_id = excluded.brand_id;
      end if;
    end loop;
  end if;

  if p_kaynak is not null and length(trim(p_kaynak)) > 0 then
    delete from public.sources where brand_id = v_brand_id;
    foreach v_source in array regexp_split_to_array(p_kaynak, '[;]+') loop
      if length(trim(v_source)) > 0 then
        insert into public.sources(brand_id, url) values(v_brand_id, trim(v_source));
      end if;
    end loop;
  end if;

  if p_image_url is not null and length(trim(p_image_url)) > 0 then
    insert into public.brand_images(brand_id, image_url, is_primary)
    values(v_brand_id, trim(p_image_url), true)
    on conflict do nothing;
  end if;

  return v_brand_id;
end;
$$;

create or replace function public.import_legacy_brand(p_item jsonb)
returns uuid
language plpgsql
security definer
as $$
begin
  return public.upsert_brand_full(
    coalesce(p_item->>'marka', p_item->>'Marka', p_item->>'brand'),
    coalesce(p_item->>'anaFirma', p_item->>'ana_firma', p_item->>'anafirma', p_item->>'Ana Firma'),
    coalesce(p_item->>'kategori', p_item->>'Kategori', p_item->>'category'),
    coalesce(p_item->>'durum', p_item->>'status', 'boykot'),
    coalesce(p_item->>'not', p_item->>'notlar', p_item->>'note'),
    coalesce(p_item->>'image_url', p_item->>'imageUrl', p_item->>'image', p_item->>'logo', p_item->>'resim', p_item->>'gorsel'),
    coalesce(p_item->>'alternatif', p_item->>'Alternatif', p_item->>'alternative'),
    coalesce(p_item->>'kaynak', p_item->>'Kaynak', p_item->>'source'),
    case
      when jsonb_typeof(p_item->'barkod') = 'array' then p_item->'barkod'
      when p_item ? 'barkod' then jsonb_build_array(p_item->>'barkod')
      when p_item ? 'barcode' then jsonb_build_array(p_item->>'barcode')
      else '[]'::jsonb
    end
  );
end;
$$;

alter table public.companies enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.barcodes enable row level security;
alter table public.sources enable row level security;
alter table public.brand_images enable row level security;
alter table public.alternatives enable row level security;

do $$
declare t text;
begin
  foreach t in array array['companies','categories','brands','barcodes','sources','brand_images','alternatives'] loop
    execute format('drop policy if exists "Public read %I" on public.%I', t, t);
    execute format('create policy "Public read %I" on public.%I for select to anon, authenticated using (true)', t, t);

    execute format('drop policy if exists "Auth insert %I" on public.%I', t, t);
    execute format('create policy "Auth insert %I" on public.%I for insert to authenticated with check (true)', t, t);

    execute format('drop policy if exists "Auth update %I" on public.%I', t, t);
    execute format('create policy "Auth update %I" on public.%I for update to authenticated using (true) with check (true)', t, t);

    execute format('drop policy if exists "Auth delete %I" on public.%I', t, t);
    execute format('create policy "Auth delete %I" on public.%I for delete to authenticated using (true)', t, t);
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant select on public.brand_cards to anon, authenticated;
grant all on public.companies, public.categories, public.brands, public.barcodes, public.sources, public.brand_images, public.alternatives to authenticated;
grant select on public.companies, public.categories, public.brands, public.barcodes, public.sources, public.brand_images, public.alternatives to anon, authenticated;
grant execute on function public.upsert_brand_full(text,text,text,text,text,text,text,text,jsonb) to authenticated;
grant execute on function public.import_legacy_brand(jsonb) to authenticated;
