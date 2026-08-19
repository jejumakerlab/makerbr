import { NextResponse } from "next/server";
import { isAdminResource, requireStaff } from "@/lib/api/admin";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const { resource, id } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "지원하지 않는 리소스입니다." }, { status: 404 });
  }

  const body = await request.json();
  const auth = await requireStaff();
  if (auth.error) return auth.error;
  if (auth.demo || !auth.supabase) {
    return NextResponse.json({ data: { id, ...body }, demo: true });
  }

  const { data, error } = await auth.supabase
    .from(resource)
    .update(body)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, context: Ctx) {
  const { resource, id } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "지원하지 않는 리소스입니다." }, { status: 404 });
  }

  const auth = await requireStaff();
  if (auth.error) return auth.error;
  if (auth.demo || !auth.supabase) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const { error } = await auth.supabase.from(resource).delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
