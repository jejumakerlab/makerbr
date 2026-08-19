import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const schema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  address_line1: z.string().min(1),
  address_line2: z.string().optional().nullable(),
  shipping_memo: z.string().optional().nullable(),
  total_amount: z.number().nonnegative(),
  items: z.array(
    z.object({
      product_id: z.string(),
      product_name: z.string(),
      unit_price: z.number(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "주문 정보를 확인해 주세요." }, { status: 400 });
  }

  const orderNumber = `MB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      order_number: orderNumber,
      paymentReady: Boolean(process.env.NEXT_PUBLIC_PORTONE_STORE_ID),
    });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "주문 서버 설정이 필요합니다." }, { status: 500 });
  }

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      customer_phone: parsed.data.customer_phone,
      postal_code: parsed.data.postal_code,
      address_line1: parsed.data.address_line1,
      address_line2: parsed.data.address_line2,
      shipping_memo: parsed.data.shipping_memo,
      total_amount: parsed.data.total_amount,
      status: "pending",
    })
    .select("id, order_number")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: itemError } = await admin.from("order_items").insert(
    parsed.data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
    })),
  );

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 400 });
  }

  return NextResponse.json({
    id: order.id,
    order_number: order.order_number,
    paymentReady: Boolean(process.env.NEXT_PUBLIC_PORTONE_STORE_ID),
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? null,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? null,
  });
}
