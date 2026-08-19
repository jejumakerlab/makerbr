import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_RESOURCES } from "@/lib/admin/resources";
import type { AdminResourceName } from "@/types/database";
import {
  MOCK_APPLICATIONS,
  MOCK_CERTIFICATES,
  MOCK_EVENTS,
  MOCK_IMPACTS,
  MOCK_INQUIRIES,
  MOCK_ORDERS,
  MOCK_PORTFOLIOS,
  MOCK_POSTS,
  MOCK_PRODUCTS,
  MOCK_QUOTES,
} from "@/lib/mock-data";

export function isAdminResource(value: string): value is AdminResourceName {
  return value in ADMIN_RESOURCES;
}

export async function requireStaff() {
  const supabase = await createClient();
  if (!supabase) {
    return { supabase: null, demo: true as const, error: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      supabase,
      demo: false as const,
      error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return {
      supabase,
      demo: false as const,
      error: NextResponse.json({ error: "권한이 없습니다." }, { status: 403 }),
    };
  }

  return { supabase, demo: false as const, error: null };
}

export const MOCK_TABLES: Record<AdminResourceName, unknown[]> = {
  products: MOCK_PRODUCTS,
  events: MOCK_EVENTS,
  applications: MOCK_APPLICATIONS,
  posts: MOCK_POSTS,
  quotes: MOCK_QUOTES,
  impacts: MOCK_IMPACTS,
  orders: MOCK_ORDERS,
  portfolios: MOCK_PORTFOLIOS,
  certificates: MOCK_CERTIFICATES,
  inquiries: MOCK_INQUIRIES,
};
