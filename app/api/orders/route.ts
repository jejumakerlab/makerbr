import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompleteMember } from "@/lib/auth/member";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { shippingFeeFor } from "@/lib/store/shipping";

const text = (max: number) => z.string().trim().max(max);

const schema = z.object({
  buyer_name: text(50).min(1),
  buyer_phone: text(30).min(1),
  buyer_email: z.string().trim().email(),
  delivery_method: z.enum(["택배", "방문수령"]),
  recipient_name: text(50).optional(),
  recipient_phone: text(30).optional(),
  zipcode: text(10).optional(),
  address: text(200).optional(),
  address_detail: text(200).optional(),
  delivery_memo: text(300).optional(),
  payment_method: z.enum(["무통장입금/계좌이체", "기관 후불/세금계산서", "카드결제(준비중)"]),
  depositor_name: text(50).optional(),
  billing_memo: text(1000).optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
        custom_memo: text(200).optional(),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "주문 정보를 확인해 주세요." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      order: {
        id: crypto.randomUUID(),
        order_number: "MB-DEMO-001",
        items_total: 0,
        shipping_fee: shippingFeeFor(0),
        total_amount: 0,
        payment_method: parsed.data.payment_method,
        delivery_method: parsed.data.delivery_method,
      },
    });
  }

  const member = await requireCompleteMember();
  if (member.error) return member.error;

  // 로그인 세션을 그대로 넘겨야 place_order() 안에서 auth.uid() 로 회원 주문이 연결됩니다.
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "서버 설정이 필요합니다." }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("place_order", { p_order: parsed.data });
  if (error) {
    // PGRST202: supabase/orders.sql 이 아직 실행되지 않아 place_order() 가 없는 경우
    if (error.code === "PGRST202") {
      console.error("[orders] place_order 함수가 없습니다. supabase/orders.sql 을 실행하세요.");
      return NextResponse.json(
        { error: "주문 기능을 준비 중입니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ order: data });
}
