import type { DeliveryMethod, OrderStatus, PaymentMethod } from "@/types/database";

/** 정상 진행 순서. '취소'는 흐름 밖의 상태입니다. */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "입금대기",
  "결제완료",
  "제작/준비중",
  "배송중",
  "배송완료",
];

export const ORDER_STATUSES: OrderStatus[] = [...ORDER_STATUS_FLOW, "취소"];

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  입금대기: "bg-amber-50 text-amber-700 ring-amber-600/20",
  결제완료: "bg-sky-50 text-sky-700 ring-sky-600/20",
  "제작/준비중": "bg-violet-50 text-violet-700 ring-violet-600/20",
  배송중: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  배송완료: "bg-slate-100 text-slate-700 ring-slate-500/20",
  취소: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[index + 1];
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; available: boolean }[] = [
  { value: "무통장입금/계좌이체", label: "무통장 입금", available: true },
  { value: "기관 후불/세금계산서", label: "기관·학교 후불", available: true },
  { value: "카드결제(준비중)", label: "신용카드", available: false },
];

export const DELIVERY_METHODS: { value: DeliveryMethod; label: string }[] = [
  { value: "택배", label: "일반 택배 배송" },
  { value: "방문수령", label: "제주 현장 방문 수령" },
];

export const TRACKING_CARRIERS = [
  "CJ대한통운",
  "우체국택배",
  "한진택배",
  "롯데택배",
  "로젠택배",
  "경동택배",
  "기타",
] as const;

export const LAST_ORDER_STORAGE_KEY = "makerbridge-last-order";

export type PlacedOrder = {
  id: string;
  order_number: string;
  items_total: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  buyer_name: string;
  depositor_name: string | null;
};

export function formatOrderDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
