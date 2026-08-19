import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_RESOURCES } from "@/lib/admin/resources";
import { MOCK_TABLES } from "@/lib/api/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminResourceName } from "@/types/database";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { resource } = await context.params;
  if (!PUBLIC_RESOURCES.includes(resource as (typeof PUBLIC_RESOURCES)[number])) {
    return NextResponse.json({ error: "공개 API가 아닙니다." }, { status: 404 });
  }

  const name = resource as AdminResourceName;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: MOCK_TABLES[name], demo: true });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ data: MOCK_TABLES[name], demo: true });
  }

  let query = supabase.from(name).select("*");
  if (["products", "events", "posts", "portfolios"].includes(name)) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data: data ?? [] });
}
