import { createPublicClient } from "@/lib/supabase/public";
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
} from "@/types/database";

async function fromTable<T>(
  table: string,
  fallback: T[],
  build: (client: NonNullable<ReturnType<typeof createPublicClient>>) => Promise<T[] | null>,
): Promise<T[]> {
  const supabase = createPublicClient();
  if (!supabase) return fallback;
  try {
    const data = await build(supabase);
    return data && data.length > 0 ? data : fallback;
  } catch {
    return fallback;
  }
}

export async function getImpacts() {
  return fromTable<Impact>("impacts", MOCK_IMPACTS, async (supabase) => {
    const { data } = await supabase
      .from("impacts")
      .select("*")
      .order("sort_order", { ascending: true });
    return data as Impact[] | null;
  });
}

export async function getProducts(category?: string) {
  const products = await fromTable<Product>("products", MOCK_PRODUCTS, async (supabase) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return (data ?? []).map((row) => ({
      ...row,
      images: Array.isArray(row.images) ? row.images : [],
    })) as Product[];
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
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("start_at", { ascending: true });

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
    return withCounts;
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
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("is_published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return data as Post[] | null;
  });

  if (type) return posts.filter((item) => item.type === type);
  return posts;
}

export async function getPortfolios(category?: string) {
  const items = await fromTable<Portfolio>(
    "portfolios",
    MOCK_PORTFOLIOS,
    async (supabase) => {
      const { data } = await supabase
        .from("portfolios")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      return (data ?? []).map((row) => ({
        ...row,
        images: Array.isArray(row.images) ? row.images : [],
      })) as Portfolio[];
    },
  );

  if (category && category !== "all") {
    return items.filter((item) => item.category === category);
  }
  return items;
}

export async function getCertificates() {
  return fromTable<Certificate>("certificates", MOCK_CERTIFICATES, async (supabase) => {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .order("sort_order", { ascending: true });
    return data as Certificate[] | null;
  });
}
