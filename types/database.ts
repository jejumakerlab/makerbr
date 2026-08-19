export type UserRole = "user" | "staff" | "admin";

export type ProductCategory = "goods" | "maker" | "upcycled" | "education";
export type EventCategory = "workshop" | "education" | "outreach" | "exhibition";
export type PostType = "notice" | "story" | "faq";
export type ApplicationStatus = "pending" | "confirmed" | "cancelled" | "waitlist";
export type QuoteStatus = "new" | "reviewing" | "quoted" | "closed";
export type QuoteType = "product" | "education" | "custom";
export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: ProductCategory;
  images: string[];
  stock: number;
  is_published: boolean;
  maker_name: string | null;
  tags: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
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
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  shipping_memo: string | null;
  status: OrderStatus;
  payment_id: string | null;
  payment_method: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
};

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
