export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 50000;

export const SHIPPING_NOTICE = `기본 배송비 ${SHIPPING_FEE.toLocaleString("ko-KR")}원 · ${FREE_SHIPPING_THRESHOLD.toLocaleString("ko-KR")}원 이상 구매 시 무료배송`;

/** 상품 금액 합계 기준 배송비. 담긴 상품이 없으면 0원 */
export function shippingFeeFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function discountRate(price: number, originalPrice: number | null) {
  if (originalPrice == null || originalPrice <= price || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
