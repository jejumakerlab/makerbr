import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthState } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/paths";

export const metadata: Metadata = {
  title: "로그인",
  description: "메이커브릿지 회원 로그인",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = safeRedirectPath(redirectParam);
  const auth = await getAuthState();
  if (auth.user) {
    redirect(redirectTo);
  }

  return (
    <AuthCard
      title="로그인"
      description="교육 신청과 상품 구매는 회원만 이용할 수 있어요. 소셜 계정이나 이메일로 로그인하세요."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
