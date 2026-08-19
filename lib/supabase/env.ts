function normalizeSupabaseUrl(url: string) {
  return url
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "");
}

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url ? normalizeSupabaseUrl(url) : undefined;
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
