import { NextResponse } from "next/server";

/**
 * 카드 결제(토스페이먼츠 등) 완료 콜백 자리.
 * 결제사 API로 결제 금액·상태를 검증하는 로직 없이 주문을 '결제완료'로 바꾸면
 * 누구나 요청 한 번으로 주문을 결제 처리할 수 있으므로, 연동 전까지는 막아 둡니다.
 */
export async function POST() {
  return NextResponse.json(
    { error: "카드 결제는 준비 중입니다." },
    { status: 501 },
  );
}
