import { NextResponse } from "next/server";
import { isAdminResource, MOCK_TABLES, requireStaff } from "@/lib/api/admin";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { resource } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "지원하지 않는 리소스입니다." }, { status: 404 });
  }

  const auth = await requireStaff();
  if (auth.error) return auth.error;
  if (auth.demo || !auth.supabase) {
    return NextResponse.json({ data: MOCK_TABLES[resource], demo: true });
  }

  const { data, error } = await auth.supabase
    .from(resource)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await auth.supabase.from(resource).select("*");
    if (fallback.error) {
      return NextResponse.json({ error: fallback.error.message }, { status: 400 });
    }
    return NextResponse.json({ data: fallback.data ?? [] });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request, context: Ctx) {
  const { resource } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "지원하지 않는 리소스입니다." }, { status: 404 });
  }

  const body = await request.json();
  const auth = await requireStaff();
  if (auth.error) return auth.error;
  if (auth.demo || !auth.supabase) {
    return NextResponse.json({ data: { id: crypto.randomUUID(), ...body }, demo: true });
  }

  const { data, error } = await auth.supabase.from(resource).insert(body).select("*").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}
