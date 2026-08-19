import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { getAuthState } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "마이페이지",
};

export default async function MyPage() {
  const auth = await getAuthState();
  if (!auth.user) {
    redirect("/login?redirect=/mypage");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">마이페이지</h1>
      <div className="bg-card mt-8 rounded-2xl border p-6">
        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">이름</dt>
            <dd className="mt-1 text-base font-medium">
              {auth.profile?.full_name || "미입력"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">이메일</dt>
            <dd className="mt-1 text-base font-medium">{auth.user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">연락처</dt>
            <dd className="mt-1 text-base font-medium">
              {auth.profile?.phone || "미입력"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">권한</dt>
            <dd className="mt-1 text-base font-medium">
              {auth.isStaff
                ? auth.profile?.role === "admin"
                  ? "관리자"
                  : "스태프"
                : "회원"}
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          {auth.isStaff ? (
            <Link href="/admin" className={cn(buttonVariants({ size: "xl" }))}>
              관리자 모드
            </Link>
          ) : null}
          <LogoutButton className="border" />
        </div>
      </div>
    </div>
  );
}
