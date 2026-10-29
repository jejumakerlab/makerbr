import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/admin";

const EDITABLE_KEYS = new Set(["impact_description"]);
const MAX_LENGTH = 500;

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    key?: unknown;
    value?: unknown;
  } | null;

  const key = typeof body?.key === "string" ? body.key : "";
  const value = typeof body?.value === "string" ? body.value.trim() : "";

  if (!EDITABLE_KEYS.has(key)) {
    return NextResponse.json({ error: "수정할 수 없는 설정입니다." }, { status: 400 });
  }
  if (value.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `${MAX_LENGTH}자 이하로 입력해 주세요.` },
      { status: 400 },
    );
  }

  const auth = await requireStaff();
  if (auth.error) return auth.error;
  if (auth.demo || !auth.supabase) {
    return NextResponse.json({ data: { key, value }, demo: true });
  }

  const { data, error } = await auth.supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" })
    .select("key, value")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}
