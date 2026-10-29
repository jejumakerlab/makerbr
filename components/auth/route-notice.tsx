"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function RouteNotice() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const notice = searchParams.get("notice");
    if (!notice || handled.current === notice) return;
    handled.current = notice;

    if (notice === "admin_required") {
      toast.error("관리자 권한이 필요합니다.");
    } else if (notice === "member_only") {
      toast.message("교육 신청과 상품 구매는 회원만 이용할 수 있어요. 로그인 또는 회원가입해 주세요.");
    } else if (notice === "profile_required") {
      toast.message("신청·구매 전에 이름, 연락처, 주소를 입력해 주세요.");
    } else if (notice === "auth_failed") {
      toast.error("로그인을 완료하지 못했습니다. 다시 시도해 주세요.");
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete("notice");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
