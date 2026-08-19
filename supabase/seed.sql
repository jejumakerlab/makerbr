-- 초기 시드 데이터. schema.sql 실행 후 적용하세요.

insert into public.impacts (key, label, value, unit, description, sort_order) values
  ('education_people', '누적 교육 인원', 1240, '명', '메이커 교육·워크숍 참여자', 1),
  ('eco_kg', '업사이클 소재', 3.2, '톤', '폐기물에서 제품으로 전환된 소재', 2),
  ('makers', '협력 메이커', 48, '팀', '지역 창작자·공방 네트워크', 3),
  ('projects', '지역 프로젝트', 86, '건', '학교·공공·마을 협력 성과', 4)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
  ('slogan', '만드는 사람과 세상을 잇다'),
  ('hero_sub', '제주에서 시작하는 메이커 교육, 로컬 제작, 사회적 가치의 다리.'),
  ('address', '제주특별자치도 제주시'),
  ('email', 'hello@makerbridge.kr'),
  ('phone', '064-000-0000')
on conflict (key) do nothing;

insert into public.products (name, slug, description, price, sale_price, category, images, stock, is_published, maker_name, tags, sort_order)
values
  (
    '현무암 텍스처 코스터 세트',
    'basalt-coaster-set',
    '제주 현무암의 질감을 살린 업사이클 코스터 4p 세트입니다. 레이저 커팅과 수마감으로 제작합니다.',
    28000, 24000, 'upcycled',
    '["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200"]'::jsonb,
    40, true, '메이커브릿지', array['업사이클','리빙','제주'], 1
  ),
  (
    '틴커캐드 메이커 키트',
    'tinkercad-maker-kit',
    '초등·중등 대상 3D 모델링 입문 키트. 교안, 연습 파일, 출력용 필라멘트를 포함합니다.',
    45000, null, 'education',
    '["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200"]'::jsonb,
    25, true, '메이커브릿지 교육팀', array['교육','3D프린팅'], 2
  ),
  (
    '로컬 메이커 우드브로치',
    'local-wood-brooch',
    '제주 목재 자투리를 활용한 한정 브로치. 지역 메이커와 협업 제작합니다.',
    18000, null, 'maker',
    '["https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200"]'::jsonb,
    15, true, '한라공방', array['협업','패션'], 3
  )
on conflict (slug) do nothing;

insert into public.events (title, slug, description, category, location, start_at, end_at, capacity, fee, cover_image, is_published)
values
  (
    '월간 메이커 입문: 레이저 커팅',
    'monthly-laser-cutting',
    '목재와 아크릴을 활용한 레이저 커팅 기초 과정입니다. 안전 교육 후 소형 오브제를 제작합니다.',
    'workshop', '메이커브릿지 스튜디오',
    '2026-09-12 10:00:00+09', '2026-09-12 13:00:00+09',
    12, 30000,
    'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=1400',
    true
  ),
  (
    '찾아가는 학교 메이커 교실',
    'school-outreach-maker',
    '초·중등 대상 찾아가는 메이커 교육. 3D 모델링과 업사이클 프로토타이핑을 하루 과정으로 진행합니다.',
    'outreach', '제주 동여자중학교',
    '2026-09-24 13:00:00+09', '2026-09-24 16:30:00+09',
    24, 0,
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1400',
    true
  )
on conflict (slug) do nothing;

insert into public.posts (type, title, slug, content, excerpt, is_published, pinned)
values
  ('notice', '2026년 하반기 공공기관 우선구매 안내', 'priority-purchase-2026',
   '사회적기업 제품 우선구매 제도에 따라 수의계약 및 조달 문의가 가능합니다. 견적/문의 페이지를 이용해 주세요.',
   '공공기관 우선구매·수의계약 안내', true, true),
  ('story', '학교 메이커 교실에서 나온 첫 프로토타입', 'school-prototype-story',
   '학생들이 폐플라스틱과 3D 프린팅을 결합해 문구 정리함을 만들었습니다.',
   '지역 학교와 함께한 메이커 교육 이야기', true, false),
  ('faq', '공공기관도 구매·교육 의뢰가 가능한가요?', 'faq-public-purchase',
   '가능합니다. 사회적기업 육성법에 따른 우선구매 및 수의계약을 지원하며, 견적서를 발급합니다.',
   '공공 구매 FAQ', true, false)
on conflict (slug) do nothing;

insert into public.portfolios (title, slug, summary, description, category, year, cover_image, tags, is_published, sort_order)
values
  (
    '제주 동여중 메이커 교실',
    'jeju-dongyeo-maker-class',
    '정규 교과 연계 메이커 수업 설계 및 운영',
    '3D 모델링·레이저 커팅을 활용한 문제해결 수업을 학기 단위로 운영했습니다.',
    'education', 2026,
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1400',
    array['학교','교육'], true, 1
  ),
  (
    '마을 업사이클 리빙 컬렉션',
    'village-upcycle-living',
    '지역 폐기 소재를 리빙 소품으로 전환한 협업 프로젝트',
    '공방 네트워크와 함께 소량 생산 라인을 구축했습니다.',
    'product', 2025,
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1400',
    array['업사이클','제품'], true, 2
  )
on conflict (slug) do nothing;

insert into public.certificates (title, issued_by, issued_on, sort_order)
values
  ('사회적기업 인증서', '고용노동부', '2026-03-01', 1),
  ('경영공시 확인', '한국사회적기업진흥원', '2026-06-01', 2)
on conflict do nothing;
