import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";

export async function createClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 set이 실패할 수 있음 — middleware가 세션을 갱신함
          }
        },
      },
    },
  );
}
