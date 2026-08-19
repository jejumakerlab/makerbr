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
      description="이메일과 비밀번호로 메이커브릿지에 로그인하세요."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
