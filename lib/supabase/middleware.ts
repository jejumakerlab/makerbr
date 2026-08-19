import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPath = request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminPath && !isLoginPath) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !["admin", "staff"].includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginPath && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && ["admin", "staff"].includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
