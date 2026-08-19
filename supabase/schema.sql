-- Maker Bridge / 메이커브릿지
-- Supabase SQL Editor에서 이 파일 전체를 한 번에 실행하세요.
-- 이후 seed.sql을 실행합니다.
--
-- 실행 순서:
--   1) profiles
--   2) functions (profiles 의존 포함)
--   3) other tables + 테이블 의존 RPC
--   4) storage
--   5) RLS policies

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) profiles
--    is_staff() / handle_new_user() / RLS보다 반드시 먼저 생성합니다.
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

-- ---------------------------------------------------------------------------
-- 2) functions
-- ---------------------------------------------------------------------------
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
  if new.role is distinct from old.role and not public.is_staff() then
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

-- ---------------------------------------------------------------------------
-- 3) other tables
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price integer not null default 0 check (price >= 0),
  sale_price integer check (sale_price is null or sale_price >= 0),
  category text not null default 'goods'
    check (category in ('goods', 'maker', 'upcycled', 'education')),
  images jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  is_published boolean not null default false,
  maker_name text,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category text not null default 'workshop'
    check (category in ('workshop', 'education', 'outreach', 'exhibition')),
  location text,
  start_at timestamptz,
  end_at timestamptz,
  capacity integer not null default 0 check (capacity >= 0),
  fee integer not null default 0 check (fee >= 0),
  cover_image text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  organization text,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'waitlist')),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('notice', 'story', 'faq')),
  title text not null,
  slug text unique,
  content text,
  excerpt text,
  cover_image text,
  is_published boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text not null,
  phone text,
  request_type text not null default 'custom'
    check (request_type in ('product', 'education', 'custom')),
  budget_range text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'quoted', 'closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.impacts (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  value numeric not null default 0,
  unit text,
  description text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  category text not null default 'education',
  year integer,
  cover_image text,
  images jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issued_by text,
  issued_on date,
  file_url text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  title text not null,
  content text not null,
  is_private boolean not null default true,
  status text not null default 'open'
    check (status in ('open', 'answered', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  shipping_memo text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_id text,
  payment_method text,
  total_amount integer not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price integer not null,
  quantity integer not null default 1 check (quantity > 0)
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'events', 'posts', 'quotes', 'impacts',
    'portfolios', 'orders', 'site_settings'
  ]
  loop
    execute format('drop trigger if exists trg_%s_updated_at on public.%I', t, t);
    execute format(
      'create trigger trg_%s_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

create index if not exists products_published_idx on public.products (is_published, sort_order);
create index if not exists events_published_idx on public.events (is_published, start_at);
create index if not exists applications_event_idx on public.applications (event_id, status);
create index if not exists posts_type_idx on public.posts (type, is_published, pinned desc, created_at desc);
create index if not exists quotes_status_idx on public.quotes (status, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

-- 테이블 의존 RPC (events / applications 생성 이후)
create or replace function public.submit_application(
  p_event_id uuid,
  p_name text,
  p_email text,
  p_phone text default null,
  p_organization text default null,
  p_message text default null
)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
  v_count integer;
  v_row public.applications;
  v_status text;
begin
  select * into v_event
  from public.events
  where id = p_event_id and is_published = true
  for update;

  if not found then
    raise exception '교육/이벤트를 찾을 수 없습니다.';
  end if;

  select count(*) into v_count
  from public.applications
  where event_id = p_event_id
    and status in ('pending', 'confirmed');

  if v_event.capacity > 0 and v_count >= v_event.capacity then
    v_status := 'waitlist';
  else
    v_status := 'pending';
  end if;

  insert into public.applications (
    event_id, name, email, phone, organization, message, status
  ) values (
    p_event_id, p_name, p_email, p_phone, p_organization, p_message, v_status
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.submit_application(
  uuid, text, text, text, text, text
) to anon, authenticated;

create or replace function public.event_enrolled_count(p_event_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select count(*)::integer
  from public.applications
  where event_id = p_event_id
    and status in ('pending', 'confirmed');
$$;

-- ---------------------------------------------------------------------------
-- 4) storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5) RLS policies
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.events enable row level security;
alter table public.applications enable row level security;
alter table public.posts enable row level security;
alter table public.quotes enable row level security;
alter table public.impacts enable row level security;
alter table public.portfolios enable row level security;
alter table public.certificates enable row level security;
alter table public.inquiries enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.site_settings enable row level security;

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

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
for select using (is_published = true or public.is_staff());

drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
for select using (is_published = true or public.is_staff());

drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
for select using (is_published = true or public.is_staff());

drop policy if exists "portfolios_public_read" on public.portfolios;
create policy "portfolios_public_read" on public.portfolios
for select using (is_published = true or public.is_staff());

drop policy if exists "impacts_public_read" on public.impacts;
create policy "impacts_public_read" on public.impacts
for select using (true);

drop policy if exists "certificates_public_read" on public.certificates;
create policy "certificates_public_read" on public.certificates
for select using (true);

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
for select using (true);

drop policy if exists "quotes_public_insert" on public.quotes;
create policy "quotes_public_insert" on public.quotes
for insert with check (true);

drop policy if exists "inquiries_public_insert" on public.inquiries;
create policy "inquiries_public_insert" on public.inquiries
for insert with check (true);

drop policy if exists "applications_public_insert" on public.applications;
create policy "applications_public_insert" on public.applications
for insert with check (true);

do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'events', 'applications', 'posts', 'quotes', 'impacts',
    'portfolios', 'certificates', 'inquiries', 'orders', 'order_items',
    'site_settings'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_staff_all', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_staff()) with check (public.is_staff())',
      t || '_staff_all', t
    );
  end loop;
end $$;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
for select using (bucket_id = 'media');

drop policy if exists "media_staff_write" on storage.objects;
create policy "media_staff_write" on storage.objects
for all using (bucket_id = 'media' and public.is_staff())
with check (bucket_id = 'media' and public.is_staff());
