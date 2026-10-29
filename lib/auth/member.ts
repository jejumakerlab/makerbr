import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth/session";

/** 교육 신청·주문 API 공통: 로그인 회원이고 필수 회원정보가 있어야 합니다. */
export async function requireCompleteMember() {
  const auth = await getAuthState();
  if (!auth.user) {
    return {
      auth,
      error: NextResponse.json(
        { error: "로그인한 회원만 이용할 수 있습니다.", code: "LOGIN_REQUIRED" },
        { status: 401 },
      ),
    };
  }
  if (!auth.profileComplete && !auth.isStaff) {
    return {
      auth,
      error: NextResponse.json(
        {
          error: "회원정보(이름·연락처·주소)를 먼저 입력해 주세요.",
          code: "PROFILE_INCOMPLETE",
        },
        { status: 403 },
      ),
    };
  }
  return { auth, error: null };
}
