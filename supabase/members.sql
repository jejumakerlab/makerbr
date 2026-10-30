-- 회원 전용 신청·구매 + 필수 회원정보(이름·연락처·주소)
-- schema.sql · orders.sql · applications.sql 을 실행한 뒤, Supabase SQL Editor에서 이 파일 전체를 한 번에 실행하세요.
-- 여러 번 실행해도 안전합니다.
--
-- 실행 순서:
--   1) profiles 주소 컬럼
--   2) 가입 트리거: 이메일 가입·소셜 로그인 정보로 프로필 채우기
--   3) 필수 회원정보 확인 함수
--   4) 교육 신청·주문 저장 직전에 회원 여부·필수 정보 확인 (화면을 거치지 않은 요청도 막습니다)

-- ---------------------------------------------------------------------------
-- 1) 주소
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists zipcode text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists address_detail text;

-- ---------------------------------------------------------------------------
-- 2) 가입 트리거
--    이메일 가입은 signUp() 의 user_metadata, 소셜 로그인은 제공자가 준 이름·전화번호를 씁니다.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, email, full_name, phone, zipcode, address, address_detail)
  values (
    new.id,
    new.email,
    coalesce(nullif(meta ->> 'full_name', ''), nullif(meta ->> 'name', ''), ''),
    coalesce(nullif(meta ->> 'phone', ''), nullif(meta ->> 'phone_number', '')),
    nullif(meta ->> 'zipcode', ''),
    nullif(meta ->> 'address', ''),
    nullif(meta ->> 'address_detail', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone),
    zipcode = coalesce(excluded.zipcode, public.profiles.zipcode),
    address = coalesce(excluded.address, public.profiles.address),
    address_detail = coalesce(excluded.address_detail, public.profiles.address_detail);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3) 필수 회원정보: 이름 · 연락처 · 주소
-- ---------------------------------------------------------------------------
create or replace function public.is_profile_complete(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and coalesce(btrim(full_name), '') <> ''
      and coalesce(btrim(phone), '') <> ''
      and coalesce(btrim(address), '') <> ''
  );
$$;

-- 저장 직전 트리거에서만 쓰므로 외부(API)에서는 호출하지 못하게 둡니다.
revoke execute on function public.is_profile_complete(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) 교육 신청 · 주문은 회원만
--    SQL Editor·서버 관리 작업(로그인 사용자 없음, anon 아님)과 관리자 등록은 막지 않습니다.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_member_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    if coalesce(auth.role(), '') = 'anon' then
      raise exception '로그인한 회원만 이용할 수 있습니다.';
    end if;
    return new;
  end if;

  if public.is_staff() then
    return new;
  end if;

  if not public.is_profile_complete(auth.uid()) then
    raise exception '회원정보(이름·연락처·주소)를 먼저 입력해 주세요.';
  end if;

  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_applications_member_only on public.applications;
create trigger trg_applications_member_only
before insert on public.applications
for each row execute function public.enforce_member_request();

drop trigger if exists trg_orders_member_only on public.orders;
create trigger trg_orders_member_only
before insert on public.orders
for each row execute function public.enforce_member_request();
