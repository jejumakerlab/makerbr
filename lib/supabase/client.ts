import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export function createClient() {
  if (!isSupabaseConfigured()) return null;

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;

  return createBrowserClient(url, anonKey);
}
