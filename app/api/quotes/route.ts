import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const schema = z.object({
  name: z.string().min(1),
  organization: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  request_type: z.enum(["product", "education", "custom"]).default("custom"),
  budget_range: z.string().optional().nullable(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, id: crypto.randomUUID() });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "서버 설정이 필요합니다." }, { status: 500 });
  }

  const { data, error } = await supabase.from("quotes").insert(parsed.data).select("id").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ id: data.id });
}
