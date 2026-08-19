import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";

export function createPublicClient() {
  if (!isSupabaseConfigured()) return null;

  return createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
