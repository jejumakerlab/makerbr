import type {
  Application,
  Certificate,
  EventItem,
  Impact,
  Inquiry,
  Order,
  Portfolio,
  Post,
  Product,
  Quote,
} from "@/types/database";

export const MOCK_IMPACTS: Impact[] = [
  {
    id: "imp-1",
    key: "education_people",
    label: "누적 교육 인원",
    value: 1240,
    unit: "명",
    description: "메이커 교육·워크숍 참여자",
    sort_order: 1,
    updated_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "imp-2",
    key: "eco_kg",
    label: "업사이클 소재",
    value: 3.2,
    unit: "톤",
    description: "폐기물에서 제품으로 전환된 소재",
    sort_order: 2,
    updated_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "imp-3",
    key: "makers",
    label: "협력 메이커",
    value: 48,
    unit: "팀",
    description: "지역 창작자·공방 네트워크",
    sort_order: 3,
    updated_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "imp-4",
    key: "projects",
    label: "지역 프로젝트",
    value: 86,
    unit: "건",
    description: "학교·공공·마을 협력 성과",
    sort_order: 4,
    updated_at: "2026-08-01T00:00:00.000Z",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prd-1",
    name: "현무암 텍스처 코스터 세트",
    slug: "basalt-coaster-set",
    description:
      "제주 현무암의 질감을 살린 업사이클 코스터 4p 세트입니다. 레이저 커팅과 수마감으로 제작합니다.",
    price: 28000,
    sale_price: 24000,
    category: "upcycled",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200",
    ],
    stock: 40,
    is_published: true,
    maker_name: "메이커브릿지",
    tags: ["업사이클", "리빙", "제주"],
    sort_order: 1,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "prd-2",
    name: "틴커캐드 메이커 키트",
    slug: "tinkercad-maker-kit",
    description:
      "초등·중등 대상 3D 모델링 입문 키트. 교안, 연습 파일, 출력용 필라멘트를 포함합니다.",
    price: 45000,
    sale_price: null,
    category: "education",
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200",
    ],
    stock: 25,
    is_published: true,
    maker_name: "메이커브릿지 교육팀",
    tags: ["교육", "3D프린팅"],
    sort_order: 2,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "prd-3",
    name: "로컬 메이커 우드브로치",
    slug: "local-wood-brooch",
    description:
      "제주 목재 자투리를 활용한 한정 브로치. 지역 메이커와 협업 제작합니다.",
    price: 18000,
    sale_price: null,
    category: "maker",
    images: [
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200",
    ],
    stock: 15,
    is_published: true,
    maker_name: "한라공방",
    tags: ["협업", "패션"],
    sort_order: 3,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "월간 메이커 입문: 레이저 커팅",
    slug: "monthly-laser-cutting",
    description:
      "목재와 아크릴을 활용한 레이저 커팅 기초 과정입니다. 안전 교육 후 소형 오브제를 제작합니다.",
    category: "workshop",
    location: "메이커브릿지 스튜디오",
    start_at: "2026-09-12T01:00:00.000Z",
    end_at: "2026-09-12T04:00:00.000Z",
    capacity: 12,
    enrolled_count: 7,
    fee: 30000,
    cover_image:
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=1400",
    is_published: true,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "evt-2",
    title: "찾아가는 학교 메이커 교실",
    slug: "school-outreach-maker",
    description:
      "초·중등 대상 찾아가는 메이커 교육. 3D 모델링과 업사이클 프로토타이핑을 하루 과정으로 진행합니다.",
    category: "outreach",
    location: "제주 동여자중학교",
    start_at: "2026-09-24T04:00:00.000Z",
    end_at: "2026-09-24T07:30:00.000Z",
    capacity: 24,
    enrolled_count: 24,
    fee: 0,
    cover_image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1400",
    is_published: true,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "post-1",
    type: "notice",
    title: "2026년 하반기 교육·제작 문의 안내",
    slug: "priority-purchase-2026",
    content:
      "공공·학교 대상 교육 과정과 제작 문의는 견적/문의 페이지를 이용해 주세요. 담당자가 확인 후 회신합니다.",
    excerpt: "공공·학교 협력 및 견적 안내",
    cover_image: null,
    is_published: true,
    pinned: true,
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "post-2",
    type: "story",
    title: "학교 메이커 교실에서 나온 첫 프로토타입",
    slug: "school-prototype-story",
    content:
      "학생들이 폐플라스틱과 3D 프린팅을 결합해 문구 정리함을 만들었습니다.",
    excerpt: "지역 학교와 함께한 메이커 교육 이야기",
    cover_image: null,
    is_published: true,
    pinned: false,
    created_at: "2026-07-21T00:00:00.000Z",
    updated_at: "2026-07-21T00:00:00.000Z",
  },
  {
    id: "post-3",
    type: "faq",
    title: "공공기관도 구매·교육 의뢰가 가능한가요?",
    slug: "faq-public-purchase",
    content:
      "가능합니다. 교육 과정과 제작 의뢰에 대해 견적서를 발급합니다. 견적/문의 페이지로 연락 주세요.",
    excerpt: "공공 구매 FAQ",
    cover_image: null,
    is_published: true,
    pinned: false,
    created_at: "2026-07-10T00:00:00.000Z",
    updated_at: "2026-07-10T00:00:00.000Z",
  },
];

export const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: "pf-1",
    title: "제주 동여중 메이커 교실",
    slug: "jeju-dongyeo-maker-class",
    summary: "정규 교과 연계 메이커 수업 설계 및 운영",
    description:
      "3D 모델링·레이저 커팅을 활용한 문제해결 수업을 학기 단위로 운영했습니다.",
    category: "education",
    year: 2026,
    cover_image:
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1400",
    images: [],
    tags: ["학교", "교육"],
    is_published: true,
    sort_order: 1,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "pf-2",
    title: "마을 업사이클 리빙 컬렉션",
    slug: "village-upcycle-living",
    summary: "지역 폐기 소재를 리빙 소품으로 전환한 협업 프로젝트",
    description: "공방 네트워크와 함께 소량 생산 라인을 구축했습니다.",
    category: "product",
    year: 2025,
    cover_image:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1400",
    images: [],
    tags: ["업사이클", "제품"],
    is_published: true,
    sort_order: 2,
    created_at: "2025-11-01T00:00:00.000Z",
    updated_at: "2025-11-01T00:00:00.000Z",
  },
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    title: "사회적기업 인증서",
    issued_by: "고용노동부",
    issued_on: "2026-03-01",
    file_url: null,
    image_url: null,
    sort_order: 1,
  },
  {
    id: "cert-2",
    title: "경영공시 확인",
    issued_by: "한국사회적기업진흥원",
    issued_on: "2026-06-01",
    file_url: null,
    image_url: null,
    sort_order: 2,
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    event_id: "evt-1",
    name: "김도민",
    email: "domun@example.com",
    phone: "010-0000-0000",
    organization: "개인",
    message: "초등 자녀와 함께 참여하고 싶습니다.",
    status: "confirmed",
    created_at: "2026-08-10T00:00:00.000Z",
  },
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: "qt-1",
    name: "이담당",
    organization: "제주시 평생학습과",
    email: "public@example.com",
    phone: "064-000-1111",
    request_type: "education",
    budget_range: "300만원 이상",
    message: "찾아가는 메이커 교육 10회차 견적을 요청합니다.",
    status: "new",
    admin_note: null,
    created_at: "2026-08-12T00:00:00.000Z",
    updated_at: "2026-08-12T00:00:00.000Z",
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    order_number: "MB-20260818-0001",
    customer_name: "박구매",
    customer_email: "buyer@example.com",
    customer_phone: "010-1111-2222",
    address_line1: "제주특별자치도 제주시",
    address_line2: "",
    postal_code: "63100",
    shipping_memo: null,
    status: "paid",
    payment_id: "demo-pay-1",
    payment_method: "CARD",
    total_amount: 24000,
    created_at: "2026-08-18T00:00:00.000Z",
    updated_at: "2026-08-18T00:00:00.000Z",
  },
];

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    name: "최문의",
    email: "ask@example.com",
    phone: "010-3333-4444",
    title: "키트 단체 구매 가능한가요?",
    content: "학교 단위 20세트 구매를 검토 중입니다.",
    is_private: true,
    status: "open",
    created_at: "2026-08-15T00:00:00.000Z",
  },
];
