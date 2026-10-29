-- 메이커 스토어: products 테이블 · product-images 버킷 · 초기 상품
-- Supabase SQL Editor에서 이 파일 전체를 한 번에 실행하세요. 여러 번 실행해도 안전합니다.
--
-- 실행 순서:
--   0) 관리자 판별 준비 (profiles / is_staff)
--   1) 구형 products 테이블 보관 후 새 products 테이블 생성
--   2) product-images 스토리지 버킷
--   3) RLS 정책
--   4) 초기 상품 3종

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 0) 관리자 판별 준비
--    쓰기 권한은 profiles.role 이 admin/staff 인 계정에만 줍니다.
--    (회원가입이 열려 있어 '로그인한 사용자 전체'에게 주면 일반 회원도 상품을 수정할 수 있음)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'staff')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', null)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone);
  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() 가 없는 경우(SQL Editor·서버 관리 작업)는 막지 않습니다.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_staff() then
    raise exception '역할을 변경할 권한이 없습니다.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_protect_role on public.profiles;
create trigger trg_profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 이미 가입한 계정도 profiles 행을 갖도록 채웁니다.
insert into public.profiles (id, email, full_name, phone)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  u.raw_user_meta_data ->> 'phone'
from auth.users u
on conflict (id) do nothing;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff" on public.profiles
for select using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (id = auth.uid());

drop policy if exists "profiles_staff_all" on public.profiles;
create policy "profiles_staff_all" on public.profiles
for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 1) products
--    예전 구조(slug / sale_price / images / is_published)의 테이블이 있으면
--    지우지 않고 products_legacy 로 이름만 바꿔 보관합니다.
-- ---------------------------------------------------------------------------
do $$
declare
  idx record;
begin
  if to_regclass('public.products') is not null
     and not exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'products'
         and column_name = 'is_visible'
     ) then
    alter table public.products rename to products_legacy;

    -- 인덱스 이름(products_pkey 등)은 테이블을 따라 바뀌지 않으므로 함께 바꿉니다.
    for idx in
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'products_legacy'
        and indexname like 'products\_%'
    loop
      execute format(
        'alter index public.%I rename to %I',
        idx.indexname,
        'products_legacy_' || substr(idx.indexname, length('products_') + 1)
      );
    end loop;
  end if;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null
    check (category in ('자체 상품', '메이커 협업', '업사이클', '교육 키트')),
  maker_name text not null,
  name text not null,
  price integer not null check (price >= 0),
  original_price integer check (original_price is null or original_price >= 0),
  thumbnail_url text not null,
  detail_images text[],
  summary text,
  description text,
  stock integer not null default 99 check (stock >= 0),
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_visible_idx
  on public.products (is_visible, created_at desc);

-- 주문 상품(order_items)이 새 products 를 가리키도록 연결을 옮깁니다.
-- 기존 주문 기록은 그대로 두기 위해 not valid 로 추가합니다.
do $$
begin
  if to_regclass('public.order_items') is not null then
    alter table public.order_items
      drop constraint if exists order_items_product_id_fkey;
    alter table public.order_items
      add constraint order_items_product_id_fkey
      foreign key (product_id) references public.products (id)
      on delete set null
      not valid;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2) product-images 버킷 (공개 조회, 이미지 5MB 제한)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 3) RLS
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
for select using (is_visible = true);

drop policy if exists "products_staff_all" on public.products;
create policy "products_staff_all" on public.products
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
for select using (bucket_id = 'product-images');

drop policy if exists "product_images_staff_insert" on storage.objects;
create policy "product_images_staff_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "product_images_staff_update" on storage.objects;
create policy "product_images_staff_update" on storage.objects
for update to authenticated
using (bucket_id = 'product-images' and public.is_staff())
with check (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "product_images_staff_delete" on storage.objects;
create policy "product_images_staff_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'product-images' and public.is_staff());

-- ---------------------------------------------------------------------------
-- 4) 초기 상품 (화면 순서: 코스터 → 키트 → 브로치, 최신 등록순 정렬)
-- ---------------------------------------------------------------------------
insert into public.products (
  id, category, maker_name, name, price, original_price,
  thumbnail_url, summary, description, stock, is_visible, created_at
)
values
  (
    '6f1c2a10-0000-4000-8000-000000000001',
    '업사이클', '메이커브릿지', '현무암 텍스처 코스터 세트',
    24000, 28000,
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200',
    '제주 현무암 질감을 살린 업사이클 코스터 4p',
    '제주 현무암의 질감을 살린 업사이클 코스터 4p 세트입니다. 레이저 커팅과 수마감으로 제작합니다.',
    40, true, '2026-07-01 00:03:00+09'
  ),
  (
    '6f1c2a10-0000-4000-8000-000000000002',
    '교육 키트', '메이커브릿지 교육팀', '틴커캐드 메이커 키트',
    45000, null,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200',
    '초등·중등 3D 모델링 입문 키트',
    '초등·중등 대상 3D 모델링 입문 키트. 교안, 연습 파일, 출력용 필라멘트를 포함합니다.',
    25, true, '2026-07-01 00:02:00+09'
  ),
  (
    '6f1c2a10-0000-4000-8000-000000000003',
    '메이커 협업', '한라공방', '로컬 메이커 우드브로치',
    18000, null,
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200',
    '제주 목재 자투리로 만든 한정 브로치',
    '제주 목재 자투리를 활용한 한정 브로치. 지역 메이커와 협업 제작합니다.',
    15, true, '2026-07-01 00:01:00+09'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 관리자 지정 (한 번만, 이메일을 바꿔서 실행)
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where lower(email) = lower('관리자@이메일'));
-- ---------------------------------------------------------------------------
