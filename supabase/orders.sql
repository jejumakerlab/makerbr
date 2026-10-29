-- 주문/배송: orders · order_items 테이블, 주문 생성 함수, RLS
-- store-products.sql 을 먼저 실행한 뒤, Supabase SQL Editor에서 이 파일 전체를 한 번에 실행하세요.
-- 여러 번 실행해도 안전합니다.
--
-- 실행 순서:
--   1) 구형 orders / order_items 보관
--   2) 새 orders / order_items / 주문번호 카운터
--   3) place_order(): 주문 저장 + 가격·배송비 재계산 + 재고 차감 (한 트랜잭션)
--   4) 취소 시 재고 복구 트리거
--   5) RLS

-- ---------------------------------------------------------------------------
-- 1) 예전 구조(customer_name 등)의 테이블이 있으면 지우지 않고 *_legacy 로 이름만 바꿉니다.
-- ---------------------------------------------------------------------------
do $$
declare
  idx record;
begin
  if to_regclass('public.orders') is not null
     and not exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'orders'
         and column_name = 'buyer_name'
     ) then
    alter table public.orders rename to orders_legacy;
    if to_regclass('public.order_items') is not null then
      alter table public.order_items rename to order_items_legacy;
    end if;

    -- 인덱스 이름(orders_pkey 등)은 테이블을 따라 바뀌지 않으므로 함께 바꿉니다.
    for idx in
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and tablename in ('orders_legacy', 'order_items_legacy')
        and (indexname like 'orders\_%' or indexname like 'order\_items\_%')
    loop
      execute format(
        'alter index public.%I rename to %I',
        idx.indexname,
        case
          when idx.indexname like 'order\_items\_%'
            then 'order_items_legacy_' || substr(idx.indexname, length('order_items_') + 1)
          else 'orders_legacy_' || substr(idx.indexname, length('orders_') + 1)
        end
      );
    end loop;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2) 테이블
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  buyer_name text not null,
  buyer_phone text not null,
  buyer_email text not null,
  delivery_method text not null default '택배'
    check (delivery_method in ('택배', '방문수령')),
  recipient_name text,
  recipient_phone text,
  zipcode text,
  address text,
  address_detail text,
  delivery_memo text,
  payment_method text not null
    check (payment_method in ('무통장입금/계좌이체', '기관 후불/세금계산서', '카드결제(준비중)')),
  depositor_name text,
  billing_memo text,
  items_total integer not null default 0 check (items_total >= 0),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  total_amount integer not null default 0 check (total_amount >= 0),
  status text not null default '입금대기'
    check (status in ('입금대기', '결제완료', '제작/준비중', '배송중', '배송완료', '취소')),
  tracking_carrier text,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  thumbnail_url text,
  price integer not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  custom_memo text
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- 날짜별 주문 일련번호 (MB-20261029-001). place_order() 안에서만 사용합니다.
create table if not exists public.order_counters (
  day date primary key,
  last_value integer not null default 0
);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3) 주문 생성
--    가격·배송비는 브라우저가 보낸 값이 아니라 DB 값으로 다시 계산합니다.
--    배송비 기준은 lib/store/shipping.ts 와 같아야 합니다 (3,000원 / 50,000원 이상 무료).
-- ---------------------------------------------------------------------------
create or replace function public.place_order(p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer_name text := nullif(left(trim(coalesce(p_order ->> 'buyer_name', '')), 50), '');
  v_buyer_phone text := nullif(left(trim(coalesce(p_order ->> 'buyer_phone', '')), 30), '');
  v_buyer_email text := nullif(left(trim(coalesce(p_order ->> 'buyer_email', '')), 120), '');
  v_delivery text := coalesce(nullif(trim(p_order ->> 'delivery_method'), ''), '택배');
  v_payment text := trim(coalesce(p_order ->> 'payment_method', ''));
  v_recipient_name text := nullif(left(trim(coalesce(p_order ->> 'recipient_name', '')), 50), '');
  v_recipient_phone text := nullif(left(trim(coalesce(p_order ->> 'recipient_phone', '')), 30), '');
  v_zipcode text := nullif(left(trim(coalesce(p_order ->> 'zipcode', '')), 10), '');
  v_address text := nullif(left(trim(coalesce(p_order ->> 'address', '')), 200), '');
  v_address_detail text := nullif(left(trim(coalesce(p_order ->> 'address_detail', '')), 200), '');
  v_items jsonb := p_order -> 'items';
  v_item jsonb;
  v_product public.products;
  v_qty integer;
  v_items_total integer := 0;
  v_shipping integer;
  v_order_id uuid;
  v_order_number text;
  v_seq integer;
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if v_buyer_name is null or v_buyer_phone is null or v_buyer_email is null then
    raise exception '주문자 이름, 연락처, 이메일을 입력해 주세요.';
  end if;
  if v_buyer_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception '이메일 주소를 확인해 주세요.';
  end if;
  if v_delivery not in ('택배', '방문수령') then
    raise exception '배송 방법을 확인해 주세요.';
  end if;
  if v_payment = '카드결제(준비중)' then
    raise exception '카드 결제는 준비 중입니다. 다른 결제 수단을 선택해 주세요.';
  end if;
  if v_payment not in ('무통장입금/계좌이체', '기관 후불/세금계산서') then
    raise exception '결제 수단을 확인해 주세요.';
  end if;
  if v_delivery = '택배'
     and (v_recipient_name is null or v_recipient_phone is null or v_address is null) then
    raise exception '받는 분, 연락처, 주소를 입력해 주세요.';
  end if;
  if v_items is null or jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then
    raise exception '주문할 상품이 없습니다.';
  end if;
  if jsonb_array_length(v_items) > 50 then
    raise exception '한 번에 주문할 수 있는 상품 수를 넘었습니다.';
  end if;

  insert into public.order_counters as c (day, last_value)
  values (v_today, 1)
  on conflict (day) do update set last_value = c.last_value + 1
  returning last_value into v_seq;
  v_order_number := 'MB-' || to_char(v_today, 'YYYYMMDD') || '-' || lpad(v_seq::text, 3, '0');

  insert into public.orders (
    order_number, user_id, buyer_name, buyer_phone, buyer_email, delivery_method,
    recipient_name, recipient_phone, zipcode, address, address_detail, delivery_memo,
    payment_method, depositor_name, billing_memo
  ) values (
    v_order_number,
    auth.uid(),
    v_buyer_name,
    v_buyer_phone,
    v_buyer_email,
    v_delivery,
    case when v_delivery = '택배' then v_recipient_name end,
    case when v_delivery = '택배' then v_recipient_phone end,
    case when v_delivery = '택배' then v_zipcode end,
    case when v_delivery = '택배' then v_address end,
    case when v_delivery = '택배' then v_address_detail end,
    nullif(left(trim(coalesce(p_order ->> 'delivery_memo', '')), 300), ''),
    v_payment,
    nullif(left(trim(coalesce(p_order ->> 'depositor_name', '')), 50), ''),
    nullif(left(trim(coalesce(p_order ->> 'billing_memo', '')), 1000), '')
  )
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    begin
      v_qty := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception '수량을 확인해 주세요.';
    end;
    if v_qty is null or v_qty < 1 or v_qty > 999 then
      raise exception '수량을 확인해 주세요.';
    end if;

    select * into v_product
    from public.products
    where id::text = (v_item ->> 'product_id')
      and is_visible = true
    for update;

    if not found then
      raise exception '판매하지 않는 상품이 포함되어 있습니다. 장바구니를 확인해 주세요.';
    end if;
    if v_product.stock < v_qty then
      raise exception '"%" 재고가 부족합니다. (남은 수량 %개)', v_product.name, v_product.stock;
    end if;

    update public.products set stock = stock - v_qty where id = v_product.id;

    insert into public.order_items (
      order_id, product_id, product_name, thumbnail_url, price, quantity, custom_memo
    ) values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.thumbnail_url,
      v_product.price,
      v_qty,
      nullif(left(trim(coalesce(v_item ->> 'custom_memo', '')), 200), '')
    );

    v_items_total := v_items_total + v_product.price * v_qty;
  end loop;

  v_shipping := case
    when v_delivery = '방문수령' then 0
    when v_items_total >= 50000 then 0
    else 3000
  end;

  update public.orders
  set items_total = v_items_total,
      shipping_fee = v_shipping,
      total_amount = v_items_total + v_shipping
  where id = v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'items_total', v_items_total,
    'shipping_fee', v_shipping,
    'total_amount', v_items_total + v_shipping,
    'payment_method', v_payment,
    'delivery_method', v_delivery
  );
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) 주문을 '취소'로 바꾸면 재고를 되돌리고, 취소를 되돌리면 다시 차감합니다.
-- ---------------------------------------------------------------------------
create or replace function public.sync_stock_on_order_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sign integer;
begin
  if new.status = '취소' and old.status <> '취소' then
    v_sign := 1;
  elsif old.status = '취소' and new.status <> '취소' then
    v_sign := -1;
  else
    return new;
  end if;

  update public.products p
  set stock = p.stock + v_sign * i.quantity
  from (
    select product_id, sum(quantity)::integer as quantity
    from public.order_items
    where order_id = new.id and product_id is not null
    group by product_id
  ) i
  where p.id = i.product_id;

  return new;
end;
$$;

drop trigger if exists trg_orders_cancel_stock on public.orders;
create trigger trg_orders_cancel_stock
after update of status on public.orders
for each row execute function public.sync_stock_on_order_cancel();

-- ---------------------------------------------------------------------------
-- 5) RLS
--    주문 생성은 place_order() 로만 합니다(직접 insert 정책 없음).
--    로그인 회원은 본인 주문만, 관리자는 전체를 조회·수정합니다.
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_counters enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "orders_staff_all" on public.orders;
create policy "orders_staff_all" on public.orders
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_staff_all" on public.order_items;
create policy "order_items_staff_all" on public.order_items
for all to authenticated
using (public.is_staff())
with check (public.is_staff());
