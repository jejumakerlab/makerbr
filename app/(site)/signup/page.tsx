import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthState } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/paths";

export const metadata: Metadata = {
  title: "회원가입",
  description: "메이커브릿지 회원가입",
};

export default async function SignupPage({
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
      title="회원가입"
      description="이름, 연락처, 이메일로 계정을 만들고 교육·스토어를 이용하세요."
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
