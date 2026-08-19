import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const schema = z.object({
  event_id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      status: "pending",
      message: "데모 모드: Supabase 연결 후 실제 정원 체크가 적용됩니다.",
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "서버 설정이 필요합니다." }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("submit_application", {
    p_event_id: parsed.data.event_id,
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_organization: parsed.data.organization,
    p_message: parsed.data.message,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ status: data?.status ?? "pending", data });
}
