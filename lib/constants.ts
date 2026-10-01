export const SITE = {
  nameKo: "메이커브릿지",
  nameEn: "Maker Bridge",
  slogan: "만드는 사람과 세상을 잇다",
  description:
    "제주 기반 메이커브릿지. 메이커 교육, 로컬 제작, 친환경 스토어와 공공 협업을 한곳에서 연결합니다.",
  legalName: "주식회사 메이커브릿지",
  email: "makerbr@naver.com",
  phone: "064-725-6728",
  phoneHref: "tel:0647256728",
  fax: "0504-244-6728",
  postalCode: "63227",
  address: "제주특별자치도 제주시 승천로 57, 3층 비즈테이블 104호",
  hours: "평일 09:00 – 18:00 (토·일·공휴일 휴무)",
  weekdayHours: "09시 - 18시",
  holidays: "토, 일, 공휴일",
  ceo: "이다혜",
  businessNumber: "599-81-04086",
  mailOrderNumber: "제 2026-제주아라-0104호",
  privacyOfficer: "이다혜",
  bankName: "우리은행",
  bankAccount: "1005-904-959437",
  bankHolder: "(주)메이커브릿지",
} as const;

export type SiteContent = {
  nameKo: string;
  nameEn: string;
  slogan: string;
  description: string;
  legalName: string;
  email: string;
  phone: string;
  phoneHref: string;
  fax: string;
  postalCode: string;
  address: string;
  hours: string;
  weekdayHours: string;
  holidays: string;
  ceo: string;
  businessNumber: string;
  mailOrderNumber: string;
  privacyOfficer: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
};

export function phoneToHref(phone: string) {
  return `tel:${phone.replace(/\D/g, "")}`;
}

const STALE_SITE_VALUES = new Set([
  "제주특별자치도 제주시",
  "제주특별자치도 제주시 승천로 57, 3층 104호",
  "hello@makerbridge.kr",
  "064-000-0000",
  "000-00-00000",
  "제0000-00호",
]);

function settingOrDefault(value: string | undefined, fallback: string) {
  if (!value || STALE_SITE_VALUES.has(value)) return fallback;
  return value;
}

/** `site_settings` 행을 SITE 기본값 위에 덮어씁니다. 조회 실패 시에만 호출하지 않습니다. */
export function mergeSiteSettings(
  rows: { key: string; value: string }[],
): SiteContent {
  const map: Record<string, string> = {};
  for (const row of rows) {
    const value = row.value?.trim();
    if (row.key && value) map[row.key] = value;
  }

  const phone = settingOrDefault(map.phone, SITE.phone);
  return {
    nameKo: map.name_ko ?? SITE.nameKo,
    nameEn: map.name_en ?? SITE.nameEn,
    slogan: map.slogan ?? SITE.slogan,
    description: map.hero_sub ?? map.description ?? SITE.description,
    legalName: map.legal_name ?? SITE.legalName,
    email: settingOrDefault(map.email, SITE.email),
    phone,
    phoneHref: phoneToHref(phone),
    fax: map.fax ?? SITE.fax,
    postalCode: map.postal_code ?? SITE.postalCode,
    address: settingOrDefault(map.address, SITE.address),
    hours: map.hours ?? SITE.hours,
    weekdayHours: map.weekday_hours ?? SITE.weekdayHours,
    holidays: map.holidays ?? SITE.holidays,
    ceo: map.ceo ?? SITE.ceo,
    businessNumber: settingOrDefault(map.business_number, SITE.businessNumber),
    mailOrderNumber: map.mail_order_number ?? SITE.mailOrderNumber,
    privacyOfficer: map.privacy_officer ?? SITE.privacyOfficer,
    bankName: map.bank_name ?? SITE.bankName,
    bankAccount: map.bank_account ?? SITE.bankAccount,
    bankHolder: map.bank_holder ?? SITE.bankHolder,
  };
}

export const SNS = [
  {
    id: "instagram",
    name: "Instagram",
    href: "https://www.instagram.com/maker__bridge",
    label: "메이커브릿지 인스타그램 (새 창)",
  },
  {
    id: "kakao",
    name: "KakaoTalk",
    href: "https://pf.kakao.com/_xcSqxiX",
    label: "메이커브릿지 카카오톡 채널 (새 창)",
  },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "메인" },
  { href: "/about", label: "회사소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/store", label: "메이커 스토어" },
  { href: "/events", label: "교육/이벤트" },
  { href: "/community", label: "커뮤니티" },
  { href: "/contact", label: "견적/문의" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "대시보드", resource: null },
  { href: "/admin/products", label: "상품 관리", resource: "products" },
  { href: "/admin/orders", label: "주문/배송", resource: "orders" },
  { href: "/admin/events", label: "교육 일정", resource: "events" },
  {
    href: "/admin/applications",
    label: "교육 신청자",
    resource: "applications",
  },
  { href: "/admin/posts", label: "공지/게시글", resource: "posts" },
  { href: "/admin/quotes", label: "견적 요청", resource: "quotes" },
  { href: "/admin/impacts", label: "성과 수치", resource: "impacts" },
  { href: "/admin/portfolios", label: "포트폴리오", resource: "portfolios" },
  { href: "/admin/certificates", label: "인증/공시", resource: "certificates" },
  { href: "/admin/inquiries", label: "고객 문의", resource: "inquiries" },
] as const;

export const PRODUCT_CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "goods", label: "자체 상품" },
  { value: "maker", label: "메이커 협업" },
  { value: "upcycled", label: "업사이클" },
  { value: "education", label: "교육 키트" },
] as const;

export const EVENT_CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "workshop", label: "워크숍" },
  { value: "education", label: "메이커 교육" },
  { value: "outreach", label: "찾아가는 교육" },
  { value: "exhibition", label: "전시/행사" },
] as const;

export const PORTFOLIO_CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "education", label: "교육" },
  { value: "public", label: "공공협력" },
  { value: "product", label: "제품개발" },
  { value: "community", label: "지역사회" },
] as const;

export const POST_TYPES = [
  { value: "notice", label: "공지사항" },
  { value: "story", label: "활동 스토리" },
  { value: "faq", label: "FAQ" },
] as const;
