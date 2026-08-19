import type { AdminResourceName } from "@/types/database";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "datetime"
  | "date"
  | "json";

export type AdminField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type AdminResourceConfig = {
  name: AdminResourceName;
  label: string;
  description: string;
  fields: AdminField[];
};

export const ADMIN_RESOURCES: Record<AdminResourceName, AdminResourceConfig> = {
  products: {
    name: "products",
    label: "상품",
    description: "메이커 스토어 상품을 등록·수정합니다.",
    fields: [
      { name: "name", label: "상품명", type: "text", required: true },
      { name: "slug", label: "슬러그", type: "text", required: true },
      { name: "description", label: "설명", type: "textarea" },
      { name: "price", label: "정가(원)", type: "number", required: true },
      { name: "sale_price", label: "할인가(원)", type: "number" },
      {
        name: "category",
        label: "카테고리",
        type: "select",
        required: true,
        options: [
          { value: "goods", label: "자체 상품" },
          { value: "maker", label: "메이커 협업" },
          { value: "upcycled", label: "업사이클" },
          { value: "education", label: "교육 키트" },
        ],
      },
      { name: "images", label: "이미지 URL JSON", type: "json" },
      { name: "stock", label: "재고", type: "number" },
      { name: "maker_name", label: "메이커/브랜드", type: "text" },
      { name: "is_published", label: "공개", type: "checkbox" },
    ],
  },
  events: {
    name: "events",
    label: "교육/이벤트",
    description: "교육·워크숍 일정을 관리합니다.",
    fields: [
      { name: "title", label: "제목", type: "text", required: true },
      { name: "slug", label: "슬러그", type: "text", required: true },
      { name: "description", label: "설명", type: "textarea" },
      {
        name: "category",
        label: "유형",
        type: "select",
        options: [
          { value: "workshop", label: "워크숍" },
          { value: "education", label: "메이커 교육" },
          { value: "outreach", label: "찾아가는 교육" },
          { value: "exhibition", label: "전시/행사" },
        ],
      },
      { name: "location", label: "장소", type: "text" },
      { name: "start_at", label: "시작", type: "datetime" },
      { name: "end_at", label: "종료", type: "datetime" },
      { name: "capacity", label: "정원", type: "number" },
      { name: "fee", label: "참가비(원)", type: "number" },
      { name: "cover_image", label: "대표 이미지 URL", type: "text" },
      { name: "is_published", label: "공개", type: "checkbox" },
    ],
  },
  applications: {
    name: "applications",
    label: "교육 신청자",
    description: "참가 신청 명단과 상태를 관리합니다.",
    fields: [
      { name: "event_id", label: "이벤트 ID", type: "text", required: true },
      { name: "name", label: "이름", type: "text", required: true },
      { name: "email", label: "이메일", type: "text", required: true },
      { name: "phone", label: "연락처", type: "text" },
      { name: "organization", label: "소속", type: "text" },
      { name: "message", label: "메모", type: "textarea" },
      {
        name: "status",
        label: "상태",
        type: "select",
        options: [
          { value: "pending", label: "대기" },
          { value: "confirmed", label: "확정" },
          { value: "waitlist", label: "대기자" },
          { value: "cancelled", label: "취소" },
        ],
      },
    ],
  },
  posts: {
    name: "posts",
    label: "공지/게시글",
    description: "공지, 활동 스토리, FAQ를 관리합니다.",
    fields: [
      {
        name: "type",
        label: "유형",
        type: "select",
        required: true,
        options: [
          { value: "notice", label: "공지사항" },
          { value: "story", label: "활동 스토리" },
          { value: "faq", label: "FAQ" },
        ],
      },
      { name: "title", label: "제목", type: "text", required: true },
      { name: "slug", label: "슬러그", type: "text" },
      { name: "excerpt", label: "요약", type: "text" },
      { name: "content", label: "본문", type: "textarea" },
      { name: "cover_image", label: "이미지 URL", type: "text" },
      { name: "pinned", label: "상단 고정", type: "checkbox" },
      { name: "is_published", label: "공개", type: "checkbox" },
    ],
  },
  quotes: {
    name: "quotes",
    label: "견적 요청",
    description: "맞춤 제작·교육 견적 요청을 처리합니다.",
    fields: [
      { name: "name", label: "이름", type: "text", required: true },
      { name: "organization", label: "기관/단체", type: "text" },
      { name: "email", label: "이메일", type: "text", required: true },
      { name: "phone", label: "연락처", type: "text" },
      {
        name: "request_type",
        label: "유형",
        type: "select",
        options: [
          { value: "product", label: "제품/제작" },
          { value: "education", label: "교육" },
          { value: "custom", label: "기타 맞춤" },
        ],
      },
      { name: "budget_range", label: "예산 범위", type: "text" },
      { name: "message", label: "요청 내용", type: "textarea", required: true },
      {
        name: "status",
        label: "상태",
        type: "select",
        options: [
          { value: "new", label: "신규" },
          { value: "reviewing", label: "검토중" },
          { value: "quoted", label: "견적발송" },
          { value: "closed", label: "종료" },
        ],
      },
      { name: "admin_note", label: "관리자 메모", type: "textarea" },
    ],
  },
  impacts: {
    name: "impacts",
    label: "성과 수치",
    description: "메인 화면 Impact Counter 값을 수정합니다.",
    fields: [
      { name: "key", label: "키", type: "text", required: true },
      { name: "label", label: "표시명", type: "text", required: true },
      { name: "value", label: "수치", type: "number", required: true },
      { name: "unit", label: "단위", type: "text" },
      { name: "description", label: "설명", type: "text" },
      { name: "sort_order", label: "정렬", type: "number" },
    ],
  },
  orders: {
    name: "orders",
    label: "주문/배송",
    description: "결제 주문과 배송 상태를 관리합니다.",
    fields: [
      { name: "order_number", label: "주문번호", type: "text", required: true },
      { name: "customer_name", label: "주문자", type: "text", required: true },
      { name: "customer_email", label: "이메일", type: "text" },
      { name: "customer_phone", label: "연락처", type: "text" },
      { name: "address_line1", label: "주소", type: "text" },
      { name: "postal_code", label: "우편번호", type: "text" },
      { name: "shipping_memo", label: "배송 메모", type: "text" },
      {
        name: "status",
        label: "상태",
        type: "select",
        options: [
          { value: "pending", label: "결제대기" },
          { value: "paid", label: "결제완료" },
          { value: "preparing", label: "준비중" },
          { value: "shipped", label: "발송" },
          { value: "delivered", label: "배송완료" },
          { value: "cancelled", label: "취소" },
          { value: "refunded", label: "환불" },
        ],
      },
      { name: "total_amount", label: "결제금액", type: "number" },
      { name: "payment_id", label: "결제 ID", type: "text" },
    ],
  },
  portfolios: {
    name: "portfolios",
    label: "포트폴리오",
    description: "프로젝트 성과 카드를 관리합니다.",
    fields: [
      { name: "title", label: "제목", type: "text", required: true },
      { name: "slug", label: "슬러그", type: "text", required: true },
      { name: "summary", label: "요약", type: "text" },
      { name: "description", label: "설명", type: "textarea" },
      {
        name: "category",
        label: "분야",
        type: "select",
        options: [
          { value: "education", label: "교육" },
          { value: "public", label: "공공협력" },
          { value: "product", label: "제품개발" },
          { value: "community", label: "지역사회" },
        ],
      },
      { name: "year", label: "연도", type: "number" },
      { name: "cover_image", label: "커버 이미지 URL", type: "text" },
      { name: "is_published", label: "공개", type: "checkbox" },
    ],
  },
  certificates: {
    name: "certificates",
    label: "인증/공시",
    description: "인증서·경영공시 자료를 관리합니다.",
    fields: [
      { name: "title", label: "제목", type: "text", required: true },
      { name: "issued_by", label: "발급기관", type: "text" },
      { name: "issued_on", label: "발급일", type: "date" },
      { name: "file_url", label: "파일 URL", type: "text" },
      { name: "image_url", label: "이미지 URL", type: "text" },
      { name: "sort_order", label: "정렬", type: "number" },
    ],
  },
  inquiries: {
    name: "inquiries",
    label: "고객 문의",
    description: "커뮤니티 문의 게시글을 관리합니다.",
    fields: [
      { name: "name", label: "이름", type: "text", required: true },
      { name: "email", label: "이메일", type: "text", required: true },
      { name: "phone", label: "연락처", type: "text" },
      { name: "title", label: "제목", type: "text", required: true },
      { name: "content", label: "내용", type: "textarea", required: true },
      { name: "is_private", label: "비공개", type: "checkbox" },
      {
        name: "status",
        label: "상태",
        type: "select",
        options: [
          { value: "open", label: "미답변" },
          { value: "answered", label: "답변완료" },
          { value: "closed", label: "종료" },
        ],
      },
    ],
  },
};

export const PUBLIC_RESOURCES = [
  "products",
  "events",
  "posts",
  "impacts",
  "portfolios",
  "certificates",
] as const;
