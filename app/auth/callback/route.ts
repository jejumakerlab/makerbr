import { NextResponse, type NextRequest } from "next/server";
import { isStaffRole, safeRedirectPath } from "@/lib/auth/paths";
import { isProfileComplete, profilePathFor } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

/**
 * 모든 로그인(이메일·구글·카카오·네이버)과 가입 인증 메일이 거쳐 가는 곳입니다.
 * 필수 회원정보가 비어 있으면 회원정보 입력 화면으로 먼저 보냅니다.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const redirectTo = safeRedirectPath(url.searchParams.get("redirect"));
  const to = (path: string) => NextResponse.redirect(new URL(path, url.origin));
  const loginFailed = () =>
    to(`/login?redirect=${encodeURIComponent(redirectTo)}&notice=auth_failed`);

  const supabase = await createClient();
  if (!supabase || url.searchParams.get("error")) return loginFailed();

  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] 세션 교환 실패", error.message);
      return loginFailed();
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return to(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isStaffRole(profile?.role) && !isProfileComplete(profile)) {
    return to(profilePathFor(redirectTo));
  }
  return to(redirectTo);
}
