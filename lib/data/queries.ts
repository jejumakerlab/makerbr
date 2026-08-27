import { cache } from "react";
import { connection } from "next/server";
import { createPublicClient, type PublicSupabaseClient } from "@/lib/supabase/public";
import { mergeSiteSettings, SITE, type SiteContent } from "@/lib/constants";
import {
  MOCK_CERTIFICATES,
  MOCK_EVENTS,
  MOCK_IMPACTS,
  MOCK_PORTFOLIOS,
  MOCK_POSTS,
  MOCK_PRODUCTS,
} from "@/lib/mock-data";
import type {
  Certificate,
  EventItem,
  Impact,
  Portfolio,
  Post,
  PostType,
  Product,
  SiteSetting,
} from "@/types/database";

type QueryError = { message: string } | null;

type QueryResult<T> = {
  data: T[] | null;
  error: QueryError;
};

/**
 * DB 조회가 성공하면 그 결과(빈 배열 포함)를 그대로 씁니다.
 * Fallback은 클라이언트가 없거나 쿼리가 실패할 때만 사용합니다.
 */
async function fromTable<T>(
  table: string,
  fallback: T[],
  build: (client: PublicSupabaseClient) => Promise<QueryResult<T>>,
): Promise<T[]> {
  await connection();
  const supabase = createPublicClient();
  if (!supabase) {
    console.warn(`[data] ${table}: Supabase 미설정 — fallback 사용`);
    return fallback;
  }

  try {
    const { data, error } = await build(supabase);
    if (error) {
      console.error(`[data] ${table}: 조회 실패 — fallback 사용`, error.message);
      return fallback;
    }
    return data ?? [];
  } catch (err) {
    console.error(`[data] ${table}: 예외 — fallback 사용`, err);
    return fallback;
  }
}

export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteContent> {
  await connection();
  const supabase = createPublicClient();
  if (!supabase) {
    console.warn("[data] site_settings: Supabase 미설정 — SITE 기본값 사용");
    return { ...SITE };
  }

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) {
      console.error("[data] site_settings: 조회 실패 — SITE 기본값 사용", error.message);
      return { ...SITE };
    }

    return mergeSiteSettings((data ?? []) as Pick<SiteSetting, "key" | "value">[]);
  } catch (err) {
    console.error("[data] site_settings: 예외 — SITE 기본값 사용", err);
    return { ...SITE };
  }
});

export async function getImpacts() {
  return fromTable<Impact>("impacts", MOCK_IMPACTS, async (supabase) => {
    const { data, error } = await supabase
      .from("impacts")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data: data as Impact[] | null, error };
  });
}

export async function getProducts(category?: string) {
  const products = await fromTable<Product>("products", MOCK_PRODUCTS, async (supabase) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error };

    return {
      data: (data ?? []).map((row) => ({
        ...row,
        images: Array.isArray(row.images) ? row.images : [],
      })) as Product[],
      error: null,
    };
  });

  if (category && category !== "all") {
    return products.filter((item) => item.category === category);
  }
  return products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((item) => item.slug === slug) ?? null;
}

export async function getEvents(category?: string) {
  const events = await fromTable<EventItem>("events", MOCK_EVENTS, async (supabase) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("start_at", { ascending: true });

    if (error) return { data: null, error };

    const rows = (data ?? []) as Omit<EventItem, "enrolled_count">[];
    const withCounts: EventItem[] = [];
    for (const row of rows) {
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("event_id", row.id)
        .in("status", ["pending", "confirmed"]);
      withCounts.push({ ...row, enrolled_count: count ?? 0 });
    }
    return { data: withCounts, error: null };
  });

  if (category && category !== "all") {
    return events.filter((item) => item.category === category);
  }
  return events;
}

export async function getEventBySlug(slug: string) {
  const events = await getEvents();
  return events.find((item) => item.slug === slug) ?? null;
}

export async function getPosts(type?: PostType) {
  const posts = await fromTable<Post>("posts", MOCK_POSTS, async (supabase) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("is_published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return { data: data as Post[] | null, error };
  });

  if (type) return posts.filter((item) => item.type === type);
  return posts;
}

export async function getPortfolios(category?: string) {
  const items = await fromTable<Portfolio>("portfolios", MOCK_PORTFOLIOS, async (supabase) => {
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error };

    return {
      data: (data ?? []).map((row) => ({
        ...row,
        images: Array.isArray(row.images) ? row.images : [],
      })) as Portfolio[],
      error: null,
    };
  });

  if (category && category !== "all") {
    return items.filter((item) => item.category === category);
  }
  return items;
}

export async function getCertificates() {
  return fromTable<Certificate>("certificates", MOCK_CERTIFICATES, async (supabase) => {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data: data as Certificate[] | null, error };
  });
}
