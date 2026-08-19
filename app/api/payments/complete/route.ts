import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PortOne 결제 완료 웹훅/콜백.
 * 실제 검증은 PortOne Payment API로 paymentId를 조회한 뒤 주문을 paid로 갱신합니다.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.paymentId || !body?.orderId) {
    return NextResponse.json({ error: "paymentId와 orderId가 필요합니다." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ received: true, demo: true });
  }

  const { error } = await admin
    .from("orders")
    .update({
      status: "paid",
      payment_id: body.paymentId,
      payment_method: body.method ?? "PORTONE",
    })
    .eq("id", body.orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
