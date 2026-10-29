-- 교육 준비물 · 참가 신청 회원 연결 · 본인 신청 조회
-- schema.sql 을 실행한 프로젝트에서, Supabase SQL Editor로 이 파일 전체를 한 번에 실행하세요.
-- 여러 번 실행해도 안전합니다.

-- 1) 교육 준비물
alter table public.events add column if not exists supplies text;

-- 2) 신청서를 낸 회원 계정 · 상태 변경 시각
alter table public.applications
  add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.applications
  add column if not exists updated_at timestamptz not null default now();

create index if not exists applications_user_idx
  on public.applications (user_id, created_at desc);

drop trigger if exists trg_applications_updated_at on public.applications;
create trigger trg_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

-- 3) 신청 접수: 로그인한 상태면 회원 계정을 함께 저장합니다.
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
    event_id, user_id, name, email, phone, organization, message, status
  ) values (
    p_event_id, auth.uid(), p_name, p_email, p_phone, p_organization, p_message, v_status
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.submit_application(
  uuid, text, text, text, text, text
) to anon, authenticated;

-- 4) 로그인 회원은 본인 신청만 조회합니다. (관리자는 applications_staff_all 로 전체 관리)
drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own" on public.applications
for select to authenticated
using (user_id = auth.uid());
