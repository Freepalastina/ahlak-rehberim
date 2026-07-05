-- Ahlak Rehberim V10 Clean Supabase setup
create extension if not exists "pgcrypto";
drop view if exists public.brand_cards cascade;

create table if not exists public.companies(id uuid primary key default gen_random_uuid(),name text not null unique,country text,logo_url text,website text,created_at timestamptz default now());
create table if not exists public.categories(id uuid primary key default gen_random_uuid(),name text not null unique,icon text,created_at timestamptz default now());
create table if not exists public.brands(id uuid primary key default gen_random_uuid(),name text not null unique,company_id uuid references public.companies(id) on delete set null,category_id uuid references public.categories(id) on delete set null,status text not null default 'boykot',note text,image_url text,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.barcodes(id uuid primary key default gen_random_uuid(),brand_id uuid not null references public.brands(id) on delete cascade,barcode text not null unique,created_at timestamptz default now());
create table if not exists public.sources(id uuid primary key default gen_random_uuid(),brand_id uuid not null references public.brands(id) on delete cascade,title text,url text not null,created_at timestamptz default now());
create table if not exists public.brand_images(id uuid primary key default gen_random_uuid(),brand_id uuid not null references public.brands(id) on delete cascade,image_url text not null,is_primary boolean default false,created_at timestamptz default now());
create table if not exists public.alternatives(id uuid primary key default gen_random_uuid(),brand_id uuid not null references public.brands(id) on delete cascade,name text not null,created_at timestamptz default now());

create or replace view public.brand_cards as
select b.id,b.name as marka,coalesce(c.name,b.name) as ana_firma,cat.name as kategori,
coalesce((select string_agg(a.name,'; ' order by a.name) from public.alternatives a where a.brand_id=b.id),'') as alternatif,
coalesce((select string_agg(s.url,'; ' order by s.created_at) from public.sources s where s.brand_id=b.id),'') as kaynak,
b.note as notlar,b.status as durum,
coalesce((select jsonb_agg(ba.barcode order by ba.barcode) from public.barcodes ba where ba.brand_id=b.id),'[]'::jsonb) as barkod,
coalesce(b.image_url,(select bi.image_url from public.brand_images bi where bi.brand_id=b.id order by bi.is_primary desc,bi.created_at asc limit 1),c.logo_url) as image_url
from public.brands b left join public.companies c on c.id=b.company_id left join public.categories cat on cat.id=b.category_id;

create or replace function public.import_legacy_brand(p_item jsonb) returns uuid language plpgsql security definer as $$
declare v_company uuid;v_category uuid;v_brand uuid;v_alt text;v_bar text;v_src text;p_marka text;
begin
p_marka:=coalesce(p_item->>'marka',p_item->>'Marka',p_item->>'brand',p_item->>'name');
if p_marka is null or length(trim(p_marka))=0 then raise exception 'Marka adı gerekli'; end if;
if coalesce(p_item->>'anaFirma',p_item->>'ana_firma',p_item->>'anafirma','')<>'' then
 insert into public.companies(name) values(trim(coalesce(p_item->>'anaFirma',p_item->>'ana_firma',p_item->>'anafirma'))) on conflict(name) do update set name=excluded.name returning id into v_company;
end if;
if coalesce(p_item->>'kategori',p_item->>'category','')<>'' then
 insert into public.categories(name) values(trim(coalesce(p_item->>'kategori',p_item->>'category'))) on conflict(name) do update set name=excluded.name returning id into v_category;
end if;
insert into public.brands(name,company_id,category_id,status,note,image_url) values(trim(p_marka),v_company,v_category,coalesce(p_item->>'durum',p_item->>'status','boykot'),coalesce(p_item->>'not',p_item->>'notlar',p_item->>'note'),coalesce(p_item->>'image_url',p_item->>'imageUrl',p_item->>'image',p_item->>'logo',p_item->>'resim',p_item->>'gorsel'))
on conflict(name) do update set company_id=excluded.company_id,category_id=excluded.category_id,status=excluded.status,note=excluded.note,image_url=excluded.image_url returning id into v_brand;
delete from public.alternatives where brand_id=v_brand;
if coalesce(p_item->>'alternatif',p_item->>'alternative','')<>'' then
 foreach v_alt in array regexp_split_to_array(coalesce(p_item->>'alternatif',p_item->>'alternative'), '[;,•]+') loop if length(trim(v_alt))>0 then insert into public.alternatives(brand_id,name) values(v_brand,trim(v_alt)); end if; end loop;
end if;
if jsonb_typeof(p_item->'barkod')='array' then
 for v_bar in select jsonb_array_elements_text(p_item->'barkod') loop if length(trim(v_bar))>0 then insert into public.barcodes(brand_id,barcode) values(v_brand,trim(v_bar)) on conflict(barcode) do update set brand_id=excluded.brand_id; end if; end loop;
elsif coalesce(p_item->>'barkod',p_item->>'barcode','')<>'' then
 insert into public.barcodes(brand_id,barcode) values(v_brand,trim(coalesce(p_item->>'barkod',p_item->>'barcode'))) on conflict(barcode) do update set brand_id=excluded.brand_id;
end if;
delete from public.sources where brand_id=v_brand;
if coalesce(p_item->>'kaynak',p_item->>'source','')<>'' then
 foreach v_src in array regexp_split_to_array(coalesce(p_item->>'kaynak',p_item->>'source'), '[;]+') loop if length(trim(v_src))>0 then insert into public.sources(brand_id,url) values(v_brand,trim(v_src)); end if; end loop;
end if;
return v_brand;
end $$;

alter table public.companies enable row level security;alter table public.categories enable row level security;alter table public.brands enable row level security;alter table public.barcodes enable row level security;alter table public.sources enable row level security;alter table public.brand_images enable row level security;alter table public.alternatives enable row level security;
do $$ declare t text; begin foreach t in array array['companies','categories','brands','barcodes','sources','brand_images','alternatives'] loop
 execute format('drop policy if exists "Public read %I" on public.%I',t,t); execute format('create policy "Public read %I" on public.%I for select to anon, authenticated using (true)',t,t);
 execute format('drop policy if exists "Auth write %I" on public.%I',t,t); execute format('create policy "Auth write %I" on public.%I for all to authenticated using (true) with check (true)',t,t);
end loop; end $$;
grant usage on schema public to anon,authenticated; grant select on public.brand_cards to anon,authenticated; grant all on public.companies,public.categories,public.brands,public.barcodes,public.sources,public.brand_images,public.alternatives to authenticated; grant execute on function public.import_legacy_brand(jsonb) to authenticated;