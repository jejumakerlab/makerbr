export type UserRole = "user" | "staff" | "admin";

export type ProductCategory = "자체 상품" | "메이커 협업" | "업사이클" | "교육 키트";
export type EventCategory = "workshop" | "education" | "outreach" | "exhibition";
export type PostType = "notice" | "story" | "faq";
export type ApplicationStatus = "pending" | "confirmed" | "cancelled" | "waitlist";
export type QuoteStatus = "new" | "reviewing" | "quoted" | "closed";
export type QuoteType = "product" | "education" | "custom";
export type OrderStatus = "입금대기" | "결제완료" | "제작/준비중" | "배송중" | "배송완료" | "취소";
export type PaymentMethod = "무통장입금/계좌이체" | "기관 후불/세금계산서" | "카드결제(준비중)";
export type DeliveryMethod = "택배" | "방문수령";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category: ProductCategory;
  maker_name: string;
  name: string;
  /** 실제 판매가 */
  price: number;
  /** 할인 전 정가. 값이 있으면 취소선으로 표시 */
  original_price: number | null;
  thumbnail_url: string;
  detail_images: string[] | null;
  summary: string | null;
  description: string | null;
  stock: number;
  is_visible: boolean;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: EventCategory;
  location: string | null;
  start_at: string | null;
  end_at: string | null;
  capacity: number;
  enrolled_count: number;
  fee: number;
  cover_image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
};

export type Post = {
  id: string;
  type: PostType;
  title: string;
  slug: string | null;
  content: string | null;
  excerpt: string | null;
  cover_image: string | null;
  is_published: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type Quote = {
  id: string;
  name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  request_type: QuoteType;
  budget_range: string | null;
  message: string;
  status: QuoteStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Impact = {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string | null;
  description: string | null;
  sort_order: number;
  updated_at: string;
};

export type Portfolio = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: string;
  year: number | null;
  cover_image: string | null;
  images: string[];
  tags: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Certificate = {
  id: string;
  title: string;
  issued_by: string | null;
  issued_on: string | null;
  file_url: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string;
  content: string;
  is_private: boolean;
  status: "open" | "answered" | "closed";
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  delivery_method: DeliveryMethod;
  recipient_name: string | null;
  recipient_phone: string | null;
  zipcode: string | null;
  address: string | null;
  address_detail: string | null;
  delivery_memo: string | null;
  payment_method: PaymentMethod;
  /** 무통장 입금자명 */
  depositor_name: string | null;
  /** 기관 후불: 기관·담당자 연락처, 세금계산서 요청 메모 */
  billing_memo: string | null;
  items_total: number;
  shipping_fee: number;
  total_amount: number;
  status: OrderStatus;
  tracking_carrier: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  thumbnail_url: string | null;
  price: number;
  quantity: number;
  custom_memo: string | null;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type SiteSetting = {
  key: string;
  value: string;
  updated_at: string;
};

export type AdminResourceName =
  | "products"
  | "events"
  | "applications"
  | "posts"
  | "quotes"
  | "impacts"
  | "orders"
  | "portfolios"
  | "certificates"
  | "inquiries";
